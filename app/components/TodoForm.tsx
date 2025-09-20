import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface TodoFormProps {
  onAddTodo: (text: string) => void;
}

export default function TodoForm({ onAddTodo }: TodoFormProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = text.trim();

    if (trimmedText) {
      onAddTodo(trimmedText);
      setText('');
    }
  };

  const isSubmitDisabled = !text.trim();

  return (
    <form onSubmit={handleSubmit} className='mb-6'>
      <div className='flex gap-3'>
        <div className='flex-1'>
          <label htmlFor='todo-input' className='sr-only'>
            Add new todo
          </label>
          <input
            ref={inputRef}
            id='todo-input'
            type='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='What needs to be done?'
            className='w-full px-4 py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground'
            aria-label='Add new todo'
          />
        </div>
        <button
          type='submit'
          disabled={isSubmitDisabled}
          className='inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          aria-label='Add todo'
        >
          <Plus className='h-4 w-4' />
          Add Todo
        </button>
      </div>
    </form>
  );
}
