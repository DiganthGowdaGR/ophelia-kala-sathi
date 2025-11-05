# Testing Guide for Ophelia AI Marketplace

This directory contains test files and setup for the project using **Vitest** and **React Testing Library**.

## Setup

### Installation

First, install the required testing dependencies:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @vitest/ui
```

Or with pnpm:

```bash
pnpm add -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @vitest/ui
```

### Update package.json

Add these test scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

## Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm run test -- CartPage.test.tsx

# Run tests matching pattern
npm run test -- --grep "Cart Operations"
```

## Test Structure

### Directories

- `test/services/` - Tests for API and business logic services
- `test/pages/` - Tests for page components
- `test/contexts/` - Tests for React contexts and hooks
- `test/setup.ts` - Global test setup and mocks

### Files Included

1. **setup.ts**
   - Environment variable mocks
   - Global mock configuration
   - Window object mocks

2. **services/supabaseService.test.ts**
   - CRUD operations tests
   - Error handling tests
   - Database interaction tests

3. **services/geminiService.test.ts**
   - API validation tests
   - Error handling tests
   - JSON parsing tests

4. **pages/CartPage.test.tsx**
   - Component rendering tests
   - User interaction tests
   - Error state tests
   - Navigation tests

5. **contexts/AuthContext.test.tsx**
   - Authentication flow tests
   - State management tests
   - Profile management tests

## Writing Tests

### Example: Testing a Service Function

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchData } from '@/services/supabaseService';

describe('supabaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data successfully', async () => {
    // Arrange
    const mockData = [{ id: 1, name: 'Test' }];
    vi.mock('@/lib/supabase', () => ({
      supabase: {
        from: () => ({
          select: () => ({ data: mockData, error: null })
        })
      }
    }));

    // Act
    const result = await fetchData('table');

    // Assert
    expect(result).toEqual(mockData);
  });
});
```

### Example: Testing a React Component

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartPage from '@/pages/CartPage';

describe('CartPage', () => {
  it('should display cart items', () => {
    // Arrange
    render(<CartPage />);

    // Act & Assert
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
  });

  it('should remove item on delete click', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CartPage />);
    
    // Act
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteBtn);

    // Assert
    expect(screen.queryByText('Item Name')).not.toBeInTheDocument();
  });
});
```

## Best Practices

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Use Descriptive Names**: Test names should clearly describe what is being tested
3. **Test Behavior, Not Implementation**: Focus on what the code does, not how
4. **Mock External Dependencies**: Always mock API calls, Supabase, etc.
5. **Keep Tests Isolated**: Each test should be independent
6. **Use beforeEach**: Clear mocks and reset state before each test
7. **Test Error Cases**: Always test both success and failure scenarios

## Coverage Goals

Aim for:
- **Services**: 80%+ coverage
- **Components**: 70%+ coverage
- **Critical Paths**: 90%+ coverage

Generate coverage report:

```bash
npm run test:coverage
```

## Debugging Tests

### Using Debugger

```typescript
it('should work correctly', async () => {
  debugger; // Breakpoint
  const result = await someFunction();
  expect(result).toBe(expected);
});

// Run with: npm run test -- --inspect-brk
```

### Using Console

```typescript
it('should work correctly', () => {
  const result = someFunction();
  console.log('Result:', result); // Will appear in test output
  expect(result).toBe(expected);
});
```

### Using Vitest UI

```bash
npm run test:ui
```

This opens a browser interface for debugging and monitoring tests.

## Common Issues

### Issue: Tests fail with import errors

**Solution**: Check that the `vitest.config.ts` has correct path aliases:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Issue: Supabase mocks not working

**Solution**: Ensure `test/setup.ts` is included in `vitest.config.ts`:

```typescript
setupFiles: ['./test/setup.ts'],
```

### Issue: React components not rendering

**Solution**: Make sure test dependencies are installed:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jsdom
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Next Steps

1. Implement the placeholder tests with actual test logic
2. Add tests for other critical components
3. Set up CI/CD to run tests on every commit
4. Aim for 70%+ code coverage
5. Make test writing part of your development workflow