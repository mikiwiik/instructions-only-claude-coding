/**
 * Sync operation endpoint for shared todo lists
 */

import { NextRequest, NextResponse } from 'next/server';
import { KVStore } from '@/lib/kv-store';
import type { SyncOperation } from '@/types/sync';
import type { Todo } from '@/types/todo';

type OperationResult =
  | { success: true; todos: Todo[] }
  | { success: false; error: string; status: number };

function applyOperation(
  operation: SyncOperation,
  todos: Todo[],
  data: unknown
): OperationResult {
  switch (operation) {
    case 'create': {
      const newTodo = data as Todo;
      return { success: true, todos: [newTodo, ...todos] };
    }
    case 'update':
    case 'reorder-single': {
      const updatedTodo = data as Todo;
      const updated = todos.map((t) =>
        t.id === updatedTodo.id ? updatedTodo : t
      );
      return { success: true, todos: updated };
    }
    case 'delete': {
      const todoId = data as string;
      return { success: true, todos: todos.filter((t) => t.id !== todoId) };
    }
    default:
      return { success: false, error: 'Invalid operation', status: 400 };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  const { listId } = await params;

  try {
    const body = await request.json();
    const { operation, data } = body as {
      operation: SyncOperation;
      data: unknown;
    };

    let list = await KVStore.getList(listId);

    if (!list && operation === 'create') {
      await KVStore.setList(listId, [], 'anonymous');
      list = await KVStore.getList(listId);
    } else if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    const result = applyOperation(operation, list?.todos || [], data);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    await KVStore.updateTodos(listId, result.todos);

    return NextResponse.json({
      success: true,
      todos: result.todos,
      timestamp: Date.now(),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Sync operation failed' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  const { listId } = await params;

  try {
    const list = await KVStore.getList(listId);

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    return NextResponse.json({
      todos: list.todos,
      lastModified: list.lastModified,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Get list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch list' },
      { status: 500 }
    );
  }
}
