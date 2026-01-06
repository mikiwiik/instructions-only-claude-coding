/**
 * Server-Sent Events endpoint for real-time todo synchronization
 */

import { NextRequest } from 'next/server';
import { KVStore } from '@/lib/kv-store';
import { createChildLogger, getVercelRequestId } from '@/lib/logger';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  const { listId } = await params;
  const userId = request.headers.get('x-user-id') || 'anonymous';
  const requestId = getVercelRequestId(request.headers);
  const log = createChildLogger({ requestId, listId, userId, method: 'SSE' });

  // Create SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection event
      const connectionEvent = `event: connected\ndata: ${JSON.stringify({ listId, userId })}\n\n`;
      controller.enqueue(encoder.encode(connectionEvent));

      // Add subscriber to KV store
      try {
        await KVStore.addSubscriber(listId, userId);
      } catch (error) {
        log.error({ error }, 'Failed to add subscriber');
      }

      // Set up periodic ping to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          clearInterval(pingInterval);
        }
      }, 30000); // 30 seconds

      // Poll for changes (in production, use Redis Pub/Sub)
      const pollInterval = setInterval(async () => {
        try {
          const list = await KVStore.getList(listId);
          if (!list) {
            clearInterval(pollInterval);
            clearInterval(pingInterval);
            controller.close();
            return;
          }

          const syncEvent = `event: sync\ndata: ${JSON.stringify({
            todos: list.todos,
            lastModified: list.lastModified,
          })}\n\n`;

          controller.enqueue(encoder.encode(syncEvent));
        } catch (error) {
          log.error({ error }, 'Polling error');
        }
      }, 2000); // 2 seconds

      // Cleanup on connection close
      request.signal.addEventListener('abort', async () => {
        clearInterval(pollInterval);
        clearInterval(pingInterval);
        try {
          await KVStore.removeSubscriber(listId, userId);
        } catch (error) {
          log.error({ error }, 'Failed to remove subscriber');
        }
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
