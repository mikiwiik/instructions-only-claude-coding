export interface Todo {
  id: string;
  text: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type TodoFilter =
  | 'all'
  | 'active'
  | 'completed'
  | 'recently-deleted'
  | 'activity';

export interface ActivityEvent {
  id: string;
  todoId: string;
  todoText: string;
  action: 'created' | 'edited' | 'completed' | 'restored' | 'deleted';
  timestamp: Date;
  details?: string;
}

export interface TodoState {
  todos: Todo[];
  filter: TodoFilter;
}
