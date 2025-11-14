import { ChevronUp, ChevronDown } from 'lucide-react';

interface TodoItemReorderButtonsProps {
  todoText: string;
  isFirst: boolean;
  isLast: boolean;
  moveUp?: () => void;
  moveDown?: () => void;
  sanitizeForAriaLabel: (text: string) => string;
}

/**
 * Renders the reorder buttons for a todo item
 * Cognitive complexity: ≤5
 */
export default function TodoItemReorderButtons({
  todoText,
  isFirst,
  isLast,
  moveUp,
  moveDown,
  sanitizeForAriaLabel,
}: TodoItemReorderButtonsProps) {
  if (!moveUp && !moveDown) {
    return null;
  }

  return (
    <div
      role='group'
      aria-label='Reorder todo'
      className='flex items-center gap-0.5 md:gap-1'
    >
      {moveUp && (
        <button
          onClick={moveUp}
          disabled={isFirst}
          className='flex-shrink-0 p-1.5 md:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-muted-foreground hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center'
          aria-label={`Move todo up: ${sanitizeForAriaLabel(todoText)}`}
          type='button'
        >
          <ChevronUp className='h-4 w-4' />
        </button>
      )}
      {moveDown && (
        <button
          onClick={moveDown}
          disabled={isLast}
          className='flex-shrink-0 p-1.5 md:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-muted-foreground hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center'
          aria-label={`Move todo down: ${sanitizeForAriaLabel(todoText)}`}
          type='button'
        >
          <ChevronDown className='h-4 w-4' />
        </button>
      )}
    </div>
  );
}
