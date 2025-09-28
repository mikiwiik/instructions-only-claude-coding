import {
  generateTodoActivities,
  generateActivityTimeline,
  groupActivitiesByTime,
  getActivityIcon,
  formatActivityDisplay,
  getActivityCount,
} from '../../utils/activity';
import { Todo, ActivityEvent } from '../../types/todo';

// Mock current time for consistent testing
const MOCK_NOW = new Date('2024-01-15T12:00:00Z');
const realDateNow = Date.now.bind(global.Date);

beforeEach(() => {
  global.Date.now = jest.fn(() => MOCK_NOW.getTime());
  jest.useFakeTimers();
  jest.setSystemTime(MOCK_NOW);
});

afterEach(() => {
  global.Date.now = realDateNow;
  jest.useRealTimers();
});

describe('generateTodoActivities', () => {
  const createMockTodo = (overrides: Partial<Todo> = {}): Todo => ({
    id: 'test-1',
    text: 'Test todo',
    createdAt: new Date(MOCK_NOW.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(MOCK_NOW.getTime() - 24 * 60 * 60 * 1000), // same as created
    ...overrides,
  });

  it('should generate creation activity for new todo', () => {
    const todo = createMockTodo();
    const activities = generateTodoActivities(todo);

    expect(activities).toHaveLength(1);
    expect(activities[0]).toEqual({
      id: 'test-1-created',
      todoId: 'test-1',
      todoText: 'Test todo',
      action: 'created',
      timestamp: todo.createdAt,
    });
  });

  it('should generate edit activity when updatedAt > createdAt and not completed', () => {
    const todo = createMockTodo({
      updatedAt: new Date(MOCK_NOW.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
    });
    const activities = generateTodoActivities(todo);

    expect(activities).toHaveLength(2);
    expect(activities[0].action).toBe('created');
    expect(activities[1]).toEqual({
      id: 'test-1-edited',
      todoId: 'test-1',
      todoText: 'Test todo',
      action: 'edited',
      timestamp: todo.updatedAt,
    });
  });

  it('should generate completion activity when completed', () => {
    const todo = createMockTodo({
      completedAt: new Date(MOCK_NOW.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      updatedAt: new Date(MOCK_NOW.getTime() - 6 * 60 * 60 * 1000), // same time
    });
    const activities = generateTodoActivities(todo);

    expect(activities).toHaveLength(2);
    expect(activities[0].action).toBe('created');
    expect(activities[1]).toEqual({
      id: 'test-1-completed',
      todoId: 'test-1',
      todoText: 'Test todo',
      action: 'completed',
      timestamp: todo.updatedAt,
    });
  });

  it('should generate deletion activity when deletedAt exists', () => {
    const todo = createMockTodo({
      deletedAt: new Date(MOCK_NOW.getTime() - 30 * 60 * 1000), // 30 minutes ago
    });
    const activities = generateTodoActivities(todo);

    expect(activities).toHaveLength(2);
    expect(activities[0].action).toBe('created');
    expect(activities[1]).toEqual({
      id: 'test-1-deleted',
      todoId: 'test-1',
      todoText: 'Test todo',
      action: 'deleted',
      timestamp: todo.deletedAt,
    });
  });

  it('should generate all activities for complex todo lifecycle', () => {
    const todo = createMockTodo({
      completedAt: new Date(MOCK_NOW.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      updatedAt: new Date(MOCK_NOW.getTime() - 6 * 60 * 60 * 1000), // completion time
      deletedAt: new Date(MOCK_NOW.getTime() - 30 * 60 * 1000), // 30 minutes ago
    });
    const activities = generateTodoActivities(todo);

    expect(activities).toHaveLength(3);
    expect(activities[0].action).toBe('created');
    expect(activities[1].action).toBe('completed');
    expect(activities[2].action).toBe('deleted');
  });

  it('should not generate edit activity when updatedAt equals createdAt', () => {
    const sameTime = new Date(MOCK_NOW.getTime() - 24 * 60 * 60 * 1000);
    const todo = createMockTodo({
      createdAt: sameTime,
      updatedAt: sameTime,
    });
    const activities = generateTodoActivities(todo);

    expect(activities).toHaveLength(1);
    expect(activities[0].action).toBe('created');
  });
});

describe('generateActivityTimeline', () => {
  const createMockTodo = (id: string, overrides: Partial<Todo> = {}): Todo => ({
    id,
    text: `Todo ${id}`,
    createdAt: new Date(MOCK_NOW.getTime() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(MOCK_NOW.getTime() - 24 * 60 * 60 * 1000),
    ...overrides,
  });

  it('should return empty array for empty todos', () => {
    const activities = generateActivityTimeline([]);
    expect(activities).toEqual([]);
  });

  it('should generate activities for single todo', () => {
    const todos = [createMockTodo('1')];
    const activities = generateActivityTimeline(todos);

    expect(activities).toHaveLength(1);
    expect(activities[0].action).toBe('created');
  });

  it('should generate activities for multiple todos', () => {
    const todos = [
      createMockTodo('1'),
      createMockTodo('2', {
        updatedAt: new Date(MOCK_NOW.getTime() - 12 * 60 * 60 * 1000),
      }),
    ];
    const activities = generateActivityTimeline(todos);

    expect(activities).toHaveLength(3); // 2 created + 1 edited
    expect(activities.some((a) => a.action === 'created')).toBe(true);
    expect(activities.some((a) => a.action === 'edited')).toBe(true);
  });

  it('should sort activities by timestamp (most recent first)', () => {
    const todos = [
      createMockTodo('1', {
        createdAt: new Date(MOCK_NOW.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
      }),
      createMockTodo('2', {
        createdAt: new Date(MOCK_NOW.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      }),
      createMockTodo('3', {
        createdAt: new Date(MOCK_NOW.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      }),
    ];
    const activities = generateActivityTimeline(todos);

    expect(activities).toHaveLength(3);
    expect(activities[0].todoId).toBe('2'); // most recent
    expect(activities[1].todoId).toBe('3'); // middle
    expect(activities[2].todoId).toBe('1'); // oldest
  });

  it('should handle complex lifecycle with proper sorting', () => {
    const todos = [
      createMockTodo('1', {
        createdAt: new Date(MOCK_NOW.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
        updatedAt: new Date(MOCK_NOW.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
        completedAt: new Date(MOCK_NOW.getTime() - 1 * 60 * 60 * 1000), // completed
      }),
      createMockTodo('2', {
        createdAt: new Date(MOCK_NOW.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
        deletedAt: new Date(MOCK_NOW.getTime() - 30 * 60 * 1000), // 30 minutes ago
      }),
    ];
    const activities = generateActivityTimeline(todos);

    expect(activities).toHaveLength(4); // 2 created + 1 completed + 1 deleted
    expect(activities[0].action).toBe('deleted'); // most recent
    expect(activities[1].action).toBe('completed');
    expect(activities[2].action).toBe('created'); // todo 2
    expect(activities[3].action).toBe('created'); // todo 1
  });
});

describe('groupActivitiesByTime', () => {
  const createActivity = (
    action: ActivityEvent['action'],
    hoursAgo: number
  ): ActivityEvent => ({
    id: `test-${action}-${hoursAgo}`,
    todoId: 'test',
    todoText: 'Test todo',
    action,
    timestamp: new Date(MOCK_NOW.getTime() - hoursAgo * 60 * 60 * 1000),
  });

  it('should return empty object for empty activities', () => {
    const groups = groupActivitiesByTime([]);
    expect(groups).toEqual({});
  });

  it('should group today activities', () => {
    const activities = [
      createActivity('created', 2), // 2 hours ago (today)
      createActivity('completed', 1), // 1 hour ago (today)
    ];
    const groups = groupActivitiesByTime(activities);

    expect(groups).toHaveProperty('Today');
    expect(groups['Today']).toHaveLength(2);
    expect(groups['Today'][0].action).toBe('created');
    expect(groups['Today'][1].action).toBe('completed');
  });

  it('should group yesterday activities', () => {
    const activities = [
      createActivity('created', 26), // 26 hours ago (yesterday)
      createActivity('edited', 30), // 30 hours ago (yesterday)
    ];
    const groups = groupActivitiesByTime(activities);

    expect(groups).toHaveProperty('Yesterday');
    expect(groups['Yesterday']).toHaveLength(2);
    expect(Object.keys(groups)).not.toContain('Today');
  });

  it('should group this week activities', () => {
    const activities = [
      createActivity('created', 72), // 3 days ago (this week)
      createActivity('completed', 120), // 5 days ago (this week)
    ];
    const groups = groupActivitiesByTime(activities);

    expect(groups).toHaveProperty('This Week');
    expect(groups['This Week']).toHaveLength(2);
  });

  it('should group earlier activities', () => {
    const activities = [
      createActivity('created', 200), // 8+ days ago (earlier)
      createActivity('deleted', 240), // 10 days ago (earlier)
    ];
    const groups = groupActivitiesByTime(activities);

    expect(groups).toHaveProperty('Earlier');
    expect(groups['Earlier']).toHaveLength(2);
  });

  it('should group activities across multiple time periods', () => {
    const activities = [
      createActivity('created', 1), // today
      createActivity('edited', 26), // yesterday
      createActivity('completed', 72), // this week
      createActivity('deleted', 200), // earlier
    ];
    const groups = groupActivitiesByTime(activities);

    expect(Object.keys(groups)).toEqual([
      'Today',
      'Yesterday',
      'This Week',
      'Earlier',
    ]);
    expect(groups['Today']).toHaveLength(1);
    expect(groups['Yesterday']).toHaveLength(1);
    expect(groups['This Week']).toHaveLength(1);
    expect(groups['Earlier']).toHaveLength(1);
  });

  it('should remove empty groups', () => {
    const activities = [
      createActivity('created', 1), // today only
    ];
    const groups = groupActivitiesByTime(activities);

    expect(Object.keys(groups)).toEqual(['Today']);
    expect(groups).not.toHaveProperty('Yesterday');
    expect(groups).not.toHaveProperty('This Week');
    expect(groups).not.toHaveProperty('Earlier');
  });
});

describe('getActivityIcon', () => {
  it('should return correct icons for each action', () => {
    expect(getActivityIcon('created')).toBe('📝');
    expect(getActivityIcon('edited')).toBe('✏️');
    expect(getActivityIcon('completed')).toBe('✅');
    expect(getActivityIcon('restored')).toBe('↩️');
    expect(getActivityIcon('deleted')).toBe('🗑️');
  });

  it('should return default icon for unknown action', () => {
    // @ts-expect-error Testing invalid action
    expect(getActivityIcon('unknown')).toBe('📝');
  });
});

describe('formatActivityDisplay', () => {
  const createActivity = (
    action: ActivityEvent['action'],
    text: string,
    hoursAgo = 1
  ): ActivityEvent => ({
    id: 'test',
    todoId: 'test',
    todoText: text,
    action,
    timestamp: new Date(MOCK_NOW.getTime() - hoursAgo * 60 * 60 * 1000),
  });

  it('should format created activity', () => {
    const activity = createActivity('created', 'Test todo');
    const formatted = formatActivityDisplay(activity);
    expect(formatted).toBe('📝 Created "Test todo" - 1 hour ago');
  });

  it('should format edited activity', () => {
    const activity = createActivity('edited', 'Updated todo');
    const formatted = formatActivityDisplay(activity);
    expect(formatted).toBe('✏️ Edited "Updated todo" - 1 hour ago');
  });

  it('should format completed activity', () => {
    const activity = createActivity('completed', 'Finished task');
    const formatted = formatActivityDisplay(activity);
    expect(formatted).toBe('✅ Completed "Finished task" - 1 hour ago');
  });

  it('should format restored activity', () => {
    const activity = createActivity('restored', 'Restored item');
    const formatted = formatActivityDisplay(activity);
    expect(formatted).toBe('↩️ Restored "Restored item" - 1 hour ago');
  });

  it('should format deleted activity', () => {
    const activity = createActivity('deleted', 'Removed todo');
    const formatted = formatActivityDisplay(activity);
    expect(formatted).toBe('🗑️ Deleted "Removed todo" - 1 hour ago');
  });

  it('should handle different time formats', () => {
    const activity = createActivity('created', 'Test', 0.5); // 30 minutes ago
    const formatted = formatActivityDisplay(activity);
    expect(formatted).toBe('📝 Created "Test" - 30 minutes ago');
  });
});

describe('getActivityCount', () => {
  const createMockTodo = (id: string, overrides: Partial<Todo> = {}): Todo => ({
    id,
    text: `Todo ${id}`,
    createdAt: new Date(MOCK_NOW.getTime() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(MOCK_NOW.getTime() - 24 * 60 * 60 * 1000),
    ...overrides,
  });

  it('should return 0 for empty todos', () => {
    expect(getActivityCount([])).toBe(0);
  });

  it('should count activities for single todo', () => {
    const todos = [createMockTodo('1')];
    expect(getActivityCount(todos)).toBe(1); // just created
  });

  it('should count activities for todo with lifecycle events', () => {
    const todos = [
      createMockTodo('1', {
        updatedAt: new Date(MOCK_NOW.getTime() - 12 * 60 * 60 * 1000),
        completedAt: new Date(MOCK_NOW.getTime() - 12 * 60 * 60 * 1000),
        deletedAt: new Date(MOCK_NOW.getTime() - 6 * 60 * 60 * 1000),
      }),
    ];
    expect(getActivityCount(todos)).toBe(3); // created + completed + deleted
  });

  it('should count activities for multiple todos', () => {
    const todos = [
      createMockTodo('1'), // 1 activity (created)
      createMockTodo('2', {
        updatedAt: new Date(MOCK_NOW.getTime() - 12 * 60 * 60 * 1000),
      }), // 2 activities (created + edited)
      createMockTodo('3', {
        completedAt: new Date(MOCK_NOW.getTime() - 6 * 60 * 60 * 1000),
        updatedAt: new Date(MOCK_NOW.getTime() - 6 * 60 * 60 * 1000),
      }), // 2 activities (created + completed)
    ];
    expect(getActivityCount(todos)).toBe(5); // 1 + 2 + 2
  });

  it('should be consistent with generateActivityTimeline length', () => {
    const todos = [
      createMockTodo('1', {
        updatedAt: new Date(MOCK_NOW.getTime() - 12 * 60 * 60 * 1000),
        deletedAt: new Date(MOCK_NOW.getTime() - 6 * 60 * 60 * 1000),
      }),
      createMockTodo('2'),
    ];

    const timelineLength = generateActivityTimeline(todos).length;
    const activityCount = getActivityCount(todos);

    expect(activityCount).toBe(timelineLength);
  });
});

describe('Edge cases and performance', () => {
  it('should handle todos with invalid dates gracefully', () => {
    // Test with valid Date objects that might be edge cases instead
    const todos: Todo[] = [
      {
        id: 'test',
        text: 'Test',
        createdAt: new Date('invalid'),
        updatedAt: new Date('invalid'),
      },
    ];

    // These will create Date objects with NaN timestamps
    expect(() => generateActivityTimeline(todos)).not.toThrow();
  });

  it('should handle large datasets efficiently', () => {
    const todos = Array.from({ length: 1000 }, (_, i) => ({
      id: `todo-${i}`,
      text: `Todo ${i}`,
      createdAt: new Date(MOCK_NOW.getTime() - i * 60 * 1000),
      updatedAt: new Date(MOCK_NOW.getTime() - i * 60 * 1000),
    }));

    const start = performance.now();
    const activities = generateActivityTimeline(todos);
    const grouped = groupActivitiesByTime(activities);
    const count = getActivityCount(todos);
    const end = performance.now();

    expect(activities).toHaveLength(1000);
    expect(count).toBe(1000);
    expect(Object.keys(grouped).length).toBeGreaterThan(0);
    expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
  });

  it('should maintain referential integrity in activity IDs', () => {
    const todo: Todo = {
      id: 'special-id-123',
      text: 'Test todo',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const activities = generateTodoActivities(todo);
    expect(activities[0].id).toBe('special-id-123-created');
    expect(activities[0].todoId).toBe('special-id-123');
  });
});
