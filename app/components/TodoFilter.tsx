import { TodoFilter as TodoFilterType } from '../types/todo';

interface TodoFilterProps {
  currentFilter: TodoFilterType;
  onFilterChange: (filter: TodoFilterType) => void;
  activeTodosCount: number;
  completedTodosCount: number;
  deletedTodosCount: number;
  activityCount: number;
}

const filterLabels: Record<TodoFilterType, string> = {
  all: 'All',
  active: 'Active',
  completed: 'Completed',
  'recently-deleted': 'Recently Deleted',
  activity: 'Activity',
};

export default function TodoFilter({
  currentFilter,
  onFilterChange,
  activeTodosCount,
  completedTodosCount,
  deletedTodosCount,
  activityCount,
}: TodoFilterProps) {
  const filters: { key: TodoFilterType; label: string; count: number }[] = [
    {
      key: 'all',
      label: filterLabels.all,
      count: activeTodosCount + completedTodosCount,
    },
    { key: 'active', label: filterLabels.active, count: activeTodosCount },
    {
      key: 'completed',
      label: filterLabels.completed,
      count: completedTodosCount,
    },
    {
      key: 'recently-deleted',
      label: filterLabels['recently-deleted'],
      count: deletedTodosCount,
    },
    { key: 'activity', label: filterLabels.activity, count: activityCount },
  ];

  return (
    <div
      className='flex flex-wrap gap-2 mb-4'
      role='tablist'
      aria-label='Filter todos'
    >
      {filters.map(({ key, label, count }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`px-2 md:px-3 py-2 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
            currentFilter === key
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
          }`}
          role='tab'
          aria-selected={currentFilter === key}
          aria-label={`${label} (${count})`}
          type='button'
        >
          {label} ({count})
        </button>
      ))}
    </div>
  );
}
