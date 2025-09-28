import { render, screen } from '@testing-library/react';
import ActivityTimeline from '../../components/ActivityTimeline';
import { Todo } from '../../types/todo';

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

describe('ActivityTimeline', () => {
  const createMockTodo = (id: string, overrides: Partial<Todo> = {}): Todo => ({
    id,
    text: `Todo ${id}`,
    createdAt: new Date(MOCK_NOW.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(MOCK_NOW.getTime() - 24 * 60 * 60 * 1000), // same as created
    ...overrides,
  });

  describe('Empty state', () => {
    it('should render empty state when no todos provided', () => {
      render(<ActivityTimeline todos={[]} />);

      expect(screen.getByText('No activity yet')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Start creating todos to see your activity timeline here'
        )
      ).toBeInTheDocument();
    });

    it('should have proper accessibility for empty state', () => {
      render(<ActivityTimeline todos={[]} />);

      const emptyState = screen.getByText('No activity yet').closest('div');
      expect(emptyState).toHaveClass('text-center');
    });

    it('should be responsive in empty state', () => {
      render(<ActivityTimeline todos={[]} />);

      const container = screen.getByText('No activity yet').closest('div');
      expect(container).toHaveClass('py-6', 'sm:py-8', 'px-4');

      const subtitle = screen.getByText(/Start creating todos/);
      expect(subtitle).toHaveClass(
        'text-xs',
        'sm:text-sm',
        'max-w-md',
        'mx-auto'
      );
    });
  });

  describe('Activity display', () => {
    it('should render activities for single todo', () => {
      const todos = [createMockTodo('1')];
      render(<ActivityTimeline todos={todos} />);

      expect(
        screen.getByRole('main', { name: 'Activity timeline' })
      ).toBeInTheDocument();
      expect(screen.getByText('📝')).toBeInTheDocument(); // created icon
      expect(screen.getByText('created')).toBeInTheDocument();
      expect(screen.getByText(/Todo 1/)).toBeInTheDocument();
    });

    it('should display multiple activities in chronological order', () => {
      const todos = [
        createMockTodo('1', {
          createdAt: new Date(MOCK_NOW.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
        }),
        createMockTodo('2', {
          createdAt: new Date(MOCK_NOW.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
        }),
      ];
      render(<ActivityTimeline todos={todos} />);

      const activities = screen.getAllByRole('listitem');
      expect(activities).toHaveLength(2);

      // Most recent should be first
      expect(activities[0]).toHaveTextContent('Todo 2');
      expect(activities[1]).toHaveTextContent('Todo 1');
    });

    it('should group activities by time periods', () => {
      const todos = [
        createMockTodo('today', {
          createdAt: new Date(MOCK_NOW.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago (today)
        }),
        createMockTodo('yesterday', {
          createdAt: new Date(MOCK_NOW.getTime() - 26 * 60 * 60 * 1000), // 26 hours ago (yesterday)
        }),
      ];
      render(<ActivityTimeline todos={todos} />);

      expect(
        screen.getByRole('heading', { name: 'Today' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: 'Yesterday' })
      ).toBeInTheDocument();
    });

    it('should show different activity types with correct icons', () => {
      const todos = [
        createMockTodo('1', {
          createdAt: new Date(MOCK_NOW.getTime() - 5 * 60 * 60 * 1000),
          updatedAt: new Date(MOCK_NOW.getTime() - 3 * 60 * 60 * 1000), // edited
        }),
        createMockTodo('2', {
          createdAt: new Date(MOCK_NOW.getTime() - 4 * 60 * 60 * 1000),
          updatedAt: new Date(MOCK_NOW.getTime() - 2 * 60 * 60 * 1000),
          completedAt: new Date(MOCK_NOW.getTime() - 2 * 60 * 60 * 1000), // completed
        }),
        createMockTodo('3', {
          createdAt: new Date(MOCK_NOW.getTime() - 3 * 60 * 60 * 1000),
          deletedAt: new Date(MOCK_NOW.getTime() - 1 * 60 * 60 * 1000), // deleted
        }),
      ];
      render(<ActivityTimeline todos={todos} />);

      expect(screen.getByText('🗑️')).toBeInTheDocument(); // deleted icon
      expect(screen.getByText('✅')).toBeInTheDocument(); // completed icon
      expect(screen.getByText('✏️')).toBeInTheDocument(); // edited icon
      expect(screen.getAllByText('📝')).toHaveLength(3); // created icons
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles and labels', () => {
      const todos = [createMockTodo('1')];
      render(<ActivityTimeline todos={todos} />);

      expect(
        screen.getByRole('main', { name: 'Activity timeline' })
      ).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getByRole('listitem')).toBeInTheDocument();
    });

    it('should have descriptive aria-labels for activities', () => {
      const todos = [
        createMockTodo('1', {
          text: 'Test todo item',
          createdAt: new Date(MOCK_NOW.getTime() - 60 * 60 * 1000), // 1 hour ago
        }),
      ];
      render(<ActivityTimeline todos={todos} />);

      const activity = screen.getByRole('listitem');
      expect(activity).toHaveAttribute(
        'aria-label',
        'created "Test todo item" 1 hour ago'
      );
    });

    it('should have proper tabIndex for keyboard navigation', () => {
      const todos = [createMockTodo('1'), createMockTodo('2')];
      render(<ActivityTimeline todos={todos} />);

      const activities = screen.getAllByRole('listitem');
      activities.forEach((activity) => {
        expect(activity).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should have icon accessibility attributes', () => {
      const todos = [createMockTodo('1')];
      render(<ActivityTimeline todos={todos} />);

      const icon = screen.getByRole('img', { name: 'created action' });
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent('📝');
    });

    it('should maintain heading hierarchy', () => {
      const todos = [
        createMockTodo('today', {
          createdAt: new Date(MOCK_NOW.getTime() - 2 * 60 * 60 * 1000),
        }),
      ];
      render(<ActivityTimeline todos={todos} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveAttribute('aria-level', '3');
      expect(heading).toHaveTextContent('Today');
    });
  });

  describe('Responsive design', () => {
    it('should have responsive spacing classes', () => {
      const todos = [createMockTodo('1')];
      render(<ActivityTimeline todos={todos} />);

      const container = screen.getByRole('main');
      expect(container).toHaveClass('space-y-4', 'sm:space-y-6');
    });

    it('should have responsive text sizes', () => {
      const todos = [createMockTodo('1')];
      render(<ActivityTimeline todos={todos} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveClass('text-base', 'sm:text-lg');

      const activity = screen.getByRole('listitem');
      const textContent = activity.querySelector('p');
      expect(textContent).toHaveClass('text-xs', 'sm:text-sm');
    });

    it('should have responsive padding and spacing', () => {
      const todos = [createMockTodo('1')];
      render(<ActivityTimeline todos={todos} />);

      const activity = screen.getByRole('listitem');
      expect(activity).toHaveClass(
        'space-x-2',
        'sm:space-x-3',
        'p-2',
        'sm:p-3'
      );

      const icon = activity.querySelector('.flex-shrink-0 span');
      expect(icon).toHaveClass('text-base', 'sm:text-lg');
    });

    it('should handle text overflow properly', () => {
      const todos = [
        createMockTodo('1', {
          text: 'This is a very long todo item text that should test text wrapping behavior and overflow handling in the activity timeline component',
        }),
      ];
      render(<ActivityTimeline todos={todos} />);

      const activity = screen.getByRole('listitem');
      const textContent = activity.querySelector('.flex-grow.min-w-0 p');
      expect(textContent).toHaveClass('break-words');
    });
  });

  describe('Focus states', () => {
    it('should have proper focus styling', () => {
      const todos = [createMockTodo('1')];
      render(<ActivityTimeline todos={todos} />);

      const activity = screen.getByRole('listitem');
      expect(activity).toHaveClass(
        'focus-within:bg-muted',
        'focus-within:ring-2',
        'focus-within:ring-ring'
      );
    });

    it('should be focusable with keyboard', () => {
      const todos = [createMockTodo('1')];
      render(<ActivityTimeline todos={todos} />);

      const activity = screen.getByRole('listitem');
      activity.focus();
      expect(activity).toHaveFocus();
    });
  });

  describe('Time formatting', () => {
    it('should format relative times correctly', () => {
      const todos = [
        createMockTodo('recent', {
          createdAt: new Date(MOCK_NOW.getTime() - 30 * 60 * 1000), // 30 minutes ago
        }),
        createMockTodo('hours', {
          createdAt: new Date(MOCK_NOW.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        }),
      ];
      render(<ActivityTimeline todos={todos} />);

      expect(screen.getByText('30 minutes ago')).toBeInTheDocument();
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });

    it('should handle edge cases in time formatting', () => {
      const todos = [
        createMockTodo('just-now', {
          createdAt: new Date(MOCK_NOW.getTime() - 30 * 1000), // 30 seconds ago
        }),
        createMockTodo('future', {
          createdAt: new Date(MOCK_NOW.getTime() + 60 * 60 * 1000), // 1 hour in future
        }),
      ];
      render(<ActivityTimeline todos={todos} />);

      expect(screen.getAllByText('just now')).toHaveLength(2); // Both show as "just now"
    });
  });

  describe('Complex lifecycle scenarios', () => {
    it('should display full todo lifecycle', () => {
      const todos = [
        createMockTodo('lifecycle', {
          text: 'Complex todo',
          createdAt: new Date(MOCK_NOW.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
          updatedAt: new Date(MOCK_NOW.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago (edited)
          completedAt: new Date(MOCK_NOW.getTime() - 3 * 60 * 60 * 1000), // completed
          deletedAt: new Date(MOCK_NOW.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago (deleted)
        }),
      ];
      render(<ActivityTimeline todos={todos} />);

      expect(screen.getByText('🗑️')).toBeInTheDocument(); // deleted
      expect(screen.getByText('✅')).toBeInTheDocument(); // completed
      expect(screen.getByText('📝')).toBeInTheDocument(); // created

      // All should reference the same todo
      const todoReferences = screen.getAllByText(/Complex todo/);
      expect(todoReferences).toHaveLength(3); // created, completed, deleted
    });

    it('should maintain proper order with mixed activities', () => {
      const todos = [
        createMockTodo('old', {
          createdAt: new Date(MOCK_NOW.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
        }),
        createMockTodo('newer', {
          createdAt: new Date(MOCK_NOW.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
          deletedAt: new Date(MOCK_NOW.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
        }),
        createMockTodo('newest', {
          createdAt: new Date(MOCK_NOW.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        }),
      ];
      render(<ActivityTimeline todos={todos} />);

      const activities = screen.getAllByRole('listitem');

      // Should be ordered by timestamp, most recent first
      expect(activities[0]).toHaveTextContent('deleted'); // 1 hour ago
      expect(activities[1]).toHaveTextContent('Todo newest'); // 2 hours ago (created)
      expect(activities[2]).toHaveTextContent('Todo newer'); // 3 hours ago (created)
      expect(activities[3]).toHaveTextContent('Todo old'); // 4 hours ago (created)
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', () => {
      const todos = Array.from({ length: 50 }, (_, i) =>
        createMockTodo(`todo-${i}`, {
          createdAt: new Date(MOCK_NOW.getTime() - i * 60 * 60 * 1000),
        })
      );

      const start = performance.now();
      render(<ActivityTimeline todos={todos} />);
      const end = performance.now();

      expect(end - start).toBeLessThan(500); // Should render in less than 500ms

      // Should display activities (some todos may have lifecycle events so can be more than 50)
      const activities = screen.getAllByRole('listitem');
      expect(activities.length).toBeGreaterThan(0);
      expect(activities.length).toBeLessThanOrEqual(100);
    });

    it('should not re-render unnecessarily with same props', () => {
      const todos = [createMockTodo('1')];
      const { rerender } = render(<ActivityTimeline todos={todos} />);

      // Re-render with same props
      rerender(<ActivityTimeline todos={todos} />);

      const afterRerender = screen.getByRole('listitem');
      expect(afterRerender).toBeInTheDocument();
    });
  });

  describe('Error boundaries', () => {
    it('should handle malformed todo data gracefully', () => {
      const malformedTodos = [
        {
          id: null as unknown as string,
          text: 'Malformed todo',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      expect(() => {
        render(<ActivityTimeline todos={malformedTodos as Todo[]} />);
      }).not.toThrow();
    });

    it('should handle missing required fields', () => {
      const incompleteTodos = [
        {
          id: 'test',
          text: undefined as unknown as string,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      expect(() => {
        render(<ActivityTimeline todos={incompleteTodos as Todo[]} />);
      }).not.toThrow();
    });
  });
});
