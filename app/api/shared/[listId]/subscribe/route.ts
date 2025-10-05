/**
 * Server-Sent Events endpoint for real-time todo synchronization
 */

import { NextRequest } from 'next/server';
import { KVStore } from '@/lib/kv-store';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  const { listId } = params;
  const userId = request.headers.get('x-user-id') || 'anonymous';

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
        // eslint-disable-next-line no-console
        console.error('Failed to add subscriber:', error);
      }

      // Set up periodic ping to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch (error) {
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
          // eslint-disable-next-line no-console
          console.error('Polling error:', error);
        }
      }, 2000); // 2 seconds

      // Cleanup on connection close
      request.signal.addEventListener('abort', async () => {
        clearInterval(pollInterval);
        clearInterval(pingInterval);
        try {
          await KVStore.removeSubscriber(listId, userId);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to remove subscriber:', error);
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
