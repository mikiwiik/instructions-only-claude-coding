import { Todo } from '../types/todo';
import {
  generateActivityTimeline,
  groupActivitiesByTime,
  getActivityIcon,
} from '../utils/activity';

interface ActivityTimelineProps {
  todos: Todo[];
}

export default function ActivityTimeline({ todos }: ActivityTimelineProps) {
  const activities = generateActivityTimeline(todos);
  const groupedActivities = groupActivitiesByTime(activities);

  if (activities.length === 0) {
    return (
      <div className='text-center py-6 md:py-8 px-4'>
        <p className='text-muted-foreground text-base md:text-lg'>
          No activity yet
        </p>
        <p className='text-muted-foreground text-xs md:text-sm mt-2 max-w-md mx-auto'>
          Start creating todos to see your activity timeline here
        </p>
      </div>
    );
  }

  return (
    <div
      className='space-y-4 md:space-y-6'
      role='main'
      aria-label='Activity timeline'
    >
      {Object.entries(groupedActivities).map(([timeGroup, timeActivities]) => (
        <div key={timeGroup} className='space-y-2 md:space-y-3'>
          <h3 className='text-base md:text-lg font-semibold text-foreground border-b border-border pb-1 md:pb-2'>
            {timeGroup}
          </h3>
          <ul className='space-y-1 md:space-y-2'>
            {timeActivities.map((activity) => (
              <li
                key={activity.id}
                className='flex items-start space-x-2 md:space-x-3 p-2 md:p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors'
                aria-label={`${activity.action} "${activity.todoText}" ${formatRelativeTime(activity.timestamp)}`}
              >
                <div className='flex-shrink-0 mt-0.5'>
                  <span
                    className='text-base md:text-lg'
                    role='img'
                    aria-label={`${activity.action} action`}
                  >
                    {getActivityIcon(activity.action)}
                  </span>
                </div>
                <div className='flex-grow min-w-0'>
                  <p className='text-xs md:text-sm text-foreground break-words'>
                    <span className='font-medium capitalize'>
                      {activity.action}
                    </span>{' '}
                    <span className='text-muted-foreground'>
                      &ldquo;{activity.todoText}&rdquo;
                    </span>
                  </p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * Formats relative time for activity display
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return 'just now';
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMinutes < 1) {
    return 'just now';
  }

  if (diffMinutes < 60) {
    const unit = diffMinutes === 1 ? 'minute' : 'minutes';
    return `${diffMinutes} ${unit} ago`;
  }

  if (diffHours < 24) {
    const unit = diffHours === 1 ? 'hour' : 'hours';
    return `${diffHours} ${unit} ago`;
  }

  // For older items, show the actual time
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
