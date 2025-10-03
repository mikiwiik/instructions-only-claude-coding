import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface TodoFormProps {
  onAddTodo: (text: string) => void;
}

export default function TodoForm({ onAddTodo }: TodoFormProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea on mount and auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Auto-resize textarea based on content
  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedText = text.trim();

    if (trimmedText) {
      onAddTodo(trimmedText);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isSubmitDisabled = !text.trim();

  return (
    <form onSubmit={handleSubmit} className='mb-4 sm:mb-6'>
      <div className='flex flex-col md:flex-row md:items-start gap-3'>
        <div className='flex-1'>
          <label htmlFor='todo-input' className='sr-only'>
            Add new todo
          </label>
          <textarea
            ref={textareaRef}
            id='todo-input'
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='What needs to be done?'
            className='w-full px-3 sm:px-4 py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground resize-none overflow-hidden min-h-[3rem] text-base'
            aria-label='Add new todo'
            rows={1}
          />
        </div>
        <button
          type='submit'
          disabled={isSubmitDisabled}
          className='inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[3rem] text-sm sm:text-base whitespace-nowrap'
          aria-label='Add todo'
        >
          <Plus className='h-4 w-4' />
          <span className='hidden md:inline'>Add Todo</span>
          <span className='md:hidden'>Add</span>
        </button>
      </div>
    </form>
  );
}
