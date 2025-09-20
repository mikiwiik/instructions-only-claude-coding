import { Circle } from 'lucide-react';
import { Todo } from '../types/todo';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className='text-center py-12'>
        <Circle
          className='h-16 w-16 text-muted-foreground mx-auto mb-4'
          data-testid='empty-state-icon'
        />
        <h3 className='text-lg font-medium text-card-foreground mb-2'>
          No todos yet
        </h3>
        <p className='text-muted-foreground'>
          Add your first todo above to get started!
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <h3 className='text-lg font-medium text-card-foreground mb-4'>
        Your Todos ({todos.length})
      </h3>
      <ul className='space-y-3' role='list'>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
}
