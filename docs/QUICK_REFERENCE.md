# Quick Reference: Using Enhanced Services

## Using Gemini Service

### Basic Usage
```typescript
import { generateProductDescription } from '@/services/geminiService';

// Generate product description with automatic error handling
try {
  const description = await generateProductDescription({
    name: 'Handwoven Silk Scarf',
    category: 'Textiles',
    materials: 'Pure silk',
    techniques: 'Traditional handloom weaving'
  });
  console.log(description);
} catch (error) {
  if (error instanceof GeminiConfigError) {
    // API key not configured
    console.error('Please configure Gemini API key');
  } else if (error instanceof GeminiAPIError) {
    // API returned error
    console.error('API Error:', error.message);
  } else if (error instanceof GeminiNetworkError) {
    // Network issue
    console.error('Network Error:', error.message);
  }
}
```

### All Available Functions
```typescript
// 1. Product Description Generator
generateProductDescription(productData): Promise<string>

// 2. Inventory Predictions
predictInventoryNeeds(inventoryData): Promise<InventoryPrediction>

// 3. Market Analysis
analyzeMarketTrends(marketData): Promise<MarketAnalysis>

// 4. Customer Insights
analyzeCustomerBehavior(customerData): Promise<CustomerInsights>

// 5. Business Recommendations
getBusinessRecommendations(businessData): Promise<BusinessRecommendations>

// 6. Profile Optimization
getProfileOptimizationSuggestions(profileData): Promise<ProfileOptimization>

// 7. Bio Generation
generateOptimizedBio(artisanData): Promise<string>

// 8. Pricing Suggestions
getSuggestedPricing(productData): Promise<PricingSuggestion>
```

---

## Using Supabase Service

### Fetch Records
```typescript
import { fetchRecords, fetchRecordById } from '@/services/supabaseService';

// Fetch all products
const products = await fetchRecords('products');

// Fetch with filters
const artisanProducts = await fetchRecords('products', {
  filters: [
    { column: 'artisan_id', operator: 'eq', value: userId },
    { column: 'price', operator: 'lte', value: 100 }
  ]
});

// Fetch with pagination
const page1 = await fetchRecords('products', {
  pagination: { page: 1, pageSize: 20 },
  orderBy: { column: 'created_at', ascending: false }
});

// Fetch single record
const product = await fetchRecordById('products', productId);
```

### Insert Records
```typescript
import { insertRecord, insertRecords } from '@/services/supabaseService';

// Insert single record
const newProduct = await insertRecord('products', {
  name: 'Handmade Pottery',
  price: 45.00,
  artisan_id: userId
});

// Insert multiple records
const newProducts = await insertRecords('products', [
  { name: 'Product 1', price: 20 },
  { name: 'Product 2', price: 30 }
]);
```

### Update Records
```typescript
import { updateRecord, updateRecords } from '@/services/supabaseService';

// Update by ID
const updated = await updateRecord('products', productId, {
  price: 55.00,
  stock: 10
});

// Bulk update
const updatedAll = await updateRecords(
  'products',
  { in_stock: true },
  [{ column: 'stock', operator: 'gt', value: 0 }]
);
```

### Delete Records
```typescript
import { deleteRecord, deleteRecords } from '@/services/supabaseService';

// Delete by ID
await deleteRecord('products', productId);

// Bulk delete
await deleteRecords('products', [
  { column: 'stock', operator: 'eq', value: 0 }
]);
```

### Utility Functions
```typescript
import { countRecords, recordExists } from '@/services/supabaseService';

// Count records
const totalProducts = await countRecords('products');
const artisanCount = await countRecords('products', [
  { column: 'artisan_id', operator: 'eq', value: userId }
]);

// Check existence
const exists = await recordExists('products', [
  { column: 'name', operator: 'eq', value: 'Product Name' }
]);
```

---

## Error Boundary Usage

### Wrap Components
```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

// Wrap any component that might throw errors
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// Custom fallback UI
<ErrorBoundary fallback={<div>Custom error message</div>}>
  <MyComponent />
</ErrorBoundary>
```

### Testing Error Boundaries
```typescript
// Force an error to test
const TestError = () => {
  throw new Error('Test error');
  return null;
};

<ErrorBoundary>
  <TestError />
</ErrorBoundary>
```

---

## Code Splitting with Lazy Loading

### Lazy Load Components
```typescript
import { lazy, Suspense } from 'react';

// Lazy load component
const MyComponent = lazy(() => import('./MyComponent'));

// Use with Suspense
<Suspense fallback={<div>Loading...</div>}>
  <MyComponent />
</Suspense>
```

