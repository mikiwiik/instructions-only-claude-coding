/**
 * Sync operation endpoint for shared todo lists
 */

import { NextRequest, NextResponse } from 'next/server';
import { KVStore } from '@/lib/kv-store';
import type { SyncOperation } from '@/types/sync';
import type { Todo } from '@/types/todo';

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

    const list = await KVStore.getList(listId);
    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    let updatedTodos = [...list.todos];

    switch (operation) {
      case 'create': {
        const newTodo = data as Todo;
        updatedTodos.push(newTodo);
        break;
      }

      case 'update': {
        const updatedTodo = data as Todo;
        const index = updatedTodos.findIndex((t) => t.id === updatedTodo.id);
        if (index !== -1) {
          updatedTodos[index] = updatedTodo;
        }
        break;
      }

      case 'delete': {
        const todoId = data as string;
        updatedTodos = updatedTodos.filter((t) => t.id !== todoId);
        break;
      }

      case 'reorder': {
        const reorderedTodos = data as Todo[];
        updatedTodos = reorderedTodos;
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }

    await KVStore.updateTodos(listId, updatedTodos);

    return NextResponse.json({
      success: true,
      todos: updatedTodos,
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
