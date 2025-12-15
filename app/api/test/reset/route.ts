/**
 * Test Reset API Endpoint
 *
 * Clears the in-memory store for E2E testing.
 * Only available when USE_IN_MEMORY_STORE=true (CI E2E tests).
 * Returns 403 in production to prevent accidental data loss.
 */

import { NextResponse } from 'next/server';
import { resetInMemoryStore } from '@/lib/kv-store';

export async function POST() {
  // eslint-disable-next-line no-console
  console.log('[Reset API] Called, USE_IN_MEMORY_STORE:', process.env.USE_IN_MEMORY_STORE);

  // Only allow reset in test mode
  if (process.env.USE_IN_MEMORY_STORE !== 'true') {
    // eslint-disable-next-line no-console
    console.log('[Reset API] Returning 403 - not in test mode');
    return NextResponse.json(
      { error: 'Reset endpoint only available in test mode' },
      { status: 403 }
    );
  }

  // eslint-disable-next-line no-console
  console.log('[Reset API] Calling resetInMemoryStore()');
  resetInMemoryStore();
  // eslint-disable-next-line no-console
  console.log('[Reset API] Reset complete');

  return NextResponse.json({ success: true });
}
