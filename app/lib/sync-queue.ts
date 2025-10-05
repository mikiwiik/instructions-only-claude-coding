/**
 * Sync queue manager with retry logic and exponential backoff
 */

import type { SyncQueueItem, SyncOperation } from '../types/sync';

export class SyncQueue {
  private queue: SyncQueueItem[] = [];
  private processing = false;
  private maxRetries = 3;
  private baseDelay = 1000; // 1 second

  async add(
    operation: SyncOperation,
    todoId: string,
    data: unknown
  ): Promise<void> {
    const item: SyncQueueItem = {
      id: crypto.randomUUID(),
      operation,
      todoId,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.maxRetries,
    };

    this.queue.push(item);

    if (!this.processing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];

      try {
        await this.syncItem(item);
        this.queue.shift(); // Remove successfully synced item
      } catch (error) {
        await this.handleError(item, error);
      }
    }

    this.processing = false;
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    const response = await fetch(`/api/shared/${item.todoId}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: item.operation,
        data: item.data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
  }

  private async handleError(
    item: SyncQueueItem,
    error: unknown
  ): Promise<void> {
    item.retryCount++;

    if (item.retryCount >= item.maxRetries) {
      // Max retries reached, remove from queue
      this.queue.shift();
      // eslint-disable-next-line no-console
      console.error('Sync failed after max retries:', error);
      return;
    }

    // Exponential backoff
    const delay = this.baseDelay * Math.pow(2, item.retryCount);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  getStatus(): {
    pendingCount: number;
    isProcessing: boolean;
  } {
    return {
      pendingCount: this.queue.length,
      isProcessing: this.processing,
    };
  }

  clear(): void {
    this.queue = [];
    this.processing = false;
  }
}
