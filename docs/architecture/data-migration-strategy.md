# Data Migration Strategy: localStorage to Shared Lists

**Document Version**: 1.0
**Date**: 2025-09-27
**Related ADR**: [ADR-013: Shared Lists Backend Architecture](../adr/ADR-013-shared-lists-backend-architecture.md)
**Related Issue**: [#85 - Scope backend persistence and multi-device sync architecture](https://github.com/mikiwiik/instructions-only-claude-coding/issues/85)

## Overview

This document outlines the strategy for migrating existing localStorage-based todo data to the new shared lists architecture while maintaining backward compatibility and providing a smooth user experience.

## Migration Goals

### Primary Objectives

1. **Zero Data Loss**: Ensure no existing todo data is lost during migration
2. **Backward Compatibility**: Existing localStorage functionality continues to work
3. **User Choice**: Allow users to choose when and how to migrate
4. **Seamless Experience**: Minimize user disruption during transition
5. **Rollback Capability**: Ability to revert to localStorage if needed

### Success Criteria

- [ ] All existing todos preserved and accessible
- [ ] Users can continue using local-only mode indefinitely
- [ ] Migration process completes without data corruption
- [ ] Both local and shared lists can coexist
- [ ] Performance maintained during migration

## Current Data Structure Analysis

### localStorage Schema (Current)

```typescript
// Key: 'todos'
interface Todo {
  id: string;                 // crypto.randomUUID() or fallback
  text: string;               // Todo text content
  completedAt?: Date;         // Completion timestamp
  createdAt: Date;            // Creation timestamp
  updatedAt: Date;            // Last modification timestamp
  deletedAt?: Date;           // Soft delete timestamp
}

// Storage format
localStorage.setItem('todos', JSON.stringify(Todo[]));
```

### Target Schema (Shared Lists)

```typescript
interface SharedList {
  id: string;                 // Share ID for URL
  name: string;               // List display name
  todos: SharedTodo[];        // Migrated todos
  createdAt: Date;
  updatedAt: Date;
  lastSyncAt: Date;
  participantIds: string[];   // [originalUserId] for migrated lists
  accessToken?: string;       // Optional for privacy
}

interface SharedTodo extends Todo {
  listId: string;             // Reference to SharedList
  authorId?: string;          // Original creator (anonymous)
  lastModifiedBy?: string;    // Last editor
  syncVersion: number;        // For conflict resolution
}
```

## Migration Architecture

### Migration Flow

```
localStorage → Migration Service → Upstash Redis → Share URL Generation
     ↓              ↓                ↓              ↓
  Original     Data Transform    Cloud Storage   Access Link
   Format      + Validation     + Persistence   + Security
```

### Migration Components

#### 1. Migration Detection Service

```typescript
interface MigrationDetector {
  hasLocalTodos(): boolean;
  needsMigration(): boolean;
  getMigrationOptions(): MigrationOption[];
}

// Implementation
export function useMigrationDetector() {
  const [hasLocalData, setHasLocalData] = useState(false);
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    const todos = localStorage.getItem('todos');
    const hasData = todos && JSON.parse(todos).length > 0;
    setHasLocalData(hasData);
    setIsEligible(hasData && !hasExistingSharedLists());
  }, []);

  return { hasLocalData, isEligible };
}
```

#### 2. Data Transformation Service

```typescript
interface MigrationTransformer {
  validateLocalData(todos: Todo[]): ValidationResult;
  transformToSharedFormat(todos: Todo[]): SharedTodo[];
  generateListMetadata(todos: Todo[]): SharedListMetadata;
}

// Implementation
export class TodoMigrationTransformer {
  validateLocalData(todos: Todo[]): ValidationResult {
    const errors: string[] = [];

    todos.forEach((todo, index) => {
      if (!todo.id) errors.push(`Todo ${index}: Missing ID`);
      if (!todo.text?.trim()) errors.push(`Todo ${index}: Empty text`);
      if (!todo.createdAt) errors.push(`Todo ${index}: Missing createdAt`);
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings: this.getCompatibilityWarnings(todos)
    };
  }

  transformToSharedFormat(todos: Todo[], listId: string): SharedTodo[] {
    const participantId = generateAnonymousId();

    return todos.map((todo, index) => ({
      ...todo,
      listId,
      authorId: participantId,
      lastModifiedBy: participantId,
      syncVersion: 1,
      // Ensure dates are properly formatted
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt),
      completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
      deletedAt: todo.deletedAt ? new Date(todo.deletedAt) : undefined
    }));
  }

  generateListMetadata(todos: Todo[]): SharedListMetadata {
    const activeTodos = todos.filter(t => !t.deletedAt);
    const completedCount = activeTodos.filter(t => t.completedAt).length;

    return {
      name: `My Todo List (${activeTodos.length} items, ${completedCount} completed)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSyncAt: new Date(),
      participantIds: [generateAnonymousId()],
      stats: {
        totalTodos: todos.length,
        activeTodos: activeTodos.length,
        completedTodos: completedCount,
        deletedTodos: todos.filter(t => t.deletedAt).length
      }
    };
  }
}
```

#### 3. Migration Execution Service

```typescript
interface MigrationExecutor {
  createBackup(): Promise<BackupResult>;
  executeMigration(options: MigrationOptions): Promise<MigrationResult>;
  rollback(backupId: string): Promise<RollbackResult>;
}

