'use client';

import { use } from 'react';
import { useTodos } from '../../hooks/useTodos';
import TodoPageLayout from '../../components/TodoPageLayout';

interface ListPageProps {
  params: Promise<{ listId: string }>;
}

export default function ListPage({ params }: Readonly<ListPageProps>) {
  const { listId } = use(params);
  const todoState = useTodos(listId);

  return <TodoPageLayout {...todoState} />;
}
