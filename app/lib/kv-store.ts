/**
 * Vercel KV store wrapper for shared todo lists
 */

import { kv } from '@vercel/kv';
import type { Todo } from '../types/todo';

export interface SharedTodoList {
  id: string;
  todos: Todo[];
  lastModified: number;
  subscribers: string[];
}

export class KVStore {
  private static getListKey(listId: string): string {
    return `shared:list:${listId}`;
  }

  private static getSubscribersKey(listId: string): string {
    return `shared:subscribers:${listId}`;
  }

  static async getList(listId: string): Promise<SharedTodoList | null> {
    const key = this.getListKey(listId);
    const data = await kv.get<SharedTodoList>(key);
    return data;
  }

  static async setList(
    listId: string,
    todos: Todo[],
    userId: string
  ): Promise<void> {
    const key = this.getListKey(listId);
    const list: SharedTodoList = {
      id: listId,
      todos,
      lastModified: Date.now(),
      subscribers: [userId],
    };
    await kv.set(key, list);
  }

  static async updateTodos(listId: string, todos: Todo[]): Promise<void> {
    const key = this.getListKey(listId);
    const existing = await this.getList(listId);

    if (!existing) {
      throw new Error('List not found');
    }

    const updated: SharedTodoList = {
      ...existing,
      todos,
      lastModified: Date.now(),
    };

    await kv.set(key, updated);
  }

  static async addSubscriber(listId: string, userId: string): Promise<void> {
    const key = this.getListKey(listId);
    const list = await this.getList(listId);

    if (!list) {
      throw new Error('List not found');
    }

    if (!list.subscribers.includes(userId)) {
      list.subscribers.push(userId);
      await kv.set(key, list);
    }
  }

  static async removeSubscriber(listId: string, userId: string): Promise<void> {
    const key = this.getListKey(listId);
    const list = await this.getList(listId);

    if (!list) {
      return;
    }

    list.subscribers = list.subscribers.filter((id) => id !== userId);
    await kv.set(key, list);
  }

  static async deleteList(listId: string): Promise<void> {
    const key = this.getListKey(listId);
    await kv.del(key);
  }
}
