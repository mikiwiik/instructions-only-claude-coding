import { useState, useRef, useEffect } from 'react';
import { Todo } from '../types/todo';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { useLongPress } from '../hooks/useLongPress';
import { useTodoItemDragAndDrop } from '../hooks/useTodoItemDragAndDrop';
import { combineTouchHandlers } from '../utils/touchHandlers';
import TodoItemContent from './TodoItemContent';
import TodoItemActions from './TodoItemActions';
import TodoItemReorderButtons from './TodoItemReorderButtons';
import TodoItemCheckbox from './TodoItemCheckbox';
import ConfirmationDialog from './ConfirmationDialog';

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

/**
 * Builds the className for a todo item
 * Complexity: ≤5
 */
function buildTodoItemClassName(
  isFirst: boolean,
  isDeleted: boolean,
  isDragging: boolean
): string {
  const borderTopClass = isFirst ? 'border-t-0' : 'border-t';
  const stateClass = isDeleted
    ? 'bg-muted border-dashed opacity-75'
    : 'bg-background';
  const draggingClass = isDragging ? 'opacity-50' : '';

  return [
    'flex items-start gap-2 sm:gap-3 p-2 sm:p-4 rounded-none sm:rounded-lg',
    borderTopClass,
    'border-x-0 sm:border sm:border-t border-b-0 sm:border-b fade-in transition-transform',
    stateClass,
    draggingClass,
  ].join(' ');
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
  const itemRef = useRef<HTMLLIElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Setup drag and drop
  const { isDragging } = useTodoItemDragAndDrop({
    todoId: todo.id,
    isDraggable,
    itemRef,
    dragHandleRef,
  });

  // Swipe gesture handlers
  const swipeGesture = useSwipeGesture({
    onSwipeRight: () => {
      if (todo.completedAt || todo.deletedAt) return;
      onToggle(todo.id);
    },
    onSwipeLeft: () => {
      if (todo.deletedAt) return;
      handleDelete();
    },
  });

  // Long press gesture handler
  const longPressGesture = useLongPress({
    onLongPress: () => {
      if (isEditing || !onEdit || todo.completedAt || todo.deletedAt) return;
      handleEdit();
    },
    delay: 500,
    shouldPreventDefault: false,
  });

  // Auto-resize and focus textarea
  useEffect(() => {
    if (!isEditing || !textareaRef.current) return;

    textareaRef.current.focus();
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [isEditing, editText]);

  // Only allow checking (not unchecking) via the checkbox
  const handleToggle = () => !todo.completedAt && onToggle(todo.id);

  const handleRestore = () => onRestore?.(todo.id);
  const handleRestoreDeleted = () => onRestoreDeleted?.(todo.id);

  const handleDelete = () => setShowDeleteConfirm(true);

  const handleConfirmDelete = () => {
    const deleteHandler = todo.deletedAt ? onPermanentlyDelete : onDelete;
    deleteHandler?.(todo.id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => setShowDeleteConfirm(false);

  const handleEdit = () => {
    setEditText(todo.text);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedText = editText.trim();
    if (!trimmedText || !onEdit) return;

    onEdit(todo.id, trimmedText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return handleCancel();
    if (e.key !== 'Enter' || e.shiftKey) return;

    e.preventDefault();
    handleSave();
  };

  const handleMoveUp = () => !isFirst && moveUp?.(todo.id);
  const handleMoveDown = () => !isLast && moveDown?.(todo.id);

  // Combine gesture handlers for touch events
  const touchHandlers = combineTouchHandlers(swipeGesture, longPressGesture);

  // Build item className
  const itemClassName = buildTodoItemClassName(
    isFirst,
    !!todo.deletedAt,
    isDragging
  );

  // Dialog configuration
  const truncatedText =
    todo.text.length > 100 ? todo.text.substring(0, 100) + '...' : todo.text;
  const sanitizedText = sanitizeForAriaLabel(truncatedText);

  const dialogTitle = todo.deletedAt
    ? 'Permanently Delete Todo'
    : 'Delete Todo';
  const dialogMessage = todo.deletedAt
    ? `Are you sure you want to permanently delete "${sanitizedText}"? This action cannot be undone.`
    : `Are you sure you want to delete "${sanitizedText}"? You can restore it from Recently Deleted.`;
  const dialogConfirmLabel = todo.deletedAt ? 'Permanently Delete' : 'Delete';

  return (
    <li ref={itemRef} className={itemClassName} {...touchHandlers}>
      <TodoItemCheckbox
        todoText={todo.text}
        isCompleted={!!todo.completedAt}
        isDraggable={isDraggable}
        dragHandleRef={dragHandleRef}
        onToggle={handleToggle}
        sanitizeForAriaLabel={sanitizeForAriaLabel}
      />
      <div className='flex-1 min-w-0'>
        <TodoItemContent
          todo={todo}
          isEditing={isEditing}
          editText={editText}
          textareaRef={textareaRef}
          onEditTextChange={setEditText}
          onSave={handleSave}
          onCancel={handleCancel}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className='flex flex-col md:flex-row items-center gap-1 md:gap-2'>
        <TodoItemReorderButtons
          todoText={todo.text}
          isFirst={isFirst}
          isLast={isLast}
          moveUp={moveUp ? handleMoveUp : undefined}
          moveDown={moveDown ? handleMoveDown : undefined}
          sanitizeForAriaLabel={sanitizeForAriaLabel}
        />
        <TodoItemActions
          todo={todo}
          isEditing={isEditing}
          onEdit={onEdit ? handleEdit : undefined}
          onDelete={handleDelete}
          onRestore={onRestore ? handleRestore : undefined}
          onRestoreDeleted={onRestoreDeleted ? handleRestoreDeleted : undefined}
          sanitizeForAriaLabel={sanitizeForAriaLabel}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title={dialogTitle}
        message={dialogMessage}
        confirmLabel={dialogConfirmLabel}
        cancelLabel='Cancel'
        variant='destructive'
      />
    </li>
  );
}
