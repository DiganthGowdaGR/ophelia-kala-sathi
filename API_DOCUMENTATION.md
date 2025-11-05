# API Documentation

This document describes the main APIs and services used in Ophelia AI Marketplace.

## 📚 Table of Contents

1. [Supabase Service](#supabase-service)
2. [Gemini AI Service](#gemini-ai-service)
3. [Authentication](#authentication)
4. [Error Handling](#error-handling)

---

## 🗄️ Supabase Service

Location: `src/services/supabaseService.ts`

### Overview

Centralized service for all database operations with comprehensive error handling, retry logic, and user-friendly error messages.

### Key Features

- ✅ Generic CRUD operations
- ✅ Filtering, pagination, and ordering
- ✅ Retry logic with exponential backoff
- ✅ Custom error types
- ✅ PostgreSQL error code mapping
- ✅ Request timeout (30 seconds)

### Main Functions

#### `fetchData<T>()`
```typescript
const data = await fetchData<Product>(
  'products',
  {
    filters: { price: { gt: 100 } },
    page: 1,
    limit: 20,
    orderBy: { column: 'created_at', ascending: false }
  }
);
```

**Parameters**:
- `table`: Table name
- `options`: Filter, pagination, ordering options

**Returns**: Array of records

#### `insertData<T>()`
```typescript
const result = await insertData<Product>('products', {
  name: 'Handmade Pottery',
  price: 50,
  seller_id: 'user-123'
});
```

**Parameters**:
- `table`: Table name
- `data`: Data to insert

**Returns**: Inserted record

#### `updateData<T>()`
```typescript
await updateData<Product>('products', 'product-id', {
  name: 'Updated Name',
  price: 75
});
```

**Parameters**:
- `table`: Table name
- `id`: Record ID
- `data`: Data to update

**Returns**: Updated record

#### `deleteData()`
```typescript
await deleteData('products', 'product-id');
```

**Parameters**:
- `table`: Table name
- `id`: Record ID

**Returns**: void

### Error Types

```typescript
class NetworkError extends Error {}
class AuthError extends Error {}
class ValidationError extends Error {}
class APIError extends Error {}
```

**Example**:
```typescript
try {
  await fetchData('products');
} catch (error) {
  if (error instanceof NetworkError) {
    console.log('Network issue - will retry');
  } else if (error instanceof AuthError) {
    console.log('Authentication failed');
  } else if (error instanceof ValidationError) {
    console.log('Invalid data');
  }
}
```

### Retry Logic

- Automatic retry on network errors
- Exponential backoff: 1s → 2s → 4s
- Maximum 3 attempts
- 30-second timeout per request

---

## 🤖 Gemini AI Service

Location: `src/services/geminiService.ts`

### Overview

Robust integration with Google's Gemini API for AI-powered features with comprehensive error handling and fallback content.

### Key Features

- ✅ API key validation
- ✅ JSON parsing with markdown fallback
- ✅ Timeout handling (120 seconds)
- ✅ Retry logic
- ✅ Graceful degradation
- ✅ Structured error responses

### Main Functions

#### `generateProductDescription()`
```typescript
const description = await generateProductDescription('Handmade ceramic vase');
// Returns: "Beautiful handcrafted ceramic vase..."
```

#### `predictInventory()`
```typescript
const prediction = await predictInventory('product-id', {
  current_stock: 50,
  monthly_sales: 25,
  seasonal_trend: 1.2
});
// Returns: { recommended_stock: 75, low_stock_threshold: 10 }
```

#### `analyzeTrends()`
```typescript
const trends = await analyzeTrends({
  category: 'ceramics',
  region: 'India',
  timeframe: 'last_30_days'
});
// Returns: { trending_items: [...], price_range: {...} }
```

#### `getBusinessRecommendations()`
```typescript
const recommendations = await getBusinessRecommendations('artisan-id');
// Returns: { pricing_strategy: '...', marketing_tips: [...] }
```

#### `optimizeProfile()`
```typescript
const optimized = await optimizeProfile({
  name: 'My Shop',
  description: 'I make ceramics'
});
// Returns: { improved_description: '...', suggested_tags: [...] }
```

### Response Format

All functions return structured responses:

```typescript
interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  fallback?: boolean; // true if using fallback content
}
```

### Error Handling

Errors are caught and returned in response:

```typescript
const response = await generateProductDescription('test');

if (!response.success) {
  console.log(response.error?.message);
  // Handle error - fallback content may be available
}

if (response.fallback) {
  console.log('Using fallback content');
}
```

### API Key Validation

The service validates API key format:
```typescript
// Valid: AIzaSy...
// Invalid: Missing or wrong format throws error
```

---

## 🔐 Authentication

Location: `src/contexts/AuthContext.tsx`

### Overview

Authentication context providing user state and auth functions throughout the application.

### useAuth Hook

```typescript
const { user, profile, loading, signIn, signUp, signOut, updateProfile } = useAuth();
```

**Properties**:
- `user`: Current user object (Supabase User)
- `profile`: User profile with role and metadata
- `loading`: Boolean indicating if auth state is being loaded
- `signIn`: Function to sign in user
- `signUp`: Function to create new account
- `signOut`: Function to sign out user
- `updateProfile`: Function to update profile data

### Sign In

```typescript
try {
  await signIn('user@example.com', 'password');
  // User is now logged in
} catch (error) {
  console.log(error.message);
}
```

### Sign Up

```typescript
try {
  await signUp('user@example.com', 'password', 'artisan');
  // User account created, profile automatically created
} catch (error) {
  console.log(error.message);
}
```

**Supported roles**: `'artisan'`, `'customer'`

### Update Profile

```typescript
try {
  await updateProfile({
    display_name: 'My Name',
    bio: 'I am a potter'
  });
} catch (error) {
  console.log(error.message);
}
```

### Protected Routes

```typescript
// Require authentication
<ProtectedRoute>
  <CartPage />
</ProtectedRoute>

// Require specific role
<ProtectedRoute requiredRole="artisan">
  <ArtisanDashboard />
</ProtectedRoute>
```

---

## ❌ Error Handling

### Global Error Boundary

```typescript
// Catches unexpected React errors
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Component-Level Error Handling

```typescript
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  setError(null);
  try {
    await performAction();
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  }
};

// Display error
{error && (
  <div className="error-alert">
    <p>{error}</p>
    <button onClick={() => handleAction()}>Retry</button>
  </div>
)}
```

### Error Messages

**Supabase Errors**:
```
"PostgreSQL error: duplicate key value violates unique constraint"
→ User-friendly: "This email is already registered"
```

**Network Errors**:
```
"Failed to fetch"
→ User-friendly: "Network connection failed. Please check your internet."
```

**Authentication Errors**:
```
"Invalid login credentials"
→ User-friendly: "Email or password is incorrect"
```

### Best Practices

1. ✅ Always wrap async operations in try-catch
2. ✅ Set error state before attempting operations
3. ✅ Clear error state on successful operations
4. ✅ Provide user-friendly error messages
5. ✅ Include retry buttons when appropriate
6. ✅ Log errors for debugging

---

## 🔄 Data Flow Example

### Fetching Products

```typescript
// 1. Component calls service
const products = await fetchData('products', {
  filters: { category: 'ceramics' },
  limit: 20
});

// 2. Service validates and makes request
// → supabaseService.fetchData()
//   → Validation
//   → Supabase API call
//   → Retry on failure
//   → Error handling

// 3. Component receives data
setProducts(products);

// 4. If error occurs
catch (err) {
  if (err instanceof ValidationError) {
    setError('Invalid filter parameters');
  } else if (err instanceof NetworkError) {
    setError('Network connection failed');
  } else {
    setError('Failed to fetch products');
  }
}
```

---

## 🚀 Rate Limiting

### Supabase
- Default: Depends on Supabase plan
- Recommended: Implement client-side caching with React Query

### Gemini API
- Varies by plan
- Free tier: Limited requests per minute
- Check quota in Google Cloud Console

---

## 📊 Monitoring & Debugging

### Development Mode

Set breakpoints in DevTools:
```typescript
const data = await fetchData('products');
debugger; // Pauses here
console.log(data);
```

### Production Logging

Services include logging:
```typescript
console.log('Fetching products...', { table, options });
console.error('API Error:', error);
```

---

## 🔧 Configuration

### Query Client Settings (React Query)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

### Timeout Settings
- Supabase requests: 30 seconds
- Gemini API: 120 seconds

---

**Last Updated**: 2024
**Status**: Ready for Integration ✅