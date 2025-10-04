import { Circle } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isReorderingEnabled = Boolean(reorderTodos);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && reorderTodos) {
      const oldIndex = todos.findIndex((todo) => todo.id === active.id);
      const newIndex = todos.findIndex((todo) => todo.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderTodos(oldIndex, newIndex);
      }
    }
  };

  if (todos.length === 0) {
    return (
      <div className='text-center py-8 sm:py-12'>
        <Circle
          className='h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4'
          data-testid='empty-state-icon'
        />
        <h3 className='text-base sm:text-lg font-medium text-card-foreground mb-2'>
          No todos yet
        </h3>
        <p className='text-sm sm:text-base text-muted-foreground px-4'>
          Add your first todo above to get started!
        </p>
      </div>
    );
  }

  const todosList = (
    <ul className='space-y-0 sm:space-y-3'>
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
        <h3 className='text-base sm:text-lg font-medium text-card-foreground mb-3 sm:mb-4'>
          Your Todos ({todos.length})
        </h3>
        {isReorderingEnabled ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={todos.map((todo) => todo.id)}
              strategy={verticalListSortingStrategy}
            >
              {todosList}
            </SortableContext>
          </DndContext>
        ) : (
          todosList
        )}
      </div>
      <GestureHint />
    </>
  );
}
