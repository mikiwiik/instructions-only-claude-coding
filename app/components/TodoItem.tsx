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

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, newText: string) => void;
  onRestore?: (id: string) => void;
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
  moveUp,
  moveDown,
  isDraggable = false,
  isFirst = false,
  isLast = false,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id, disabled: !isDraggable });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleToggle = () => {
    // Only allow checking (not unchecking) via the checkbox
    if (!todo.completed) {
      onToggle(todo.id);
    }
  };

  const handleRestore = () => {
    if (onRestore && todo.completed) {
      onRestore(todo.id);
    }
  };

  const handleDelete = () => {
    onDelete(todo.id);
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
    if (e.key === 'Enter') {
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
      className='flex items-start gap-3 p-3 bg-background rounded-lg border'
    >
      {isDraggable && (
        <div
          {...attributes}
          {...listeners}
          data-testid='drag-handle'
          role='button'
          tabIndex={0}
          aria-label='Drag to reorder todo'
          className='flex-shrink-0 mt-0.5 p-1 rounded cursor-grab hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors text-muted-foreground hover:text-foreground active:cursor-grabbing'
        >
          <GripVertical className='h-4 w-4' />
        </div>
      )}
      <button
        onClick={handleToggle}
        className={`flex-shrink-0 mt-0.5 p-1 rounded-full transition-colors ${
          todo.completed
            ? 'cursor-default opacity-75'
            : 'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer'
        }`}
        aria-label={`Toggle todo: ${todo.text}`}
        aria-pressed={todo.completed}
        aria-disabled={todo.completed}
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
        {isEditing ? (
          <div className='space-y-2'>
            <input
              ref={inputRef}
              type='text'
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className='w-full text-base bg-background border border-border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-ring'
              aria-label='Edit todo text'
            />
            <div className='flex gap-1'>
              <button
                onClick={handleSave}
                className='flex-shrink-0 p-1 rounded hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-muted-foreground hover:text-green-600'
                aria-label='Save edit'
                type='button'
              >
                <Check className='h-3 w-3' />
              </button>
              <button
                onClick={handleCancel}
                className='flex-shrink-0 p-1 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors text-muted-foreground hover:text-red-600'
                aria-label='Cancel edit'
                type='button'
              >
                <Cancel className='h-3 w-3' />
              </button>
            </div>
          </div>
        ) : (
          <>
            <p
              className={`text-base leading-relaxed ${
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
          </>
        )}
      </div>
      <div className='flex items-center gap-2'>
        {(moveUp || moveDown) && (
          <div
            role='group'
            aria-label='Reorder todo'
            className='flex items-center gap-0.5'
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
          className='flex items-center gap-0.5'
        >
          {todo.completed && onRestore && (
            <button
              onClick={handleRestore}
              className='flex-shrink-0 p-2 rounded-full hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors text-muted-foreground hover:text-yellow-600 min-w-[44px] min-h-[44px] flex items-center justify-center'
              aria-label={`Undo completion: ${todo.text}`}
              type='button'
            >
              <Undo2 className='h-4 w-4' />
            </button>
          )}
          {!isEditing && onEdit && !todo.completed && (
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
        </div>
      </div>
    </li>
  );
}
