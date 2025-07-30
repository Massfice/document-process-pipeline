# di

Dependency injection system designed for simplifying testing with factory-based dependency creation and seamless mocking.

## Features

-   Factory-based dependency creation
-   Automatic dependency resolution
-   Singleton support with explicit `singleton()` wrapper
-   Seamless mocking integration
-   Type-safe dependency injection
-   Cross-mocking support between different provide instances

## Usage

### Basic Setup

```typescript
import { provide, singleton } from 'fairy-io';

// Define your services with factory functions
const inject = provide({
    TestService: () => new TestService(),
    ProjectService: () =>
        new TestProjectService(inject('TestService')),
    Config: () => ({ apiUrl: 'https://api.example.com' }),
    DatabaseService: singleton(() => new DatabaseService()),
});
```

### Injecting Dependencies

```typescript
// Get service instances
const testService = inject('TestService');
const projectService = inject('ProjectService');
const config = inject('Config');

// Use the services
console.log(testService.testMethod()); // 'test'
console.log(projectService.anotherMethod()); // 'TEST'
console.log(config.apiUrl); // 'https://api.example.com'
```

### Mocking in Tests

```typescript
import { vi } from 'vitest';

// Mock a service
inject('TestService', vi.fn).testMethod.mockReturnValue(
    'mocked',
);

// All future injections of TestService will have mocked methods
const testService = inject('TestService');
console.log(testService.testMethod()); // 'mocked'

// Dependencies are also mocked
const projectService = inject('ProjectService');
console.log(projectService.anotherMethod()); // 'MOCKED'
```

## API Reference

### `provide(services)`

Creates an inject function for the provided services.

```typescript
function provide<T extends Record<string, () => any>>(
    services: T,
): {
    <K extends keyof T>(key: K): ReturnType<T[K]>;
    <K extends keyof T>(key: K, mockFn: () => Mock): Mocked<
        ReturnType<T[K]>
    >;
};
```

### `singleton(factory)`

Wraps a factory function to ensure the service is instantiated only once.

```typescript
function singleton<T extends () => any>(
    factory: T,
): () => ReturnType<T>;
```

### `inject(key, mockFn?)`

Retrieves a dependency instance, optionally with mocked methods.

```typescript
function inject<K extends keyof T>(
    key: K,
): ReturnType<T[K]>;
function inject<K extends keyof T>(
    key: K,
    mockFn: () => Mock,
): Mocked<ReturnType<T[K]>>;
```

## Standalone Mocking Utilities

For frameworks with their own DI systems (like NestJS), you can use the standalone mocking utilities:

### `mockObject(obj, mockFactory)`

Mocks all functions on an object using the provided mock factory.

```typescript
import { mockObject, createMockFactory } from 'fairy-io';

const service = new SomeService();
const mock = mockObject(service, createMockFactory(vi.fn));

mock.someMethod.mockReturnValue('mocked');
console.log(service.someMethod()); // 'mocked'
```

### `createMockFactory(mockFn)`

Creates a mock factory that caches mocks by function name.

```typescript
import { createMockFactory } from 'fairy-io';

const mockFactory = createMockFactory(vi.fn);
const mock1 = mockFactory('method1'); // Creates new mock
const mock2 = mockFactory('method1'); // Returns cached mock
console.log(mock1 === mock2); // true
```

## Best Practices

1. **Use factory functions**: Always use `() => new Service()` instead of direct instances
2. **Be explicit about singletons**: Use `singleton()` wrapper for services that should be shared
3. **Mock early in tests**: Call `inject('Service', vi.fn)` before using the service
4. **Leverage cross-mocking**: Mock dependencies in one provide instance to affect others
5. **Keep factories simple**: Avoid complex logic in factory functions
