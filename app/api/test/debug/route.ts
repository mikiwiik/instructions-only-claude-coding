/**
 * Debug API Endpoint for E2E testing
 *
 * Returns diagnostic information about the KVStore state.
 * Only available when USE_IN_MEMORY_STORE=true.
 */

import { NextResponse } from 'next/server';
import { KVStore } from '@/lib/kv-store';

export async function GET() {
  // eslint-disable-next-line no-console
  console.log('[Debug API] Called');

  const useInMemory = process.env.USE_IN_MEMORY_STORE === 'true';

  if (!useInMemory) {
    return NextResponse.json(
      { error: 'Debug endpoint only available in test mode' },
      { status: 403 }
    );
  }

  // Try to get the main list to see what's in the store
  const mainList = await KVStore.getList('main-list');

  return NextResponse.json({
    useInMemoryStore: useInMemory,
    nodeEnv: process.env.NODE_ENV,
    mainListExists: mainList !== null,
    mainListTodoCount: mainList?.todos?.length ?? 0,
    mainListTodos: mainList?.todos?.map((t) => ({ id: t.id, text: t.text })),
  });
}