// Implementation
export class TodoMigrationExecutor {
  async executeMigration(options: MigrationOptions): Promise<MigrationResult> {
    const startTime = Date.now();

    try {
      // Step 1: Create backup
      const backup = await this.createBackup();

      // Step 2: Validate local data
      const localTodos = this.getLocalTodos();
      const validation = this.transformer.validateLocalData(localTodos);

      if (!validation.isValid) {
        throw new MigrationError('Data validation failed', validation.errors);
      }

      // Step 3: Transform data
      const listId = crypto.randomUUID();
      const metadata = this.transformer.generateListMetadata(localTodos);
      const sharedTodos = this.transformer.transformToSharedFormat(localTodos, listId);

      // Step 4: Create shared list
      const sharedList: SharedList = {
        id: listId,
        ...metadata,
        todos: sharedTodos
      };

      // Step 5: Upload to backend
      const response = await fetch('/api/shared/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          list: sharedList,
          options: {
            requireToken: options.requireToken,
            expiresAt: options.expiresAt
          }
        })
      });

      if (!response.ok) {
        throw new MigrationError('Failed to create shared list', await response.text());
      }

      const { shareUrl, accessToken } = await response.json();

      // Step 6: Handle local data based on strategy
      if (options.strategy === 'move') {
        localStorage.removeItem('todos');
      } else if (options.strategy === 'copy') {
        // Keep local copy
        this.markLocalAsMigrated(listId);
      }

      return {
        success: true,
        listId,
        shareUrl,
        accessToken,
        backupId: backup.id,
        migratedCount: sharedTodos.length,
        duration: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  }

  async createBackup(): Promise<BackupResult> {
    const todos = localStorage.getItem('todos');
    const timestamp = new Date().toISOString();
    const backupId = `backup_${timestamp}_${crypto.randomUUID().slice(0, 8)}`;

    // Store backup in localStorage with unique key
    const backup = {
      id: backupId,
      timestamp,
      data: todos,
      version: this.getCurrentVersion()
    };

    localStorage.setItem(`todo_backup_${backupId}`, JSON.stringify(backup));

    return {
      id: backupId,
      timestamp,
      size: todos?.length || 0
    };
  }
}
```

## Migration Strategies

### Strategy 1: Copy Migration (Recommended Default)

```typescript
const copyStrategy: MigrationStrategy = {
  name: 'copy',
  description: 'Create shared list while keeping local copy',
  preserveLocal: true,
  createShared: true,
  pros: [
    'No data loss risk',
    'Can revert easily',
    'Try shared features while keeping local backup'
  ],
  cons: [
    'Data duplication',
    'Need to manage both versions'
  ]
};
```

### Strategy 2: Move Migration

```typescript
const moveStrategy: MigrationStrategy = {
  name: 'move',
  description: 'Move todos to shared list, remove from localStorage',
  preserveLocal: false,
  createShared: true,
  pros: [
    'Clean transition',
    'Single source of truth',
    'No duplication'
  ],
  cons: [
    'Cannot easily revert',
    'Requires backup for safety'
  ]
};
```

### Strategy 3: Hybrid Migration

```typescript
const hybridStrategy: MigrationStrategy = {
  name: 'hybrid',
  description: 'Create shared list, mark local as archived',
  preserveLocal: true,
  createShared: true,
  archiveLocal: true,
  pros: [
    'Best of both approaches',
    'Local backup preserved',
    'Clear primary/secondary designation'
  ],
  cons: [
    'More complex state management'
  ]
};
```

## User Experience Flow

### Migration Discovery

```typescript
// Component: MigrationPrompt
export function MigrationPrompt() {
  const { hasLocalData, isEligible } = useMigrationDetector();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (isEligible && !hasUserDismissedMigration()) {
      // Show prompt after user has added a few todos
      const timer = setTimeout(() => setShowPrompt(true), 30000);
      return () => clearTimeout(timer);
    }
  }, [isEligible]);

  if (!showPrompt) return null;

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Share2 className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900">
              Share your todos across devices
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Create a shared version of your {localTodoCount} todos to access them from any device.
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button size="sm" onClick={() => setShowMigrationDialog(true)}>
            Get Started
          </Button>
          <Button variant="ghost" size="sm" onClick={dismissMigration}>
            Maybe Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Migration Dialog

