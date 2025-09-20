import { renderHook, act } from '@testing-library/react';
import { useTodos } from '../../hooks/useTodos';

describe('useTodos hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with empty todos array', () => {
    const { result } = renderHook(() => useTodos());

    expect(result.current.todos).toEqual([]);
    expect(result.current.filter).toBe('all');
  });

  it('should add a new todo', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Learn React Testing');
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0]).toMatchObject({
      text: 'Learn React Testing',
      completed: false,
    });
    expect(result.current.todos[0]).toHaveProperty('id');
    expect(result.current.todos[0]).toHaveProperty('createdAt');
    expect(result.current.todos[0]).toHaveProperty('updatedAt');
  });

  it('should generate unique IDs for each todo', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('First todo');
      result.current.addTodo('Second todo');
    });

    expect(result.current.todos).toHaveLength(2);
    expect(result.current.todos[0].id).not.toBe(result.current.todos[1].id);
  });

  it('should set createdAt and updatedAt timestamps', () => {
    const { result } = renderHook(() => useTodos());
    const beforeTime = new Date();

    act(() => {
      result.current.addTodo('Timestamped todo');
    });

    const afterTime = new Date();
    const todo = result.current.todos[0];

    expect(todo.createdAt).toBeInstanceOf(Date);
    expect(todo.updatedAt).toBeInstanceOf(Date);
    expect(todo.createdAt.getTime()).toBeGreaterThanOrEqual(
      beforeTime.getTime()
    );
    expect(todo.createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    expect(todo.updatedAt.getTime()).toBe(todo.createdAt.getTime());
  });

  it('should add todos to the beginning of the list', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('First todo');
      result.current.addTodo('Second todo');
    });

    expect(result.current.todos[0].text).toBe('Second todo');
    expect(result.current.todos[1].text).toBe('First todo');
  });

  it('should persist todos to localStorage when adding', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Persistent todo');
    });

    const storedTodos = JSON.parse(localStorage.getItem('todos') || '[]');
    expect(storedTodos).toHaveLength(1);
    expect(storedTodos[0].text).toBe('Persistent todo');
  });

  it('should load todos from localStorage on initialization', () => {
    const existingTodos = [
      {
        id: 'existing-1',
        text: 'Existing todo',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('todos', JSON.stringify(existingTodos));

    const { result } = renderHook(() => useTodos());

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('Existing todo');
    expect(result.current.todos[0].createdAt).toBeInstanceOf(Date);
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorage.setItem('todos', 'invalid json');

    const { result } = renderHook(() => useTodos());

    expect(result.current.todos).toEqual([]);
  });

  it('should not add empty or whitespace-only todos', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('');
      result.current.addTodo('   ');
      result.current.addTodo('\t\n');
    });

    expect(result.current.todos).toHaveLength(0);
  });

  it('should trim whitespace from todo text', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('  Trimmed todo  ');
    });

    expect(result.current.todos[0].text).toBe('Trimmed todo');
  });
});
