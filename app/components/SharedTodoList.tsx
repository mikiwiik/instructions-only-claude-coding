/**
 * Shared todo list component with real-time sync indicators
 */

'use client';

import { useState } from 'react';
import { useSharedTodos } from '../hooks/useSharedTodos';
import type { Todo } from '../types/todo';

interface SharedTodoListProps {
  listId: string;
  userId: string;
  initialTodos?: Todo[];
}

export function SharedTodoList({
  listId,
  userId,
  initialTodos = [],
}: SharedTodoListProps) {
  const [newTodoText, setNewTodoText] = useState('');

  const {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    syncState,
    isConnected,
    queueStatus,
  } = useSharedTodos({
    listId,
    userId,
    initialTodos,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    await addTodo(newTodoText);
    setNewTodoText('');
  };

  return (
    <div className='mx-auto max-w-2xl space-y-4 p-4'>
      {/* Sync Status Indicator */}
      <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm'>
        <div className='flex items-center gap-2'>
          <div
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
            aria-label={isConnected ? 'Connected' : 'Disconnected'}
          />
          <span className='text-sm text-gray-600'>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {queueStatus.pendingCount > 0 && (
          <div className='flex items-center gap-2'>
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent' />
            <span className='text-sm text-gray-600'>
              Syncing {queueStatus.pendingCount} change
              {queueStatus.pendingCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {syncState.lastSyncTime && (
          <span className='text-xs text-gray-400'>
            Last sync: {new Date(syncState.lastSyncTime).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Add Todo Form */}
      <form onSubmit={handleSubmit} className='flex gap-2'>
        <input
          type='text'
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder='Add a new todo...'
          className='min-h-[44px] flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
          aria-label='New todo text'
        />
        <button
          type='submit'
          disabled={!newTodoText.trim()}
          className='min-h-[44px] min-w-[44px] rounded-lg bg-blue-500 px-6 py-2 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300'
          aria-label='Add todo'
        >
          Add
        </button>
      </form>

      {/* Todo List */}
      <ul className='space-y-2' aria-label='Shared todos'>
        {todos.map((todo) => (
          <li
            key={todo.id}
            className='flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-colors hover:bg-gray-50'
          >
            <input
              type='checkbox'
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className='h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500'
              aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
            />
            <span
              className={`flex-1 ${
                todo.completed ? 'text-gray-400 line-through' : 'text-gray-700'
              }`}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className='min-h-[44px] min-w-[44px] rounded-lg px-3 py-1 text-sm font-medium text-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500'
              aria-label={`Delete "${todo.text}"`}
            >
              Delete
            </button>
          </li>
        ))}

        {todos.length === 0 && (
          <li className='py-8 text-center text-gray-400'>
            No todos yet. Add one to get started!
          </li>
        )}
      </ul>

      {/* Error Display */}
      {syncState.errors.length > 0 && (
        <div
          className='rounded-lg border border-red-200 bg-red-50 p-3'
          role='alert'
        >
          <h3 className='font-medium text-red-800'>Sync Errors</h3>
          <ul className='mt-2 space-y-1'>
            {syncState.errors.map((error, index) => (
              <li key={index} className='text-sm text-red-600'>
                {error.operation} failed for todo {error.todoId}: {error.error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
