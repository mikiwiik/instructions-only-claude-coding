import { Circle, CheckCircle } from 'lucide-react';
import { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
}

export default function TodoItem({ todo, onToggle }: TodoItemProps) {
  const handleToggle = () => {
    onToggle(todo.id);
  };

  return (
    <li
      role='listitem'
      className='flex items-start gap-3 p-3 bg-background rounded-lg border'
    >
      <button
        onClick={handleToggle}
        className='flex-shrink-0 mt-0.5 p-1 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors'
        aria-label={`Toggle todo: ${todo.text}`}
        aria-pressed={todo.completed}
        type='button'
      >
        {todo.completed ? (
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
      <div className='flex-1 min-w-0'>
        <p
          className={`text-sm ${
            todo.completed
              ? 'line-through text-muted-foreground'
              : 'text-foreground'
          }`}
        >
          {todo.text}
        </p>
        <p className='text-xs text-muted-foreground mt-1'>
          Added {todo.createdAt.toLocaleDateString()} at{' '}
          {todo.createdAt.toLocaleTimeString()}
        </p>
      </div>
    </li>
  );
}
