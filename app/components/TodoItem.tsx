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
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Todo } from '../types/todo';
import { getContextualTimestamp, getFullTimestamp } from '../utils/timestamp';
import ConfirmationDialog from './ConfirmationDialog';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id, disabled: !isDraggable });

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      role='listitem'
      className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border fade-in ${
        todo.deletedAt ? 'bg-muted border-dashed opacity-75' : 'bg-background'
      }`}
    >
      <div className='flex flex-col md:flex-row items-center gap-1 md:gap-2'>
        {isDraggable && (
          <div
            {...attributes}
            {...listeners}
            data-testid='drag-handle'
            role='button'
            tabIndex={0}
            aria-label='Drag to reorder todo'
            className='flex-shrink-0 p-2 rounded cursor-grab hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors text-muted-foreground hover:text-foreground active:cursor-grabbing min-w-[44px] min-h-[44px] flex items-center justify-center'
          >
            <GripVertical className='h-4 w-4' />
          </div>
        )}
        <button
          onClick={handleToggle}
          className={`flex-shrink-0 p-2 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
            todo.completedAt
              ? 'cursor-default opacity-75'
              : 'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer'
          }`}
          aria-label={`Toggle todo: ${todo.text}`}
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
          <div className='space-y-2'>
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className='w-full text-sm sm:text-base bg-background border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring resize-none overflow-hidden min-h-[2.5rem]'
              aria-label='Edit todo text'
              rows={1}
            />
            <div className='flex gap-2'>
              <button
                onClick={handleSave}
                className='flex-shrink-0 p-2 rounded hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-muted-foreground hover:text-green-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
                aria-label='Save edit'
                type='button'
              >
                <Check className='h-4 w-4' />
              </button>
              <button
                onClick={handleCancel}
                className='flex-shrink-0 p-2 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-muted-foreground hover:text-red-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
                aria-label='Cancel edit'
                type='button'
              >
                <Cancel className='h-4 w-4' />
              </button>
            </div>
          </div>
        ) : (
          <>
            <p
              className={`text-sm sm:text-base leading-relaxed whitespace-pre-line break-words ${
                todo.completedAt
                  ? 'line-through text-muted-foreground'
                  : 'text-foreground'
              }`}
            >
              {todo.text}
            </p>
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
            className='flex items-center gap-1'
          >
            {moveUp && (
              <button
                onClick={handleMoveUp}
                disabled={isFirst}
                className='flex-shrink-0 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-muted-foreground hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center'
                aria-label={`Move todo up: ${todo.text}`}
                type='button'
              >
                <ChevronUp className='h-4 w-4' />
              </button>
            )}
            {moveDown && (
              <button
                onClick={handleMoveDown}
                disabled={isLast}
                className='flex-shrink-0 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-muted-foreground hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center'
                aria-label={`Move todo down: ${todo.text}`}
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
          className='flex items-center gap-1'
        >
          {todo.deletedAt ? (
            // Actions for deleted todos
            <>
              {onRestoreDeleted && (
                <button
                  onClick={handleRestoreDeleted}
                  className='flex-shrink-0 p-2 rounded-full hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-muted-foreground hover:text-green-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
                  aria-label={`Restore todo: ${todo.text}`}
                  type='button'
                >
                  <Undo2 className='h-4 w-4' />
                </button>
              )}
              <button
                onClick={handleDelete}
                className='flex-shrink-0 p-2 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-muted-foreground hover:text-red-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
                aria-label={`Permanently delete todo: ${todo.text}`}
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
                  className='flex-shrink-0 p-2 rounded-full hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors text-muted-foreground hover:text-yellow-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
                  aria-label={`Undo completion: ${todo.text}`}
                  type='button'
                >
                  <Undo2 className='h-4 w-4' />
                </button>
              )}
              {!isEditing && onEdit && !todo.completedAt && (
                <button
                  onClick={handleEdit}
                  className='flex-shrink-0 p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-muted-foreground hover:text-blue-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
                  aria-label={`Edit todo: ${todo.text}`}
                  type='button'
                >
                  <Edit2 className='h-4 w-4' />
                </button>
              )}
              <button
                onClick={handleDelete}
                className='flex-shrink-0 p-2 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-muted-foreground hover:text-red-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
                aria-label={`Delete todo: ${todo.text}`}
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
            ? `Are you sure you want to permanently delete "${todo.text.length > 100 ? todo.text.substring(0, 100) + '...' : todo.text}"? This action cannot be undone.`
            : `Are you sure you want to delete "${todo.text.length > 100 ? todo.text.substring(0, 100) + '...' : todo.text}"? You can restore it from Recently Deleted.`
        }
        confirmLabel={todo.deletedAt ? 'Permanently Delete' : 'Delete'}
        cancelLabel='Cancel'
        variant='destructive'
      />
    </li>
  );
}
