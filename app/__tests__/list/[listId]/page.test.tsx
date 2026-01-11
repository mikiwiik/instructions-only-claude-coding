import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import ListPage from '../../../list/[listId]/page';

// Mock useTodos hook
const mockUseTodos = jest.fn();
jest.mock('../../../hooks/useTodos', () => ({
  useTodos: (...args: unknown[]) => mockUseTodos(...args),
}));

// Mock MAIN_LIST_ID
jest.mock('../../../hooks/useTodoSync', () => ({
  MAIN_LIST_ID: 'main-list',
}));

// Default mock return value
const defaultMockReturn = {
  todos: [],
  allTodos: [],
  filter: 'active' as const,
  isLoading: false,
  isInitialized: true,
  addTodo: jest.fn(),
  toggleTodo: jest.fn(),
  restoreTodo: jest.fn(),
  deleteTodo: jest.fn(),
  permanentlyDeleteTodo: jest.fn(),
  restoreDeletedTodo: jest.fn(),
  editTodo: jest.fn(),
  reorderTodos: jest.fn(),
  moveUp: jest.fn(),
  moveDown: jest.fn(),
  setFilter: jest.fn(),
  rateLimitState: {
    isRateLimited: false,
    retryAfter: 0,
    message: '',
  },
  clearRateLimitState: jest.fn(),
};

// Helper to render with Suspense and wait for promise resolution
async function renderListPage(listId: string) {
  const params = Promise.resolve({ listId });

  await act(async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <ListPage params={params} />
      </Suspense>
    );
    // Wait for the promise to resolve
    await params;
  });
}

describe('ListPage (/list/[listId])', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTodos.mockReturnValue(defaultMockReturn);
  });

  it('renders todo list for given listId', async () => {
    const mockTodos = [
      {
        id: '1',
        text: 'Test todo item',
        completedAt: undefined,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        deletedAt: undefined,
        sortOrder: '0|hzzzzz:',
      },
    ];

    mockUseTodos.mockReturnValue({
      ...defaultMockReturn,
      todos: mockTodos,
      allTodos: mockTodos,
    });

    await renderListPage('test-list-123');

    expect(screen.getByText('Test todo item')).toBeInTheDocument();
  });

  it('passes listId to useTodos hook correctly', async () => {
    await renderListPage('custom-list-id');

    expect(mockUseTodos).toHaveBeenCalledWith('custom-list-id');
  });

  it('handles loading state', async () => {
    mockUseTodos.mockReturnValue({
      ...defaultMockReturn,
      isLoading: true,
      isInitialized: false,
    });

    await renderListPage('test-list');

    // Should show loading indicator
    expect(
      screen.getByRole('status', { name: /loading/i })
    ).toBeInTheDocument();
  });

  it('works with main-list (backward compatibility)', async () => {
    await renderListPage('main-list');

    expect(mockUseTodos).toHaveBeenCalledWith('main-list');
    // Should render the same UI as HomePage
    expect(
      screen.getByRole('heading', { name: /^TODO$/i })
    ).toBeInTheDocument();
  });

  it('shows empty state for non-existent list (graceful handling)', async () => {
    mockUseTodos.mockReturnValue({
      ...defaultMockReturn,
      todos: [],
      allTodos: [],
    });

    await renderListPage('non-existent-list');

    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  it('renders TodoForm component', async () => {
    await renderListPage('test-list');

    expect(screen.getByLabelText(/add new todo/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add todo/i })
    ).toBeInTheDocument();
  });

  it('allows adding a new todo', async () => {
    const addTodoMock = jest.fn();
    mockUseTodos.mockReturnValue({
      ...defaultMockReturn,
      addTodo: addTodoMock,
    });

    const user = userEvent.setup();
    await renderListPage('test-list');

    const input = screen.getByLabelText(/add new todo/i);
    const button = screen.getByRole('button', { name: /add todo/i });

    await user.type(input, 'New todo from list page');
    await user.click(button);

    expect(addTodoMock).toHaveBeenCalledWith('New todo from list page');
  });

  it('renders filter controls', async () => {
    await renderListPage('test-list');

    expect(screen.getByRole('tab', { name: /active/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /completed/i })).toBeInTheDocument();
  });

  it('displays rate limit warning when rate limited', async () => {
    mockUseTodos.mockReturnValue({
      ...defaultMockReturn,
      rateLimitState: {
        isRateLimited: true,
        retryAfter: 60,
        message: 'Too many requests. Please wait 60 seconds.',
      },
    });

    await renderListPage('test-list');

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByText(/too many requests. please wait 60 seconds/i)
    ).toBeInTheDocument();
  });

  it('renders main content area with proper accessibility', async () => {
    await renderListPage('test-list');

    expect(
      screen.getByRole('main', { name: /todo application/i })
    ).toBeInTheDocument();
  });
});
