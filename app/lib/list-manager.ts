/**
 * List management utilities for sharing and creating lists
 *
 * Handles the conversion of local lists to shared (persistent) lists
 * by saving them to the backend and generating shareable URLs.
 */

import type { Todo } from '@/types/todo';
import { logger } from './logger';

export interface ShareListResult {
  listId: string;
  url: string;
}

export interface ShareListError {
  code: 'NETWORK_ERROR' | 'SERVER_ERROR' | 'UNKNOWN_ERROR';
  message: string;
}

/**
 * Generate a unique list ID using crypto.randomUUID()
 */
export function generateListId(): string {
  return crypto.randomUUID();
}

/**
 * Build the shareable URL for a list
 */
export function buildListUrl(listId: string): string {
  // Use window.location.origin for client-side, fallback to relative URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/list/${listId}`;
}

/**
 * Share a list by saving it to the backend
 *
 * @param todos - The todos to save
 * @param listId - Optional list ID (generates new one if not provided)
 * @returns Promise resolving to share result or rejecting with error
 */
export async function shareList(
  todos: Todo[],
  listId?: string
): Promise<ShareListResult> {
  const id = listId ?? generateListId();
  const url = buildListUrl(id);

  try {
    const response = await fetch(`/api/shared/${id}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ todos }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error(
        { status: response.status, errorData, listId: id },
        'Failed to share list'
      );

      throw {
        code: 'SERVER_ERROR',
        message: errorData.error || 'Failed to save list to server',
      } as ShareListError;
    }

    logger.info(
      { listId: id, todoCount: todos.length },
      'List shared successfully'
    );

    return { listId: id, url };
  } catch (error) {
    if ((error as ShareListError).code) {
      throw error;
    }

    logger.error({ error, listId: id }, 'Network error while sharing list');
    throw {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to server. Please check your connection.',
    } as ShareListError;
  }
}

/**
 * Copy text to clipboard with fallback for older browsers
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const result = document.execCommand('copy');
    document.body.removeChild(textArea);
    return result;
  } catch {
    logger.error('Failed to copy to clipboard');
    return false;
  }
}
