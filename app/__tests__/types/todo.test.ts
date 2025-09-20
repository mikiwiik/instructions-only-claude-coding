import type { Todo, TodoFilter, TodoState } from '../../types/todo';

describe('Todo Types', () => {
  it('should define a Todo interface with correct properties', () => {
    const todo: Todo = {
      id: '1',
      text: 'Test todo',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(todo).toHaveProperty('id');
    expect(todo).toHaveProperty('text');
    expect(todo).toHaveProperty('completed');
    expect(todo).toHaveProperty('createdAt');
    expect(todo).toHaveProperty('updatedAt');

    expect(typeof todo.id).toBe('string');
    expect(typeof todo.text).toBe('string');
    expect(typeof todo.completed).toBe('boolean');
    expect(todo.createdAt).toBeInstanceOf(Date);
    expect(todo.updatedAt).toBeInstanceOf(Date);
  });

  it('should define TodoFilter type with correct values', () => {
    const validFilters: TodoFilter[] = ['all', 'active', 'completed'];

    validFilters.forEach((filter) => {
      expect(['all', 'active', 'completed']).toContain(filter);
    });
  });

  it('should define a TodoState interface with correct properties', () => {
    const todoState: TodoState = {
      todos: [
        {
          id: '1',
          text: 'Test todo',
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      filter: 'all',
    };

    expect(todoState).toHaveProperty('todos');
    expect(todoState).toHaveProperty('filter');
    expect(Array.isArray(todoState.todos)).toBe(true);
    expect(['all', 'active', 'completed']).toContain(todoState.filter);
  });
});
