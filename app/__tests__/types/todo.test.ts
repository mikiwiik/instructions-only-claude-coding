import type {
  Todo,
  TodoFilter,
  TodoState,
  SharedTodo,
  Participant,
  SharedList,
  Conflict,
  CreateSharedListRequest,
  CreateSharedListResponse,
  SyncRequest,
  SyncResponse,
} from '../../types/todo';
import {
  TodoSchema,
  SharedTodoSchema,
  ParticipantSchema,
  SharedListSchema,
  ConflictSchema,
  isSharedTodo,
  isLocalTodo,
  isParticipant,
  isConflict,
  validateTodo,
  validateSharedTodo,
  isValidUUID,
  safeParseTodo,
  safeParseSharedTodo,
} from '../../types/todo';
import { TEST_UUIDS, TEST_COLORS } from '../fixtures/test-constants';
import {
  createMockSharedTodo,
  createMockParticipant,
} from '../utils/test-utils';

describe('Todo Types', () => {
  it('should define a Todo interface with correct properties', () => {
    const todo: Todo = {
      id: '1',
      text: 'Test todo',
      completedAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(todo).toHaveProperty('id');
    expect(todo).toHaveProperty('text');
    expect(todo).toHaveProperty('completedAt');
    expect(todo).toHaveProperty('createdAt');
    expect(todo).toHaveProperty('updatedAt');

    expect(typeof todo.id).toBe('string');
    expect(typeof todo.text).toBe('string');
    expect(todo.completedAt).toBeUndefined();
    expect(todo.createdAt).toBeInstanceOf(Date);
    expect(todo.updatedAt).toBeInstanceOf(Date);
  });

  it('should support optional sortOrder field for LexoRank ordering (ADR-033)', () => {
    const todoWithSortOrder: Todo = {
      id: '1',
      text: 'Test todo',
      createdAt: new Date(),
      updatedAt: new Date(),
      sortOrder: '0|hzzzzz:',
    };

    expect(todoWithSortOrder.sortOrder).toBe('0|hzzzzz:');

    const todoWithoutSortOrder: Todo = {
      id: '2',
      text: 'Test todo without sort order',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(todoWithoutSortOrder.sortOrder).toBeUndefined();
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
          completedAt: undefined,
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

describe('Shared List Interfaces', () => {
  describe('SharedTodo', () => {
    it('should define a SharedTodo interface extending Todo with shared list properties', () => {
      const sharedTodo: SharedTodo = createMockSharedTodo({
        id: TEST_UUIDS.TODO_1,
        text: 'Shared todo item',
        listId: TEST_UUIDS.LIST_1,
        authorId: TEST_UUIDS.USER_1,
        lastModifiedBy: TEST_UUIDS.USER_1,
      });

      expect(sharedTodo).toHaveProperty('id');
      expect(sharedTodo).toHaveProperty('text');
      expect(sharedTodo).toHaveProperty('listId');
      expect(sharedTodo).toHaveProperty('authorId');
      expect(sharedTodo).toHaveProperty('lastModifiedBy');
      expect(sharedTodo).toHaveProperty('syncVersion');
      expect(typeof sharedTodo.syncVersion).toBe('number');
    });
  });

  describe('Participant', () => {
    it('should define a Participant interface with correct properties', () => {
      const participant: Participant = createMockParticipant({
        id: TEST_UUIDS.TODO_1,
        color: TEST_COLORS.RED,
      });

      expect(participant).toHaveProperty('id');
      expect(participant).toHaveProperty('color');
      expect(participant).toHaveProperty('lastSeenAt');
      expect(participant).toHaveProperty('isActive');
      expect(typeof participant.color).toBe('string');
      expect(participant.lastSeenAt).toBeInstanceOf(Date);
      expect(typeof participant.isActive).toBe('boolean');
    });
  });

  describe('SharedList', () => {
    it('should define a SharedList interface with correct properties', () => {
      const sharedList: SharedList = {
        id: TEST_UUIDS.TODO_1,
        name: 'Team Tasks',
        todos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSyncAt: new Date(),
        participantIds: [TEST_UUIDS.LIST_1],
        accessToken: 'test-token',
      };

      expect(sharedList).toHaveProperty('id');
      expect(sharedList).toHaveProperty('name');
      expect(sharedList).toHaveProperty('todos');
      expect(sharedList).toHaveProperty('participantIds');
      expect(sharedList).toHaveProperty('accessToken');
      expect(Array.isArray(sharedList.todos)).toBe(true);
      expect(Array.isArray(sharedList.participantIds)).toBe(true);
    });
  });

  describe('Conflict', () => {
    it('should define a Conflict interface with correct properties', () => {
      const baseTodo = {
        id: TEST_UUIDS.TODO_1,
        text: 'Conflicted todo',
        completedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: TEST_UUIDS.LIST_1,
        authorId: TEST_UUIDS.USER_1,
        lastModifiedBy: TEST_UUIDS.USER_1,
        syncVersion: 1,
      };

      const conflict: Conflict = {
        todoId: TEST_UUIDS.TODO_1,
        localVersion: baseTodo,
        remoteVersion: { ...baseTodo, text: 'Different text', syncVersion: 2 },
        detectedAt: new Date(),
        type: 'concurrent-update',
      };

      expect(conflict).toHaveProperty('todoId');
      expect(conflict).toHaveProperty('localVersion');
      expect(conflict).toHaveProperty('remoteVersion');
      expect(conflict).toHaveProperty('detectedAt');
      expect(conflict).toHaveProperty('type');
      expect(['update', 'delete', 'concurrent-update']).toContain(
        conflict.type
      );
    });
  });
});

describe('Zod Validation Schemas', () => {
  describe('TodoSchema', () => {
    it('should validate a valid Todo object', () => {
      const validTodo = {
        id: TEST_UUIDS.TODO_1,
        text: 'Valid todo',
        completedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => TodoSchema.parse(validTodo)).not.toThrow();
    });

    it('should reject invalid UUID format', () => {
      const invalidTodo = {
        id: 'invalid-uuid',
        text: 'Invalid todo',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => TodoSchema.parse(invalidTodo)).toThrow();
    });

    it('should reject empty text', () => {
      const invalidTodo = {
        id: TEST_UUIDS.TODO_1,
        text: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => TodoSchema.parse(invalidTodo)).toThrow(
        'Todo text cannot be empty'
      );
    });

    it('should reject text exceeding 500 characters', () => {
      const invalidTodo = {
        id: TEST_UUIDS.TODO_1,
        text: 'a'.repeat(501),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => TodoSchema.parse(invalidTodo)).toThrow('Todo text too long');
    });

    it('should accept optional sortOrder field (ADR-033)', () => {
      const todoWithSortOrder = {
        id: TEST_UUIDS.TODO_1,
        text: 'Valid todo',
        createdAt: new Date(),
        updatedAt: new Date(),
        sortOrder: '0|hzzzzz:',
      };

      const result = TodoSchema.parse(todoWithSortOrder);
      expect(result.sortOrder).toBe('0|hzzzzz:');
    });

    it('should accept Todo without sortOrder field (backward compatibility)', () => {
      const todoWithoutSortOrder = {
        id: TEST_UUIDS.TODO_1,
        text: 'Valid todo',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => TodoSchema.parse(todoWithoutSortOrder)).not.toThrow();
    });
  });

  describe('SharedTodoSchema', () => {
    it('should validate a valid SharedTodo object', () => {
      const validSharedTodo = {
        id: TEST_UUIDS.TODO_1,
        text: 'Valid shared todo',
        completedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: TEST_UUIDS.LIST_1,
        authorId: TEST_UUIDS.USER_1,
        lastModifiedBy: TEST_UUIDS.USER_1,
        syncVersion: 1,
      };

      expect(() => SharedTodoSchema.parse(validSharedTodo)).not.toThrow();
    });

    it('should reject SharedTodo with invalid listId UUID', () => {
      const invalidSharedTodo = {
        id: TEST_UUIDS.TODO_1,
        text: 'Invalid shared todo',
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: 'invalid-uuid',
        authorId: TEST_UUIDS.USER_1,
        lastModifiedBy: TEST_UUIDS.USER_1,
        syncVersion: 1,
      };

      expect(() => SharedTodoSchema.parse(invalidSharedTodo)).toThrow(
        'Invalid UUID format'
      );
    });

    it('should reject SharedTodo with non-positive syncVersion', () => {
      const invalidSharedTodo = {
        id: TEST_UUIDS.TODO_1,
        text: 'Invalid shared todo',
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: TEST_UUIDS.LIST_1,
        authorId: TEST_UUIDS.USER_1,
        lastModifiedBy: TEST_UUIDS.USER_1,
        syncVersion: 0,
      };

      expect(() => SharedTodoSchema.parse(invalidSharedTodo)).toThrow();
    });

    it('should accept optional sortOrder field for SharedTodo (ADR-033)', () => {
      const sharedTodoWithSortOrder = {
        id: TEST_UUIDS.TODO_1,
        text: 'Valid shared todo',
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: TEST_UUIDS.LIST_1,
        authorId: TEST_UUIDS.USER_1,
        lastModifiedBy: TEST_UUIDS.USER_1,
        syncVersion: 1,
        sortOrder: '0|hzzzzz:',
      };

      const result = SharedTodoSchema.parse(sharedTodoWithSortOrder);
      expect(result.sortOrder).toBe('0|hzzzzz:');
    });
  });

  describe('ParticipantSchema', () => {
    it('should validate a valid Participant object', () => {
      const validParticipant = {
        id: TEST_UUIDS.TODO_1,
        color: TEST_COLORS.RED,
        lastSeenAt: new Date(),
        isActive: true,
      };

      expect(() => ParticipantSchema.parse(validParticipant)).not.toThrow();
    });

    it('should reject Participant with invalid color format', () => {
      const invalidParticipant = {
        id: TEST_UUIDS.TODO_1,
        color: 'red',
        lastSeenAt: new Date(),
        isActive: true,
      };

      expect(() => ParticipantSchema.parse(invalidParticipant)).toThrow(
        'Invalid color format'
      );
    });

    it('should reject Participant with invalid UUID', () => {
      const invalidParticipant = {
        id: 'invalid-uuid',
        color: TEST_COLORS.RED,
        lastSeenAt: new Date(),
        isActive: true,
      };

      expect(() => ParticipantSchema.parse(invalidParticipant)).toThrow(
        'Invalid UUID format'
      );
    });
  });

  describe('SharedListSchema', () => {
    it('should validate a valid SharedList object', () => {
      const validSharedList = {
        id: TEST_UUIDS.TODO_1,
        name: 'Team Tasks',
        todos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSyncAt: new Date(),
        participantIds: [TEST_UUIDS.LIST_1],
        accessToken: 'test-token',
      };

      expect(() => SharedListSchema.parse(validSharedList)).not.toThrow();
    });

    it('should reject SharedList with empty name', () => {
      const invalidSharedList = {
        id: TEST_UUIDS.TODO_1,
        name: '',
        todos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSyncAt: new Date(),
        participantIds: [],
      };

      expect(() => SharedListSchema.parse(invalidSharedList)).toThrow(
        'List name cannot be empty'
      );
    });

    it('should reject SharedList with name exceeding 100 characters', () => {
      const invalidSharedList = {
        id: TEST_UUIDS.TODO_1,
        name: 'a'.repeat(101),
        todos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSyncAt: new Date(),
        participantIds: [],
      };

      expect(() => SharedListSchema.parse(invalidSharedList)).toThrow(
        'List name too long'
      );
    });
  });

  describe('ConflictSchema', () => {
    it('should validate a valid Conflict object', () => {
      const baseTodo = {
        id: TEST_UUIDS.TODO_1,
        text: 'Conflicted todo',
        completedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: TEST_UUIDS.LIST_1,
        authorId: TEST_UUIDS.USER_1,
        lastModifiedBy: TEST_UUIDS.USER_1,
        syncVersion: 1,
      };

      const validConflict = {
        todoId: TEST_UUIDS.TODO_1,
        localVersion: baseTodo,
        remoteVersion: { ...baseTodo, syncVersion: 2 },
        detectedAt: new Date(),
        type: 'update',
      };

      expect(() => ConflictSchema.parse(validConflict)).not.toThrow();
    });

    it('should reject Conflict with invalid type', () => {
      const baseTodo = {
        id: TEST_UUIDS.TODO_1,
        text: 'Conflicted todo',
        completedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: TEST_UUIDS.LIST_1,
        authorId: TEST_UUIDS.USER_1,
        lastModifiedBy: TEST_UUIDS.USER_1,
        syncVersion: 1,
      };

      const invalidConflict = {
        todoId: TEST_UUIDS.TODO_1,
        localVersion: baseTodo,
        remoteVersion: baseTodo,
        detectedAt: new Date(),
        type: 'invalid-type',
      };

      expect(() => ConflictSchema.parse(invalidConflict)).toThrow();
    });
  });
});

describe('Type Guards', () => {
  describe('isSharedTodo', () => {
    it('should return true for SharedTodo objects', () => {
      const sharedTodo: SharedTodo = {
        id: TEST_UUIDS.TODO_1,
        text: 'Shared todo',
        completedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: TEST_UUIDS.LIST_1,
        authorId: TEST_UUIDS.USER_1,
        lastModifiedBy: TEST_UUIDS.USER_1,
        syncVersion: 1,
      };

      expect(isSharedTodo(sharedTodo)).toBe(true);
    });

    it('should return false for regular Todo objects', () => {
      const todo: Todo = {
        id: TEST_UUIDS.TODO_1,
        text: 'Regular todo',
        completedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(isSharedTodo(todo)).toBe(false);
    });
  });

  describe('isLocalTodo', () => {
    it('should return true for regular Todo objects', () => {
      const todo: Todo = {
        id: TEST_UUIDS.TODO_1,
        text: 'Regular todo',
        completedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(isLocalTodo(todo)).toBe(true);
    });

    it('should return false for SharedTodo objects', () => {
      const sharedTodo: SharedTodo = {
        id: TEST_UUIDS.TODO_1,
        text: 'Shared todo',
        completedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: TEST_UUIDS.LIST_1,
        authorId: TEST_UUIDS.USER_1,
        lastModifiedBy: TEST_UUIDS.USER_1,
        syncVersion: 1,
      };

      expect(isLocalTodo(sharedTodo)).toBe(false);
    });
  });

  describe('isParticipant', () => {
    it('should return true for valid Participant objects', () => {
      const participant = {
        id: TEST_UUIDS.TODO_1,
        color: TEST_COLORS.RED,
        lastSeenAt: new Date(),
        isActive: true,
      };

      expect(isParticipant(participant)).toBe(true);
    });

    it('should return false for invalid Participant objects', () => {
      const invalidParticipant = {
        id: 'invalid-uuid',
        color: 'red',
        lastSeenAt: new Date(),
        isActive: true,
      };

      expect(isParticipant(invalidParticipant)).toBe(false);
    });

    it('should return false for non-Participant objects', () => {
      const notParticipant = { id: '123', name: 'John' };

      expect(isParticipant(notParticipant)).toBe(false);
    });
  });

  describe('isConflict', () => {
    it('should return true for valid Conflict objects', () => {
      const baseTodo = {
        id: TEST_UUIDS.TODO_1,
        text: 'Conflicted todo',
        completedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: TEST_UUIDS.LIST_1,
        authorId: TEST_UUIDS.USER_1,
        lastModifiedBy: TEST_UUIDS.USER_1,
        syncVersion: 1,
      };

      const conflict = {
        todoId: TEST_UUIDS.TODO_1,
        localVersion: baseTodo,
        remoteVersion: { ...baseTodo, syncVersion: 2 },
        detectedAt: new Date(),
        type: 'update',
      };

      expect(isConflict(conflict)).toBe(true);
    });

    it('should return false for invalid Conflict objects', () => {
      const invalidConflict = {
        todoId: 'invalid-uuid',
        localVersion: {},
        remoteVersion: {},
        detectedAt: new Date(),
        type: 'invalid',
      };

      expect(isConflict(invalidConflict)).toBe(false);
    });
  });
});

describe('Validation Utilities', () => {
  describe('validateTodo', () => {
    it('should validate and return a valid Todo', () => {
      const validTodo = {
        id: TEST_UUIDS.TODO_1,
        text: 'Valid todo',
        completedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = validateTodo(validTodo);
      expect(result).toEqual(validTodo);
    });

    it('should throw ZodError for invalid Todo', () => {
      const invalidTodo = {
        id: 'invalid-uuid',
        text: 'Invalid todo',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => validateTodo(invalidTodo)).toThrow();
    });
  });

  describe('validateSharedTodo', () => {
    it('should validate and return a valid SharedTodo', () => {
      const validSharedTodo = {
        id: TEST_UUIDS.TODO_1,
        text: 'Valid shared todo',
        completedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: TEST_UUIDS.LIST_1,
        authorId: TEST_UUIDS.USER_1,
        lastModifiedBy: TEST_UUIDS.USER_1,
        syncVersion: 1,
      };

      const result = validateSharedTodo(validSharedTodo);
      expect(result).toEqual(validSharedTodo);
    });

    it('should throw ZodError for invalid SharedTodo', () => {
      const invalidSharedTodo = {
        id: 'invalid-uuid',
        text: 'Invalid shared todo',
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: 'invalid',
        authorId: 'invalid',
        lastModifiedBy: 'invalid',
        syncVersion: 0,
      };

      expect(() => validateSharedTodo(invalidSharedTodo)).toThrow();
    });
  });

  describe('isValidUUID', () => {
    it('should return true for valid UUID v4 strings', () => {
      expect(isValidUUID(TEST_UUIDS.TODO_1)).toBe(true);
      expect(isValidUUID(TEST_UUIDS.LIST_1)).toBe(true);
    });

    it('should return false for invalid UUIDs', () => {
      expect(isValidUUID('invalid-uuid')).toBe(false);
      expect(isValidUUID('123')).toBe(false);
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID('550e8400-e29b-41d4-a716-44665544000')).toBe(false); // Too short
    });
  });

  describe('safeParseTodo', () => {
    it('should return success object for valid Todo', () => {
      const validTodo = {
        id: TEST_UUIDS.TODO_1,
        text: 'Valid todo',
        completedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = safeParseTodo(validTodo);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validTodo);
      }
    });

    it('should return error object for invalid Todo', () => {
      const invalidTodo = {
        id: 'invalid-uuid',
        text: 'Invalid todo',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = safeParseTodo(invalidTodo);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('safeParseSharedTodo', () => {
    it('should return success object for valid SharedTodo', () => {
      const validSharedTodo = {
        id: TEST_UUIDS.TODO_1,
        text: 'Valid shared todo',
        completedAt: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: TEST_UUIDS.LIST_1,
        authorId: TEST_UUIDS.USER_1,
        lastModifiedBy: TEST_UUIDS.USER_1,
        syncVersion: 1,
      };

      const result = safeParseSharedTodo(validSharedTodo);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validSharedTodo);
      }
    });

    it('should return error object for invalid SharedTodo', () => {
      const invalidSharedTodo = {
        id: 'invalid-uuid',
        text: 'Invalid shared todo',
        createdAt: new Date(),
        updatedAt: new Date(),
        listId: 'invalid',
        authorId: 'invalid',
        lastModifiedBy: 'invalid',
        syncVersion: 0,
      };

      const result = safeParseSharedTodo(invalidSharedTodo);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });
});

describe('API Request/Response Types', () => {
  describe('CreateSharedListRequest', () => {
    it('should define CreateSharedListRequest with correct properties', () => {
      const request: CreateSharedListRequest = {
        name: 'Team Tasks',
        initialTodos: [
          {
            text: 'First task',
            completedAt: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      expect(request).toHaveProperty('name');
      expect(request).toHaveProperty('initialTodos');
      expect(Array.isArray(request.initialTodos)).toBe(true);
    });

    it('should allow CreateSharedListRequest without initialTodos', () => {
      const request: CreateSharedListRequest = {
        name: 'Empty List',
      };

      expect(request).toHaveProperty('name');
      expect(request.initialTodos).toBeUndefined();
    });
  });

  describe('CreateSharedListResponse', () => {
    it('should define CreateSharedListResponse with correct properties', () => {
      const response: CreateSharedListResponse = {
        list: {
          id: TEST_UUIDS.TODO_1,
          name: 'Team Tasks',
          todos: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSyncAt: new Date(),
          participantIds: [TEST_UUIDS.LIST_1],
        },
        participant: {
          id: TEST_UUIDS.LIST_1,
          color: TEST_COLORS.RED,
          lastSeenAt: new Date(),
          isActive: true,
        },
        accessToken: 'test-access-token',
      };

      expect(response).toHaveProperty('list');
      expect(response).toHaveProperty('participant');
      expect(response).toHaveProperty('accessToken');
    });
  });

  describe('SyncRequest', () => {
    it('should define SyncRequest with correct properties', () => {
      const request: SyncRequest = {
        listId: TEST_UUIDS.TODO_1,
        accessToken: 'test-token',
        localChanges: {
          added: [],
          updated: [],
          deleted: [],
        },
        lastSyncVersion: 5,
      };

      expect(request).toHaveProperty('listId');
      expect(request).toHaveProperty('accessToken');
      expect(request).toHaveProperty('localChanges');
      expect(request).toHaveProperty('lastSyncVersion');
      expect(request.localChanges).toHaveProperty('added');
      expect(request.localChanges).toHaveProperty('updated');
      expect(request.localChanges).toHaveProperty('deleted');
    });
  });

  describe('SyncResponse', () => {
    it('should define SyncResponse with correct properties', () => {
      const response: SyncResponse = {
        remoteChanges: {
          added: [],
          updated: [],
          deleted: [],
        },
        conflicts: [],
        participants: [
          {
            id: TEST_UUIDS.LIST_1,
            color: TEST_COLORS.RED,
            lastSeenAt: new Date(),
            isActive: true,
          },
        ],
        newSyncVersion: 6,
      };

      expect(response).toHaveProperty('remoteChanges');
      expect(response).toHaveProperty('conflicts');
      expect(response).toHaveProperty('participants');
      expect(response).toHaveProperty('newSyncVersion');
      expect(response.remoteChanges).toHaveProperty('added');
      expect(response.remoteChanges).toHaveProperty('updated');
      expect(response.remoteChanges).toHaveProperty('deleted');
    });
  });
});
