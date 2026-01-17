'use client';

import { CheckSquare, Loader2 } from 'lucide-react';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import TodoFilter from './TodoFilter';
import ActivityTimeline from './ActivityTimeline';
import ShareButton from './ShareButton';
import { Todo, TodoFilter as TodoFilterType } from '../types/todo';
import { RateLimitState } from '../hooks/useTodoSync';
import { getActivityCount } from '../utils/activity';

interface ShareActionConfig {
  /** Whether sharing is enabled for this page */
  enabled: boolean;
  /** Callback when list is successfully shared */
  onShared?: (listId: string, url: string) => void;
}

interface TodoPageLayoutProps {
  todos: Todo[];
  allTodos: Todo[];
  filter: TodoFilterType;
  isLoading?: boolean;
  rateLimitState: RateLimitState;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  restoreTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  permanentlyDeleteTodo: (id: string) => void;
  restoreDeletedTodo: (id: string) => void;
  editTodo: (id: string, text: string) => void;
  reorderTodos: (sourceIndex: number, destinationIndex: number) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  setFilter: (filter: TodoFilterType) => void;
  /** Optional notice to display above the main content */
  notice?: React.ReactNode;
  /** Share action configuration - when provided, shows share button */
  shareAction?: ShareActionConfig;
}

function PageHeader() {
  return (
    <header className='text-center mb-6 md:mb-8'>
      <div className='flex items-center justify-center gap-2 md:gap-3'>
        <CheckSquare
          className='h-6 w-6 md:h-8 md:w-8 text-primary'
          aria-hidden='true'
        />
        <h1 className='text-2xl md:text-4xl font-bold text-foreground'>TODO</h1>
      </div>
    </header>
  );
}

function PageFooter() {
  return (
    <footer className='text-center mt-6 md:mt-8 text-xs md:text-sm text-muted-foreground px-2 md:px-0'>
      <p>
        100% agent implemented - 100% human instructed with{' '}
        <a
          href='https://claude.ai/code'
          className='text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded'
          target='_blank'
          rel='noopener noreferrer'
        >
          Claude Code
        </a>
      </p>
      <p className='mt-2'>
        <a
          href='https://github.com/mikiwiik/instructions-only-claude-coding/'
          className='text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded'
          target='_blank'
          rel='noopener noreferrer'
        >
          View on GitHub
        </a>
      </p>
      <p className='mt-2 text-muted-foreground/70'>
        Educational project - no warranties. Use at your own risk. Contributions
        welcome!
      </p>
    </footer>
  );
}

export default function TodoPageLayout({
  todos,
  allTodos,
  filter,
  isLoading = false,
  rateLimitState,
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
  notice,
  shareAction,
}: Readonly<TodoPageLayoutProps>) {
  const activeTodosCount = allTodos.filter(
    (todo) => !todo.completedAt && !todo.deletedAt
  ).length;
  const completedTodosCount = allTodos.filter(
    (todo) => todo.completedAt && !todo.deletedAt
  ).length;
  const deletedTodosCount = allTodos.filter((todo) => todo.deletedAt).length;
  const activityCount = getActivityCount(allTodos);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background safe-area-inset'>
        <div className='max-w-sm md:max-w-2xl lg:max-w-4xl mx-auto px-0 md:px-6 py-6 md:py-8'>
          <PageHeader />
          <output
            className='flex items-center justify-center py-12'
            aria-label='Loading todos'
          >
            <Loader2
              className='h-8 w-8 animate-spin text-primary'
              aria-hidden='true'
            />
            <span className='sr-only'>Loading todos...</span>
          </output>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background safe-area-inset'>
      <div className='max-w-sm md:max-w-2xl lg:max-w-4xl mx-auto px-0 md:px-6 py-6 md:py-8'>
        <PageHeader />

        {notice}

        {rateLimitState.isRateLimited && (
          <div
            className='mb-4 md:mb-6 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800'
            role='alert'
            aria-live='polite'
          >
            <span className='font-medium'>Slow down:</span>{' '}
            {rateLimitState.message}
          </div>
        )}

        <main
          className='bg-card border-x-0 md:border-x border-y md:rounded-lg p-0 md:p-6 shadow-sm fade-in'
          role='main'
          aria-label='Todo application'
        >
          <TodoForm
            onAddTodo={addTodo}
            shareButton={
              shareAction?.enabled ? (
                <ShareButton
                  todos={allTodos.filter((t) => !t.deletedAt)}
                  onShared={shareAction.onShared}
                />
              ) : undefined
            }
          />
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

        <PageFooter />
      </div>
    </div>
  );
}
