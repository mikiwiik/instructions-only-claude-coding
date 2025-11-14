import { X, Edit2, Undo2 } from 'lucide-react';
import { Todo } from '../types/todo';

interface TodoItemActionsProps {
  todo: Todo;
  isEditing: boolean;
  onEdit?: () => void;
  onDelete: () => void;
  onRestore?: () => void;
  onRestoreDeleted?: () => void;
  sanitizeForAriaLabel: (text: string) => string;
}

/**
 * Renders the action buttons for a todo item
 * Cognitive complexity: ≤10
 */
export default function TodoItemActions({
  todo,
  isEditing,
  onEdit,
  onDelete,
  onRestore,
  onRestoreDeleted,
  sanitizeForAriaLabel,
}: TodoItemActionsProps) {
  if (todo.deletedAt) {
    return (
      <div
        role='group'
        aria-label='Todo actions'
        className='flex items-center gap-0.5 md:gap-1'
      >
        {onRestoreDeleted && (
          <button
            onClick={onRestoreDeleted}
            className='flex-shrink-0 p-1.5 md:p-2 rounded-full hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-muted-foreground hover:text-green-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
            aria-label={`Restore todo: ${sanitizeForAriaLabel(todo.text)}`}
            type='button'
          >
            <Undo2 className='h-4 w-4' />
          </button>
        )}
        <button
          onClick={onDelete}
          className='flex-shrink-0 p-1.5 md:p-2 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-muted-foreground hover:text-red-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
          aria-label={`Permanently delete todo: ${sanitizeForAriaLabel(todo.text)}`}
          type='button'
        >
          <X className='h-4 w-4' />
        </button>
      </div>
    );
  }

  return (
    <div
      role='group'
      aria-label='Todo actions'
      className='flex items-center gap-0.5 md:gap-1'
    >
      {todo.completedAt && onRestore && (
        <button
          onClick={onRestore}
          className='flex-shrink-0 p-1.5 md:p-2 rounded-full hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors text-muted-foreground hover:text-yellow-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
          aria-label={`Undo completion: ${sanitizeForAriaLabel(todo.text)}`}
          type='button'
        >
          <Undo2 className='h-4 w-4' />
        </button>
      )}
      {!isEditing && onEdit && !todo.completedAt && (
        <button
          onClick={onEdit}
          className='flex-shrink-0 p-1.5 md:p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-muted-foreground hover:text-blue-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
          aria-label={`Edit todo: ${sanitizeForAriaLabel(todo.text)}`}
          type='button'
        >
          <Edit2 className='h-4 w-4' />
        </button>
      )}
      <button
        onClick={onDelete}
        className='flex-shrink-0 p-1.5 md:p-2 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-muted-foreground hover:text-red-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
        aria-label={`Delete todo: ${sanitizeForAriaLabel(todo.text)}`}
        type='button'
      >
        <X className='h-4 w-4' />
      </button>
    </div>
  );
}