```typescript
// Component: MigrationDialog
export function MigrationDialog({ isOpen, onClose }: MigrationDialogProps) {
  const [step, setStep] = useState<MigrationStep>('review');
  const [strategy, setStrategy] = useState<MigrationStrategy>('copy');
  const [options, setOptions] = useState<MigrationOptions>({
    requireToken: false,
    expiresAt: undefined,
    strategy: 'copy'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {step === 'review' && (
          <MigrationReviewStep
            localTodos={localTodos}
            onNext={() => setStep('options')}
            onCancel={onClose}
          />
        )}

        {step === 'options' && (
          <MigrationOptionsStep
            options={options}
            onChange={setOptions}
            onNext={() => setStep('confirm')}
            onBack={() => setStep('review')}
          />
        )}

        {step === 'confirm' && (
          <MigrationConfirmStep
            options={options}
            onExecute={handleMigration}
            onBack={() => setStep('options')}
          />
        )}

        {step === 'result' && (
          <MigrationResultStep
            result={migrationResult}
            onComplete={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
```

## Rollback and Recovery

### Backup Management

```typescript
interface BackupManager {
  listBackups(): Backup[];
  createBackup(label?: string): Promise<BackupResult>;
  restoreBackup(backupId: string): Promise<RestoreResult>;
  deleteBackup(backupId: string): Promise<void>;
}

// Automatic backup before migration
export function useBackupManager() {
  const createPreMigrationBackup = async () => {
    const backup = {
      id: `pre_migration_${Date.now()}`,
      timestamp: new Date().toISOString(),
      data: localStorage.getItem('todos'),
      label: 'Before migration to shared lists',
      type: 'automatic'
    };

    localStorage.setItem(`backup_${backup.id}`, JSON.stringify(backup));
    return backup;
  };

  const restoreFromBackup = async (backupId: string) => {
    const backupData = localStorage.getItem(`backup_${backupId}`);
    if (!backupData) throw new Error('Backup not found');

    const backup = JSON.parse(backupData);
    localStorage.setItem('todos', backup.data);

    // Reload the page to refresh state
    window.location.reload();
  };

  return { createPreMigrationBackup, restoreFromBackup };
}
```

### Recovery Procedures

```typescript
// Recovery options for failed migrations
interface RecoveryProcedures {
  // Restore from automatic backup
  restoreFromBackup(backupId: string): Promise<void>;

  // Download local data as JSON
  exportLocalData(): string;

  // Import data from JSON file
  importLocalData(jsonData: string): Promise<void>;

  // Reset to clean state
  resetAllData(): Promise<void>;

  // Validate data integrity
  validateDataIntegrity(): ValidationResult;
}
```

## Testing Strategy

### Migration Testing Scenarios

#### Unit Tests

```typescript
describe('TodoMigrationTransformer', () => {
  it('should preserve all todo data during transformation', () => {
    const localTodos = generateTestTodos(50);
    const transformed = transformer.transformToSharedFormat(localTodos, 'test-list');

    expect(transformed).toHaveLength(50);
    transformed.forEach((todo, index) => {
      expect(todo.text).toBe(localTodos[index].text);
      expect(todo.createdAt).toEqual(localTodos[index].createdAt);
      expect(todo.listId).toBe('test-list');
    });
  });

  it('should handle edge cases in todo data', () => {
    const edgeCases = [
      { id: '', text: '', createdAt: null },
      { id: 'valid', text: 'a'.repeat(1000), createdAt: new Date() },
      { id: 'unicode', text: '🚀 émojis & spëcial chars', createdAt: new Date() }
    ];

    const result = transformer.validateLocalData(edgeCases);
    expect(result.errors).toContain('Todo 0: Missing ID');
    expect(result.warnings).toContain('Text length exceeds recommended limit');
  });
});
```

