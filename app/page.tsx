'use client';

import { useTodos } from './hooks/useTodos';
import { MAIN_LIST_ID } from './hooks/useTodoSync';
import TodoPageLayout from './components/TodoPageLayout';

export default function HomePage() {
  const todoState = useTodos(MAIN_LIST_ID);

  // Don't pass shareInfo to layout - main page has beta notice instead
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { shareInfo, ...layoutProps } = todoState;

  const betaNotice = (
    <div
      className='mb-4 md:mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800'
      role='status'
      aria-label='Beta notice'
    >
      <span className='font-medium'>Beta:</span> Currently all users share one
      list. Personal lists coming soon.
    </div>
  );

  return (
    <TodoPageLayout
      {...layoutProps}
      notice={betaNotice}
      shareAction={{ enabled: true }}
    />
  );
}
