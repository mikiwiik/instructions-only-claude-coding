import { Circle, CheckCircle, GripVertical } from 'lucide-react';
import { RefObject } from 'react';

interface TodoItemCheckboxProps {
  todoText: string;
  isCompleted: boolean;
  isDraggable: boolean;
  dragHandleRef: RefObject<HTMLDivElement | null>;
  onToggle: () => void;
  sanitizeForAriaLabel: (text: string) => string;
}

/**
 * Renders the checkbox and optional drag handle for a todo item
 * Cognitive complexity: ≤5
 */
export default function TodoItemCheckbox({
  todoText,
  isCompleted,
  isDraggable,
  dragHandleRef,
  onToggle,
  sanitizeForAriaLabel,
}: TodoItemCheckboxProps) {
  return (
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
        onClick={onToggle}
        className={`flex-shrink-0 p-1.5 sm:p-2 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
          isCompleted
            ? 'cursor-default opacity-75'
            : 'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer'
        }`}
        aria-label={`Toggle todo: ${sanitizeForAriaLabel(todoText)}`}
        aria-pressed={isCompleted}
        aria-disabled={isCompleted}
        type='button'
      >
        {isCompleted ? (
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
  );
}
