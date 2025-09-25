import { Todo } from '../types/todo';

/**
 * Formats a relative time difference between two dates
 * @param date - The target date to compare
 * @param action - The action prefix (e.g., 'Created', 'Updated', 'Deleted')
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: Date, action: string): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Handle future dates (clock skew protection)
  if (diffMs < 0) {
    return `${action} 0 minutes ago`;
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  // Less than 1 minute
  if (diffMinutes < 1) {
    return `${action} 0 minutes ago`;
  }

  // Less than 1 hour
  if (diffMinutes < 60) {
    const unit = diffMinutes === 1 ? 'minute' : 'minutes';
    return `${action} ${diffMinutes} ${unit} ago`;
  }

  // Less than 24 hours
  if (diffHours < 24) {
    const unit = diffHours === 1 ? 'hour' : 'hours';
    return `${action} ${diffHours} ${unit} ago`;
  }

  // Less than 7 days
  if (diffDays < 7) {
    const unit = diffDays === 1 ? 'day' : 'days';
    return `${action} ${diffDays} ${unit} ago`;
  }

  // Less than or equal to 30 days
  if (diffDays <= 30) {
    const unit = diffWeeks === 1 ? 'week' : 'weeks';
    return `${action} ${diffWeeks} ${unit} ago`;
  }

  // More than 30 days - use absolute date
  return `${action} ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

/**
 * Gets the most relevant contextual timestamp for a todo
 * Priority: deletedAt > updatedAt (if ≠ createdAt) > createdAt
 * @param todo - The todo item to get timestamp for
 * @returns Formatted contextual timestamp string
 */
export function getContextualTimestamp(todo: Todo): string {
  // Highest priority: deleted timestamp
  if (todo.deletedAt) {
    return formatRelativeTime(todo.deletedAt, 'Deleted');
  }

  // Second priority: updated timestamp (if newer than created)
  if (todo.updatedAt.getTime() > todo.createdAt.getTime()) {
    if (todo.completed) {
      return formatRelativeTime(todo.updatedAt, 'Completed');
    } else {
      return formatRelativeTime(todo.updatedAt, 'Updated');
    }
  }

  // Fallback: created timestamp
  return formatRelativeTime(todo.createdAt, 'Created');
}

/**
 * Gets the full timestamp for accessibility (hover/focus text)
 * @param todo - The todo item to get full timestamp for
 * @returns Full timestamp string with date and time
 */
export function getFullTimestamp(todo: Todo): string {
  let relevantDate: Date;
  let action: string;

  if (todo.deletedAt) {
    relevantDate = todo.deletedAt;
    action = 'Deleted';
  } else if (todo.updatedAt.getTime() > todo.createdAt.getTime()) {
    relevantDate = todo.updatedAt;
    action = todo.completed ? 'Completed' : 'Updated';
  } else {
    relevantDate = todo.createdAt;
    action = 'Created';
  }

  return `${action} ${relevantDate.toLocaleDateString()} at ${relevantDate.toLocaleTimeString()}`;
}

/**
 * Gets the most recent activity date for sorting purposes
 * @param todo - The todo item to get activity date for
 * @returns The most recent activity date
 */
export function getLastActivityDate(todo: Todo): Date {
  if (todo.deletedAt) {
    return todo.deletedAt;
  }

  return todo.updatedAt;
}
