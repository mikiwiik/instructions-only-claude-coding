import { Todo, ActivityEvent } from '../types/todo';
import { formatRelativeTime } from './timestamp';

/**
 * Generates activity events from a todo item
 * @param todo - The todo item to generate activities for
 * @returns Array of activity events for this todo
 */
export function generateTodoActivities(todo: Todo): ActivityEvent[] {
  const activities: ActivityEvent[] = [];

  // Creation event (always present)
  activities.push({
    id: `${todo.id}-created`,
    todoId: todo.id,
    todoText: todo.text,
    action: 'created',
    timestamp: todo.createdAt,
  });

  // Edit event (if updated after creation)
  if (todo.updatedAt.getTime() > todo.createdAt.getTime()) {
    // Determine if this was a completion or just an edit
    const action = todo.completedAt ? 'completed' : 'edited';
    activities.push({
      id: `${todo.id}-${action}`,
      todoId: todo.id,
      todoText: todo.text,
      action,
      timestamp: todo.updatedAt,
    });
  }

  // Deletion event (if deleted)
  if (todo.deletedAt) {
    activities.push({
      id: `${todo.id}-deleted`,
      todoId: todo.id,
      todoText: todo.text,
      action: 'deleted',
      timestamp: todo.deletedAt,
    });
  }

  return activities;
}

/**
 * Generates a complete activity timeline from all todos
 * @param todos - Array of todos to generate timeline from
 * @returns Sorted array of all activity events (most recent first)
 */
export function generateActivityTimeline(todos: Todo[]): ActivityEvent[] {
  const activities: ActivityEvent[] = [];

  // Generate activities for each todo
  todos.forEach((todo) => {
    activities.push(...generateTodoActivities(todo));
  });

  // Sort by timestamp (most recent first)
  return activities.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
}

/**
 * Groups activities by time periods for display
 * @param activities - Array of activity events
 * @returns Activities grouped by time periods
 */
export function groupActivitiesByTime(
  activities: ActivityEvent[]
): Record<string, ActivityEvent[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: Record<string, ActivityEvent[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Earlier: [],
  };

  activities.forEach((activity) => {
    const activityDate = new Date(
      activity.timestamp.getFullYear(),
      activity.timestamp.getMonth(),
      activity.timestamp.getDate()
    );

    if (activityDate.getTime() === today.getTime()) {
      groups['Today'].push(activity);
    } else if (activityDate.getTime() === yesterday.getTime()) {
      groups['Yesterday'].push(activity);
    } else if (activity.timestamp >= thisWeek) {
      groups['This Week'].push(activity);
    } else {
      groups['Earlier'].push(activity);
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach((key) => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}

/**
 * Gets an icon for an activity action
 * @param action - The activity action
 * @returns Emoji icon for the action
 */
export function getActivityIcon(action: ActivityEvent['action']): string {
  const icons = {
    created: '📝',
    edited: '✏️',
    completed: '✅',
    restored: '↩️',
    deleted: '🗑️',
  };

  return icons[action] || '📝';
}

/**
 * Formats an activity event for display
 * @param activity - The activity event to format
 * @returns Formatted activity string
 */
export function formatActivityDisplay(activity: ActivityEvent): string {
  const icon = getActivityIcon(activity.action);
  const timeAgo = formatRelativeTime(activity.timestamp, '').trim();

  let actionText: string;
  switch (activity.action) {
    case 'created':
      actionText = 'Created';
      break;
    case 'edited':
      actionText = 'Edited';
      break;
    case 'completed':
      actionText = 'Completed';
      break;
    case 'restored':
      actionText = 'Restored';
      break;
    case 'deleted':
      actionText = 'Deleted';
      break;
    default:
      actionText = 'Modified';
  }

  return `${icon} ${actionText} "${activity.todoText}" - ${timeAgo}`;
}

/**
 * Gets total count of activity events
 * @param todos - Array of todos to count activities for
 * @returns Total number of activity events
 */
export function getActivityCount(todos: Todo[]): number {
  return generateActivityTimeline(todos).length;
}