#### Integration Tests

```typescript
describe('Migration End-to-End', () => {
  it('should successfully migrate real localStorage data', async () => {
    // Setup: Create realistic localStorage data
    const todos = generateRealisticTodos(25);
    localStorage.setItem('todos', JSON.stringify(todos));

    // Execute migration
    const executor = new TodoMigrationExecutor();
    const result = await executor.executeMigration({
      strategy: 'copy',
      requireToken: false
    });

    // Verify results
    expect(result.success).toBe(true);
    expect(result.migratedCount).toBe(25);
    expect(result.shareUrl).toMatch(/^https:\/\/.*\/shared\/.+$/);

    // Verify local data preserved (copy strategy)
    const localData = JSON.parse(localStorage.getItem('todos'));
    expect(localData).toHaveLength(25);
  });
});
```

#### User Journey Tests

```typescript
describe('Migration User Journey', () => {
  it('should handle complete migration workflow', async () => {
    // User has local todos
    await setupLocalTodos(15);

    // Migration prompt appears
    render(<App />);
    await waitFor(() => screen.getByText('Share your todos across devices'));

    // User starts migration
    fireEvent.click(screen.getByText('Get Started'));

    // User selects options
    fireEvent.click(screen.getByLabelText('Copy (recommended)'));
    fireEvent.click(screen.getByText('Continue'));

    // Migration executes
    fireEvent.click(screen.getByText('Create Shared List'));

    // Success state
    await waitFor(() => screen.getByText('Migration completed successfully'));
    expect(screen.getByText(/Share URL:/)).toBeInTheDocument();
  });
});
```

## Performance Considerations

### Migration Performance

- **Batch Processing**: Process todos in batches of 100 for large lists
- **Progress Indicators**: Show progress for migrations > 50 todos
- **Background Processing**: Use Web Workers for large data transformations
- **Timeout Handling**: Set reasonable timeouts for API calls
- **Memory Management**: Clean up temporary objects during migration

### Post-Migration Performance

- **Lazy Loading**: Load shared list data on demand
- **Caching**: Cache frequently accessed shared lists
- **Optimistic Updates**: Immediate UI updates with background sync
- **Connection Management**: Efficient SSE connection handling

## Monitoring and Analytics

### Migration Metrics

```typescript
interface MigrationMetrics {
  migrationAttempts: number;
  migrationSuccesses: number;
  migrationFailures: number;
  averageMigrationTime: number;
  averageTodoCount: number;
  strategyDistribution: Record<MigrationStrategy, number>;
  rollbackRate: number;
}
```

### Error Tracking

```typescript
// Track migration issues for improvement
const migrationErrorTypes = [
  'validation_failed',
  'network_error',
  'quota_exceeded',
  'data_corruption',
  'user_cancelled'
];
```

## Documentation and Support

### User Documentation

- **Migration Guide**: Step-by-step migration instructions
- **FAQ**: Common questions about migration process
- **Troubleshooting**: Common issues and solutions
- **Data Safety**: Information about backups and data protection

### Developer Documentation

- **API Reference**: Migration API endpoints
- **Error Codes**: Complete list of migration error codes
- **Testing Guide**: How to test migration scenarios
- **Rollback Procedures**: Emergency recovery procedures

## Success Metrics

### Quantitative Metrics

- **Migration Success Rate**: > 95% successful migrations
- **Data Integrity**: 100% data preservation
- **Performance**: < 5 seconds for typical migration (< 100 todos)
- **User Satisfaction**: > 80% positive feedback
- **Error Rate**: < 2% critical errors

### Qualitative Metrics

- User reports smooth migration experience
- No data loss incidents reported
- Clear and helpful error messages
- Intuitive migration workflow
- Successful rollback when needed

---

**This migration strategy ensures a safe, user-friendly transition from localStorage to shared lists while maintaining the flexibility to use both storage methods.**
