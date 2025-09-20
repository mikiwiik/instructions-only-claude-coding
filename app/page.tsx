'use client';

import { CheckSquare, Circle, CheckCircle } from 'lucide-react';
import TodoForm from './components/TodoForm';
import { useTodos } from './hooks/useTodos';

export default function HomePage() {
  const { todos, addTodo } = useTodos();

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

        {todos.length === 0 ? (
          <div className='text-center py-12'>
            <Circle className='h-16 w-16 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-medium text-card-foreground mb-2'>
              No todos yet
            </h3>
            <p className='text-muted-foreground'>
              Add your first todo above to get started!
            </p>
          </div>
        ) : (
          <div className='space-y-2'>
            <h3 className='text-lg font-medium text-card-foreground mb-4'>
              Your Todos ({todos.length})
            </h3>
            <ul className='space-y-3'>
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className='flex items-start gap-3 p-3 bg-background rounded-lg border'
                >
                  <div className='flex-shrink-0 mt-0.5'>
                    {todo.completed ? (
                      <CheckCircle className='h-5 w-5 text-green-500' />
                    ) : (
                      <Circle className='h-5 w-5 text-muted-foreground' />
                    )}
                  </div>
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
              ))}
            </ul>
          </div>
        )}
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