### Lazy Load Routes
```typescript
import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/about" element={<AboutPage />} />
</Routes>
```

---

## Common Error Patterns

### Handling Gemini API Errors
```typescript
try {
  const result = await generateProductDescription(data);
} catch (error) {
  if (error instanceof GeminiConfigError) {
    // Show API key configuration message
    setError('Please configure your Gemini API key');
  } else if (error instanceof GeminiAPIError && error.statusCode === 404) {
    // API not enabled
    setError('Please enable the Generative Language API');
  } else if (error instanceof GeminiNetworkError) {
    // Network issue
    setError('Connection error. Please check your internet.');
  } else {
    // Generic error
    setError('An error occurred. Please try again.');
  }
}
```

### Handling Supabase Errors
```typescript
try {
  const products = await fetchRecords('products');
} catch (error) {
  if (error instanceof SupabaseValidationError) {
    // Validation error
    setError('Invalid data provided');
  } else if (error instanceof SupabaseAuthError) {
    // Auth error
    setError('Please log in to continue');
  } else if (error instanceof SupabaseNetworkError) {
    // Network error
    setError('Connection error. Please try again.');
  } else if (error instanceof SupabaseError) {
    // Database error
    setError(error.message); // User-friendly message
  }
}
```

---

## Best Practices

### 1. Always Handle Errors
```typescript
// ❌ Bad
const data = await fetchRecords('products');

// ✅ Good
try {
  const data = await fetchRecords('products');
  setProducts(data);
} catch (error) {
  console.error(error);
  setError('Failed to load products');
}
```

### 2. Use Loading States
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

async function loadData() {
  setLoading(true);
  setError(null);
  try {
    const data = await fetchRecords('products');
    setProducts(data);
  } catch (error) {
    setError('Failed to load data');
  } finally {
    setLoading(false);
  }
}
```

### 3. Provide User Feedback
```typescript
// Show loading indicator
{loading && <LoadingSpinner />}

// Show error message
{error && <ErrorMessage message={error} />}

// Show success message
{success && <SuccessMessage />}
```

### 4. Use Suspense for Lazy Components
```typescript
// ✅ Always wrap lazy components with Suspense
<Suspense fallback={<LoadingFallback />}>
  <LazyComponent />
</Suspense>
```

### 5. Retry on Transient Errors
```typescript
// Services automatically retry, but you can also manually retry
const [retryCount, setRetryCount] = useState(0);

async function loadData() {
  try {
    const data = await fetchRecords('products');
    setProducts(data);
  } catch (error) {
    if (retryCount < 3) {
      setRetryCount(retryCount + 1);
      setTimeout(loadData, 1000 * retryCount); // Exponential backoff
    } else {
      setError('Failed after 3 attempts');
    }
  }
}
```

---

## Performance Tips

### 1. Use Pagination for Large Datasets
```typescript
// ✅ Load data in pages
const products = await fetchRecords('products', {
  pagination: { page: 1, pageSize: 20 }
});
```

### 2. Select Only Needed Columns
```typescript
// ❌ Select all columns
const products = await fetchRecords('products');

// ✅ Select specific columns
const products = await fetchRecords('products', {
  select: 'id, name, price'
});
```

### 3. Use Filters to Reduce Data
```typescript
// ✅ Filter on server side
const products = await fetchRecords('products', {
  filters: [
    { column: 'in_stock', operator: 'eq', value: true }
  ]
});
```

### 4. Lazy Load Heavy Components
```typescript
// ✅ Don't load maps until needed
const GoogleMapsPage = lazy(() => import('./pages/GoogleMapsPage'));
```

---

## Debugging

### Check Error Logs
```typescript
// All services log errors to console
// Check browser console for detailed error information
console.error('ErrorBoundary caught an error:', {
  error: error.message,
  timestamp: new Date().toISOString(),
});
```

### Network Tab
- Open browser DevTools → Network tab
- Check for failed requests
- Verify bundle sizes and loading times
- Monitor lazy-loaded chunks

### React DevTools
- Install React DevTools extension
- Check component tree for Suspense boundaries
- Verify ErrorBoundary wrapping

---

## Need Help?

- **Documentation**: See `/docs/ERROR_HANDLING_AND_PERFORMANCE_IMPROVEMENTS.md`
- **Support**: support@ophelia-ai.com
- **Live Site**: https://gwr4n6mmztw2.space.minimax.io
