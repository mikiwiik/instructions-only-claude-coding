'use client';

import { CheckSquare } from 'lucide-react';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import TodoFilter from './components/TodoFilter';
import ActivityTimeline from './components/ActivityTimeline';
import { useTodos } from './hooks/useTodos';
import { getActivityCount } from './utils/activity';

export default function HomePage() {
  const {
    todos,
    allTodos,
    filter,
    addTodo,
    toggleTodo,
    restoreTodo,
    deleteTodo,
    permanentlyDeleteTodo,
    restoreDeletedTodo,
    editTodo,
    reorderTodos,
    moveUp,
    moveDown,
    setFilter,
  } = useTodos();

  // Calculate counts for filter display
  const activeTodosCount = allTodos.filter(
    (todo) => !todo.completedAt && !todo.deletedAt
  ).length;
  const completedTodosCount = allTodos.filter(
    (todo) => todo.completedAt && !todo.deletedAt
  ).length;
  const deletedTodosCount = allTodos.filter((todo) => todo.deletedAt).length;
  const activityCount = getActivityCount(allTodos);

  return (
    <div className='min-h-screen bg-background safe-area-inset'>
      <div className='max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-0 sm:px-6 py-6 sm:py-8'>
        <header className='text-center mb-6 sm:mb-8'>
          <div className='flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4'>
            <CheckSquare
              className='h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary'
              aria-hidden='true'
            />
            <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-foreground text-balance'>
              Todo App
            </h1>
          </div>
          <p className='text-muted-foreground text-sm sm:text-base md:text-lg px-2 sm:px-0 text-balance'>
            A Next.js Todo application built with Test-Driven Development
          </p>
          <p className='text-muted-foreground text-xs sm:text-sm mt-1 sm:mt-2'>
            Powered by Claude Code
          </p>
        </header>

        <main
          className='bg-card border-x-0 sm:border-x border-y sm:rounded-lg p-0 sm:p-5 md:p-6 shadow-sm fade-in'
          role='main'
          aria-label='Todo application'
        >
          <TodoForm onAddTodo={addTodo} />
          <TodoFilter
            currentFilter={filter}
            onFilterChange={setFilter}
            activeTodosCount={activeTodosCount}
            completedTodosCount={completedTodosCount}
            deletedTodosCount={deletedTodosCount}
            activityCount={activityCount}
          />
          {filter === 'activity' ? (
            <ActivityTimeline todos={allTodos} />
          ) : (
            <TodoList
              todos={todos}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
              onRestore={restoreTodo}
              onPermanentlyDelete={permanentlyDeleteTodo}
              onRestoreDeleted={restoreDeletedTodo}
              reorderTodos={reorderTodos}
              moveUp={moveUp}
              moveDown={moveDown}
            />
          )}
        </main>

        <footer className='text-center mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground px-2 sm:px-0'>
          <p>
            Built with ❤️ using{' '}
            <a
              href='https://claude.ai/code'
              className='text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded'
              target='_blank'
              rel='noopener noreferrer'
            >
              Claude Code
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
