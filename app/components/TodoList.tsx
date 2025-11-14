import { Circle } from 'lucide-react';
import { useEffect } from 'react';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Todo } from '../types/todo';
import TodoItem from './TodoItem';
import GestureHint from './GestureHint';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, newText: string) => void;
  onRestore?: (id: string) => void;
  onPermanentlyDelete?: (id: string) => void;
  onRestoreDeleted?: (id: string) => void;
  reorderTodos?: (sourceIndex: number, destinationIndex: number) => void;
  moveUp?: (id: string) => void;
  moveDown?: (id: string) => void;
}

export default function TodoList({
  todos,
  onToggle,
  onDelete,
  onEdit,
  onRestore,
  onPermanentlyDelete,
  onRestoreDeleted,
  reorderTodos,
  moveUp,
  moveDown,
}: TodoListProps) {
  const isReorderingEnabled = Boolean(reorderTodos);

  // Setup drag monitoring with pragmatic-drag-and-drop
  useEffect(() => {
    if (!isReorderingEnabled) {
      return;
    }

    return monitorForElements({
      onDrop({ source, location }) {
        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }

        const sourceData = source.data;
        const targetData = target.data;

        if (
          sourceData.type === 'todo-item' &&
          targetData.todoId &&
          sourceData.todoId !== targetData.todoId &&
          reorderTodos
        ) {
          const sourceId = sourceData.todoId as string;
          const targetId = targetData.todoId as string;

          const oldIndex = todos.findIndex((todo) => todo.id === sourceId);
          const newIndex = todos.findIndex((todo) => todo.id === targetId);

          if (oldIndex !== -1 && newIndex !== -1) {
            reorderTodos(oldIndex, newIndex);
          }
        }
      },
    });
  }, [isReorderingEnabled, todos, reorderTodos]);

  if (todos.length === 0) {
    return (
      <div className='text-center py-8 md:py-12'>
        <Circle
          className='h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-3 md:mb-4'
          data-testid='empty-state-icon'
        />
        <h3 className='text-base md:text-lg font-medium text-card-foreground mb-2'>
          No todos yet
        </h3>
        <p className='text-sm md:text-base text-muted-foreground px-4'>
          Add your first todo above to get started!
        </p>
      </div>
    );
  }

  const todosList = (
    <ul className='space-y-0 md:space-y-3'>
      {todos.map((todo, index) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onRestore={onRestore}
          onPermanentlyDelete={onPermanentlyDelete}
          onRestoreDeleted={onRestoreDeleted}
          moveUp={moveUp}
          moveDown={moveDown}
          isDraggable={isReorderingEnabled}
          isFirst={index === 0}
          isLast={index === todos.length - 1}
        />
      ))}
    </ul>
  );

  return (
    <>
      <div className='space-y-2'>
        <h3 className='text-base md:text-lg font-medium text-card-foreground mb-3 md:mb-4'>
          Your Todos ({todos.length})
        </h3>
        {todosList}
      </div>
      <GestureHint />
    </>
  );
}
