import {
  Circle,
  CheckCircle,
  X,
  Edit2,
  Check,
  X as Cancel,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Undo2,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Todo } from '../types/todo';
import { getContextualTimestamp, getFullTimestamp } from '../utils/timestamp';
import {
  hasMarkdownSyntax,
  sanitizeMarkdown,
  markdownConfig,
} from '../utils/markdown';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { useLongPress } from '../hooks/useLongPress';

// Helper function to decode HTML entities
const decodeHtmlEntities = (text: string): string => {
  return text
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#34;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#40;/gi, '(')
    .replace(/&#41;/gi, ')')
    .replace(/&#60;/gi, '<')
    .replace(/&#62;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&#(\d+);/gi, (match, dec) =>
      String.fromCharCode(parseInt(dec, 10))
    )
    .replace(/&#x([0-9a-f]+);/gi, (match, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
};

// Helper function to sanitize text for use in aria-labels and dialog messages
const sanitizeForAriaLabel = (text: string): string => {
  // First decode any URL encoding and HTML entities to catch encoded attacks
  let decoded = text;
  try {
    decoded = decodeURIComponent(text);
  } catch {
    // If decoding fails, use original text
    decoded = text;
  }

  // Also decode HTML entities
  decoded = decodeHtmlEntities(decoded);

  return decoded
    .replace(/<script[^>]*>.*?<\/script>/gi, '[removed]')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '[removed]')
    .replace(/<object[^>]*>.*?<\/object>/gi, '[removed]')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '[removed]')
    .replace(/<form[^>]*>.*?<\/form>/gi, '[removed]')
    .replace(/javascript:/gi, '[removed]:')
    .replace(/data:/gi, '[removed]:')
    .replace(/vbscript:/gi, '[removed]:')
    .replace(/file:/gi, '[removed]:')
    .replace(/ftp:/gi, '[removed]:')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '[removed]')
    .replace(/on\w+\s*=/gi, '[removed]=')
    .replace(/style\s*=\s*["'][^"']*["']/gi, '[removed]')
    .replace(/alert\s*\(/gi, '[removed](')
    .replace(/eval\s*\(/gi, '[removed](')
    .replace(/document\./gi, '[removed].')
    .replace(/window\./gi, '[removed].')
    .replace(/[<>]/g, '')
    .trim();
};
import ConfirmationDialog from './ConfirmationDialog';
import MarkdownHelpBox from './MarkdownHelpBox';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, newText: string) => void;
  onRestore?: (id: string) => void;
  onPermanentlyDelete?: (id: string) => void;
  onRestoreDeleted?: (id: string) => void;
  moveUp?: (id: string) => void;
  moveDown?: (id: string) => void;
  isDraggable?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  onRestore,
  onPermanentlyDelete,
  onRestoreDeleted,
  moveUp,
  moveDown,
  isDraggable = false,
  isFirst = false,
  isLast = false,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const itemRef = useRef<HTMLLIElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Setup drag and drop with pragmatic-drag-and-drop
  useEffect(() => {
    const itemEl = itemRef.current;
    const dragHandleEl = dragHandleRef.current;

    if (!itemEl || !isDraggable) {
      return;
    }

    return combine(
      draggable({
        element: itemEl,
        dragHandle: dragHandleEl || undefined,
        getInitialData: () => ({ type: 'todo-item', todoId: todo.id }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element: itemEl,
        getData: () => ({ todoId: todo.id }),
      })
    );
  }, [todo.id, isDraggable]);

  // Swipe gesture handlers
  const swipeGesture = useSwipeGesture({
    onSwipeRight: () => {
      if (!todo.completedAt && !todo.deletedAt) {
        onToggle(todo.id);
      }
    },
    onSwipeLeft: () => {
      if (!todo.deletedAt) {
        handleDelete();
      }
    },
  });

  // Long press gesture handler
  const longPressGesture = useLongPress({
    onLongPress: () => {
      if (!isEditing && onEdit && !todo.completedAt && !todo.deletedAt) {
        handleEdit();
      }
    },
    delay: 500,
    shouldPreventDefault: false,
  });

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Auto-resize textarea based on content
  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (isEditing) {
      autoResize();
    }
  }, [editText, isEditing]);

  const handleToggle = () => {
    // Only allow checking (not unchecking) via the checkbox
    if (!todo.completedAt) {
      onToggle(todo.id);
    }
  };

  const handleRestore = () => {
    if (onRestore && todo.completedAt) {
      onRestore(todo.id);
    }
  };

  const handleRestoreDeleted = () => {
    if (onRestoreDeleted && todo.deletedAt) {
      onRestoreDeleted(todo.id);
    }
  };

  const handlePermanentlyDelete = () => {
    if (onPermanentlyDelete) {
      onPermanentlyDelete(todo.id);
    }
    setShowDeleteConfirm(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (todo.deletedAt && onPermanentlyDelete) {
      // Permanently delete already soft-deleted todos
      handlePermanentlyDelete();
    } else {
      // Soft delete active todos
      onDelete(todo.id);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleEdit = () => {
    setEditText(todo.text);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedText = editText.trim();
    if (trimmedText && onEdit) {
      onEdit(todo.id, trimmedText);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleMoveUp = () => {
    if (moveUp && !isFirst) {
      moveUp(todo.id);
    }
  };

  const handleMoveDown = () => {
    if (moveDown && !isLast) {
      moveDown(todo.id);
    }
  };

  // Combine gesture handlers for touch events
  const touchHandlers = {
    onTouchStart: (e: React.TouchEvent) => {
      swipeGesture.onTouchStart(e);
      longPressGesture.onTouchStart(e);
    },
    onTouchMove: (e: React.TouchEvent) => {
      swipeGesture.onTouchMove(e);
      longPressGesture.onTouchMove();
    },
    onTouchEnd: () => {
      swipeGesture.onTouchEnd();
      longPressGesture.onTouchEnd();
    },
  };

  return (
    <li
      ref={itemRef}
      className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-4 rounded-none sm:rounded-lg ${
        isFirst ? 'border-t-0' : 'border-t'
      } border-x-0 sm:border sm:border-t border-b-0 sm:border-b fade-in transition-transform ${
        todo.deletedAt ? 'bg-muted border-dashed opacity-75' : 'bg-background'
      } ${isDragging ? 'opacity-50' : ''}`}
      {...touchHandlers}
    >
      <div className='flex flex-col md:flex-row items-center gap-1 md:gap-2'>
        {isDraggable && (
          <div
            ref={dragHandleRef}
            data-testid='drag-handle'
            role='button'
            tabIndex={0}
            aria-label='Drag to reorder todo'
            className='flex-shrink-0 p-1.5 sm:p-2 rounded cursor-grab hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors text-muted-foreground hover:text-foreground active:cursor-grabbing min-w-[44px] min-h-[44px] flex items-center justify-center'
          >
            <GripVertical className='h-4 w-4' />
          </div>
        )}
        <button
          onClick={handleToggle}
          className={`flex-shrink-0 p-1.5 sm:p-2 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
            todo.completedAt
              ? 'cursor-default opacity-75'
              : 'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer'
          }`}
          aria-label={`Toggle todo: ${sanitizeForAriaLabel(todo.text)}`}
          aria-pressed={!!todo.completedAt}
          aria-disabled={!!todo.completedAt}
          type='button'
        >
          {todo.completedAt ? (
            <CheckCircle
              className='h-5 w-5 text-green-500'
              data-testid='completed-icon'
            />
          ) : (
            <Circle
              className='h-5 w-5 text-muted-foreground'
              data-testid='incomplete-icon'
            />
          )}
        </button>
      </div>
      <div className='flex-1 min-w-0'>
        {isEditing ? (
          <div className='space-y-3'>
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className='w-full text-base bg-background border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring resize-none overflow-hidden min-h-[2.5rem]'
              aria-label='Edit todo text'
              rows={1}
              placeholder='Enter your todo text... (Markdown formatting supported)'
            />
            <MarkdownHelpBox className='mt-2' />
            <div className='flex gap-1 sm:gap-2'>
              <button
                onClick={handleSave}
                className='flex-shrink-0 p-1.5 sm:p-2 rounded hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-muted-foreground hover:text-green-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
                aria-label='Save edit'
                type='button'
              >
                <Check className='h-4 w-4' />
              </button>
              <button
                onClick={handleCancel}
                className='flex-shrink-0 p-1.5 sm:p-2 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-muted-foreground hover:text-red-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
                aria-label='Cancel edit'
                type='button'
              >
                <Cancel className='h-4 w-4' />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`text-sm sm:text-base leading-relaxed break-words ${
                todo.completedAt
                  ? 'line-through text-muted-foreground'
                  : 'text-foreground'
              }`}
            >
              {hasMarkdownSyntax(todo.text) ? (
                <div data-testid='markdown-content'>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={markdownConfig.components}
                    disallowedElements={markdownConfig.disallowedElements}
                    unwrapDisallowed={markdownConfig.unwrapDisallowed}
                  >
                    {sanitizeMarkdown(todo.text)}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className='whitespace-pre-line'>
                  {sanitizeMarkdown(todo.text)}
                </p>
              )}
            </div>
            <p
              className='text-xs text-muted-foreground mt-1 sm:mt-2'
              title={getFullTimestamp(todo)}
            >
              {getContextualTimestamp(todo)}
            </p>
          </>
        )}
      </div>
      <div className='flex flex-col md:flex-row items-center gap-1 md:gap-2'>
        {(moveUp || moveDown) && (
          <div
            role='group'
            aria-label='Reorder todo'
            className='flex items-center gap-0.5 sm:gap-1'
          >
            {moveUp && (
              <button
                onClick={handleMoveUp}
                disabled={isFirst}
                className='flex-shrink-0 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-muted-foreground hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center'
                aria-label={`Move todo up: ${sanitizeForAriaLabel(todo.text)}`}
                type='button'
              >
                <ChevronUp className='h-4 w-4' />
              </button>
            )}
            {moveDown && (
              <button
                onClick={handleMoveDown}
                disabled={isLast}
                className='flex-shrink-0 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-muted-foreground hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center'
                aria-label={`Move todo down: ${sanitizeForAriaLabel(todo.text)}`}
                type='button'
              >
                <ChevronDown className='h-4 w-4' />
              </button>
            )}
          </div>
        )}
        <div
          role='group'
          aria-label='Todo actions'
          className='flex items-center gap-0.5 sm:gap-1'
        >
          {todo.deletedAt ? (
            // Actions for deleted todos
            <>
              {onRestoreDeleted && (
                <button
                  onClick={handleRestoreDeleted}
                  className='flex-shrink-0 p-1.5 sm:p-2 rounded-full hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-muted-foreground hover:text-green-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
                  aria-label={`Restore todo: ${sanitizeForAriaLabel(todo.text)}`}
                  type='button'
                >
                  <Undo2 className='h-4 w-4' />
                </button>
              )}
              <button
                onClick={handleDelete}
                className='flex-shrink-0 p-1.5 sm:p-2 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-muted-foreground hover:text-red-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
                aria-label={`Permanently delete todo: ${sanitizeForAriaLabel(todo.text)}`}
                type='button'
              >
                <X className='h-4 w-4' />
              </button>
            </>
          ) : (
            // Actions for active todos
            <>
              {todo.completedAt && onRestore && (
                <button
                  onClick={handleRestore}
                  className='flex-shrink-0 p-1.5 sm:p-2 rounded-full hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors text-muted-foreground hover:text-yellow-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
                  aria-label={`Undo completion: ${sanitizeForAriaLabel(todo.text)}`}
                  type='button'
                >
                  <Undo2 className='h-4 w-4' />
                </button>
              )}
              {!isEditing && onEdit && !todo.completedAt && (
                <button
                  onClick={handleEdit}
                  className='flex-shrink-0 p-1.5 sm:p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-muted-foreground hover:text-blue-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
                  aria-label={`Edit todo: ${sanitizeForAriaLabel(todo.text)}`}
                  type='button'
                >
                  <Edit2 className='h-4 w-4' />
                </button>
              )}
              <button
                onClick={handleDelete}
                className='flex-shrink-0 p-1.5 sm:p-2 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-muted-foreground hover:text-red-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
                aria-label={`Delete todo: ${sanitizeForAriaLabel(todo.text)}`}
                type='button'
              >
                <X className='h-4 w-4' />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={todo.deletedAt ? 'Permanently Delete Todo' : 'Delete Todo'}
        message={
          todo.deletedAt
            ? `Are you sure you want to permanently delete "${sanitizeForAriaLabel(todo.text.length > 100 ? todo.text.substring(0, 100) + '...' : todo.text)}"? This action cannot be undone.`
            : `Are you sure you want to delete "${sanitizeForAriaLabel(todo.text.length > 100 ? todo.text.substring(0, 100) + '...' : todo.text)}"? You can restore it from Recently Deleted.`
        }
        confirmLabel={todo.deletedAt ? 'Permanently Delete' : 'Delete'}
        cancelLabel='Cancel'
        variant='destructive'
      />
    </li>
  );
}
