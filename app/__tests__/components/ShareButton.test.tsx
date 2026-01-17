/**
 * Tests for ShareButton component
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShareButton from '@/components/ShareButton';
import * as listManager from '@/lib/list-manager';
import * as rememberedLists from '@/lib/remembered-lists';
import type { Todo } from '@/types/todo';

// Mock the modules
jest.mock('@/lib/list-manager', () => ({
  shareList: jest.fn(),
  copyToClipboard: jest.fn(),
}));

jest.mock('@/lib/remembered-lists', () => ({
  addRememberedList: jest.fn(),
}));

describe('ShareButton', () => {
  const mockTodos: Todo[] = [
    {
      id: 'todo-1',
      text: 'Test todo',
      createdAt: new Date('2024-01-01'),
      sortOrder: 'a',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders share button', () => {
    render(<ShareButton todos={mockTodos} />);

    const button = screen.getByRole('button', { name: /share this list/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Share List');
  });

  it('is disabled when todos array is empty', () => {
    render(<ShareButton todos={[]} />);

    const button = screen.getByRole('button', { name: /share this list/i });
    expect(button).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<ShareButton todos={mockTodos} disabled />);

    const button = screen.getByRole('button', { name: /share this list/i });
    expect(button).toBeDisabled();
  });

  it('opens dialog and shows sharing state when clicked', async () => {
    const user = userEvent.setup();
    let resolveShare: (value: { listId: string; url: string }) => void;
    const sharePromise = new Promise<{ listId: string; url: string }>(
      (resolve) => {
        resolveShare = resolve;
      }
    );
    (listManager.shareList as jest.Mock).mockReturnValueOnce(sharePromise);

    render(<ShareButton todos={mockTodos} />);

    await user.click(screen.getByRole('button', { name: /share this list/i }));

    // Dialog should be open with sharing state
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Sharing list...')).toBeInTheDocument();

    // Resolve the share
    resolveShare!({
      listId: 'new-list-id',
      url: 'https://example.com/list/new-list-id',
    });

    await waitFor(() => {
      expect(screen.getByText('List shared!')).toBeInTheDocument();
    });
  });

  it('calls shareList with todos', async () => {
    const user = userEvent.setup();
    (listManager.shareList as jest.Mock).mockResolvedValueOnce({
      listId: 'new-list-id',
      url: 'https://example.com/list/new-list-id',
    });

    render(<ShareButton todos={mockTodos} />);

    await user.click(screen.getByRole('button', { name: /share this list/i }));

    await waitFor(() => {
      expect(listManager.shareList).toHaveBeenCalledWith(mockTodos);
    });
  });

  it('adds list to remembered lists on success', async () => {
    const user = userEvent.setup();
    (listManager.shareList as jest.Mock).mockResolvedValueOnce({
      listId: 'new-list-id',
      url: 'https://example.com/list/new-list-id',
    });

    render(<ShareButton todos={mockTodos} />);

    await user.click(screen.getByRole('button', { name: /share this list/i }));

    await waitFor(() => {
      expect(rememberedLists.addRememberedList).toHaveBeenCalledWith({
        listId: 'new-list-id',
        isOwner: true,
      });
    });
  });

  it('calls onShared callback with listId and url', async () => {
    const user = userEvent.setup();
    const onShared = jest.fn();
    (listManager.shareList as jest.Mock).mockResolvedValueOnce({
      listId: 'new-list-id',
      url: 'https://example.com/list/new-list-id',
    });

    render(<ShareButton todos={mockTodos} onShared={onShared} />);

    await user.click(screen.getByRole('button', { name: /share this list/i }));

    await waitFor(() => {
      expect(onShared).toHaveBeenCalledWith(
        'new-list-id',
        'https://example.com/list/new-list-id'
      );
    });
  });

  it('shows error state when share fails', async () => {
    const user = userEvent.setup();
    (listManager.shareList as jest.Mock).mockRejectedValueOnce({
      code: 'NETWORK_ERROR',
      message: 'Network error occurred',
    });

    render(<ShareButton todos={mockTodos} />);

    await user.click(screen.getByRole('button', { name: /share this list/i }));

    await waitFor(() => {
      expect(screen.getByText('Share failed')).toBeInTheDocument();
      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
    });
  });

  it('closes dialog when clicking Done button', async () => {
    const user = userEvent.setup();
    (listManager.shareList as jest.Mock).mockResolvedValueOnce({
      listId: 'new-list-id',
      url: 'https://example.com/list/new-list-id',
    });

    render(<ShareButton todos={mockTodos} />);

    await user.click(screen.getByRole('button', { name: /share this list/i }));

    await waitFor(() => {
      expect(screen.getByText('List shared!')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Done' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
