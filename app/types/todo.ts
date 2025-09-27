export interface Todo {
  id: string;
  text: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type TodoFilter = 'all' | 'active' | 'completed' | 'recently-deleted';

export interface TodoState {
  todos: Todo[];
  filter: TodoFilter;
}
