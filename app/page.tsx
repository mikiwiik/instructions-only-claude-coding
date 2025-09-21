'use client';

import { CheckSquare } from 'lucide-react';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import { useTodos } from './hooks/useTodos';

export default function HomePage() {
  const {
    todos,
    addTodo,
    toggleTodo,
    restoreTodo,
    deleteTodo,
    editTodo,
    reorderTodos,
    moveUp,
    moveDown,
  } = useTodos();

  return (
    <div className='max-w-4xl mx-auto'>
      <header className='text-center mb-8'>
        <div className='flex items-center justify-center gap-3 mb-4'>
          <CheckSquare className='h-8 w-8 text-primary' />
          <h1 className='text-4xl font-bold text-foreground'>Todo App</h1>
        </div>
        <p className='text-muted-foreground text-lg'>
          A Next.js Todo application built with Test-Driven Development
        </p>
        <p className='text-muted-foreground text-sm mt-2'>
          Powered by Claude Code
        </p>
      </header>

      <div className='bg-card border rounded-lg p-6 shadow-sm'>
        <TodoForm onAddTodo={addTodo} />
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onEdit={editTodo}
          onRestore={restoreTodo}
          reorderTodos={reorderTodos}
          moveUp={moveUp}
          moveDown={moveDown}
        />
      </div>

      <footer className='text-center mt-8 text-sm text-muted-foreground'>
        <p>
          Built with ❤️ using{' '}
          <a
            href='https://claude.ai/code'
            className='text-primary hover:underline'
            target='_blank'
            rel='noopener noreferrer'
          >
            Claude Code
          </a>
        </p>
      </footer>
    </div>
  );
}
