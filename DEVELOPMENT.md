# Development Guide - Ophelia AI Marketplace

Welcome to the Ophelia AI Marketplace development guide. This document covers setup, development workflow, and best practices.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Development Commands](#development-commands)
5. [Environment Configuration](#environment-configuration)
6. [Architecture Guide](#architecture-guide)
7. [Code Standards](#code-standards)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Ophelia AI Marketplace** is an AI-powered artisan marketplace platform built with:

- **Frontend**: React 18.3.1 + TypeScript 5.6.2
- **Build Tool**: Vite 6.0.1
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI Integration**: Google Gemini API
- **Payment**: Stripe (configured)
- **Maps**: Google Maps API
- **UI Framework**: Radix UI + Tailwind CSS

### Key Features

- 🤖 AI-powered business intelligence via Gemini API
- 🌍 Multi-language support (11 languages)
- 🎤 Voice commerce capabilities
- 🏪 Global marketplace functionality
- 👥 Role-based access (Artisans vs Customers)
- 🛒 Shopping cart and checkout systems
- 📊 Social distribution and market simulation
- 💼 Business analytics and optimization

### User Roles

- **Artisan**: Creates and sells products, access to AI tools for business intelligence
- **Customer**: Browses marketplace, purchases products
- **Admin**: System administration (future implementation)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- pnpm (recommended) or npm
- Git

### Initial Setup

1. **Clone the repository**:
```bash
git clone <repository-url>
cd ophelia-ai-marketplace
```

2. **Install dependencies**:
```bash
pnpm install
# or: npm install
```

3. **Set up environment variables**:
```bash
# Copy the template
cp .env.example .env

# Edit .env with your actual values
# IMPORTANT: Never commit .env to version control!
nano .env
```

4. **Verify setup**:
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Run linter
pnpm run lint

# Start dev server
pnpm run dev
```

5. **Access the application**:
- Open http://localhost:5173 in your browser
- Login or sign up with test credentials

---

## 📁 Project Structure

```
src/
├── components/           # Reusable React components
│   ├── ai/              # AI-related components (FloatingAIWidget, etc.)
│   ├── shared/          # Shared components (Navigation, Footer, etc.)
│   └── ErrorBoundary.tsx # Global error handling
├── pages/               # Page components (lazy loaded)
│   ├── artisan/         # Artisan-specific pages
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── CartPage.tsx
│   └── ...
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   └── AuthContextDefinition.tsx
├── hooks/               # Custom React hooks
│   └── use-auth.tsx
├── services/            # API and business logic
│   ├── supabaseService.ts # Database operations
│   ├── geminiService.ts   # AI integration
│   └── ...
├── lib/                 # Utilities and helpers
│   ├── supabase.ts      # Supabase client
│   └── ...
├── config/              # Configuration files
│   └── validateEnv.ts   # Environment validation
├── types/               # TypeScript type definitions
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Global styles

test/                    # Test files (mirrors src structure)
├── setup.ts             # Test configuration
├── contexts/
├── pages/
├── services/
└── README.md            # Testing guide

vite.config.ts           # Vite configuration
vitest.config.ts         # Vitest configuration
tsconfig.json            # TypeScript configuration
tailwind.config.js       # Tailwind CSS configuration
eslint.config.js         # ESLint configuration
package.json             # Project dependencies
```

---

## 🔧 Development Commands

### Core Commands

```bash
# Development server (hot reload)
pnpm run dev

# Build for production
pnpm run build

# Build for production (optimized)
pnpm run build:prod

# Preview production build locally
pnpm run preview

# Code linting
pnpm run lint

# Install dependencies
pnpm run install-deps

# Clean all build artifacts
pnpm run clean
```

### Testing Commands

```bash
# Run tests in watch mode
pnpm run test

# Run tests with interactive UI
pnpm run test:ui

# Generate coverage report
pnpm run test:coverage
```

---

## ⚙️ Environment Configuration

### Required Environment Variables

All environment variables must be set in `.env` file (see `.env.example`).

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Gemini AI
VITE_GEMINI_API_KEY=your-gemini-key

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_your-key

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your-maps-key
```

### Getting API Keys

**Supabase**:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to Settings > API
4. Copy `URL` and `anon key`

**Gemini API**:
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API key"
3. Enable "Generative Language API" in Google Cloud Console

**Stripe**:
1. Go to https://dashboard.stripe.com/apikeys
2. Copy your Test Publishable Key (starts with `pk_test_`)

**Google Maps**:
1. Go to https://console.cloud.google.com/
2. Enable "Maps JavaScript API"
3. Create API key from Credentials

### Security Notes

⚠️ **CRITICAL**: 
- Never commit `.env` file to version control
- Never share API keys or credentials
- Rotate keys if they're accidentally exposed
- Use different keys for development, staging, and production

---

## 🏗️ Architecture Guide

### Authentication Flow

```
1. User opens app
   ↓
2. AuthProvider initializes (src/contexts/AuthContext.tsx)
   - Check if user is logged in (Supabase session)
   - Load user profile from database
   - Set loading state to false
   ↓
3. Routes check authentication
   - Public routes: accessible to all
   - Protected routes: require login
   - Role-based routes: require specific role (artisan/customer)
   ↓
4. useAuth() hook provides user data to components
```

### Data Flow

```
Component
  ↓
Service Layer (supabaseService.ts, geminiService.ts)
  ↓
API / External Service (Supabase, Gemini, Stripe)
  ↓
Error Handling & Retry Logic
  ↓
Component State Update
```

### Error Handling

Errors are handled at multiple levels:

1. **Service Level**: `supabaseService.ts`, `geminiService.ts`
   - Custom error types (NetworkError, AuthError, ValidationError)
   - Retry logic with exponential backoff
   - User-friendly error messages

2. **Component Level**: Individual page components
   - Local error state
   - Error UI display with retry button
   - Toast notifications (using Sonner)

3. **Global Level**: `ErrorBoundary.tsx`
   - Catches unexpected React errors
   - Development: Shows detailed error info
   - Production: Shows user-friendly error page

### Performance Optimizations

1. **Code Splitting**:
   - Critical pages: `HomePage`, `LoginPage`, `SignUpPage` (eager loaded)
   - Other pages: lazy loaded via React.lazy()

2. **Caching**:
   - React Query: 5-minute stale time by default
   - No refetch on window focus (configurable)

3. **Lazy Loading**:
   - Route-based code splitting
   - Component-based lazy loading where needed
   - Separate Suspense boundary for FloatingAIWidget

---

## 📐 Code Standards

### TypeScript

- ✅ **Strict mode**: Enabled
- ✅ **No `any`**: Minimize use of `any` types
- ✅ **Type safety**: Use interfaces/types for all data structures

**Good**:
```typescript
interface User {
  id: string;
  email: string;
  role: 'artisan' | 'customer';
}

const user: User = { id: '123', email: 'test@example.com', role: 'artisan' };
```

**Avoid**:
```typescript
const user: any = { /* ... */ }; // ❌ Defeats type safety
```

### Component Naming

- Page components: `PascalCase` + `Page` suffix (e.g., `CartPage.tsx`)
- Feature components: `PascalCase` (e.g., `ProductCard.tsx`)
- Utility components: `camelCase` or `PascalCase` (e.g., `useAuth.ts`, `ErrorBoundary.tsx`)

### File Organization

- One component per file (except very small utility components)
- Export default: for page components
- Named exports: for hooks, utilities, types

**Good**:
```typescript
// CartPage.tsx
export default function CartPage() { /* ... */ }

// useAuth.ts
export function useAuth() { /* ... */ }
```

### Error Handling

Always include try-catch blocks and provide user feedback:

```typescript
const loadCart = async () => {
  setLoading(true);
  setError(null);
  try {
    const data = await fetchCart();
    setCartData(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load cart';
    setError(message);
    // Optional: show toast notification
  } finally {
    setLoading(false);
  }
};
```

### Naming Conventions

- Boolean variables: `is*`, `has*`, `should*` (e.g., `isLoading`, `hasError`)
- Event handlers: `handle*` (e.g., `handleClick`, `handleSubmit`)
- Async functions: descriptive names (e.g., `fetchCart`, `updateProfile`)

---

## 🛠️ Common Tasks

### Adding a New Page

1. **Create page component**:
```typescript
// src/pages/NewPage.tsx
export default function NewPage() {
  return (
    <div>
      {/* Page content */}
    </div>
  );
}
```

2. **Add route in App.tsx**:
```typescript
const NewPage = lazy(() => import('@/pages/NewPage'));

// In routes:
<Route path="/new-page" element={<NewPage />} />

// If protected:
<Route 
  path="/new-page" 
  element={
    <ProtectedRoute requiredRole="artisan">
      <NewPage />
    </ProtectedRoute>
  } 
/>
```

### Adding a New API Service

1. **Create service file**:
```typescript
// src/services/newService.ts
import { supabase } from '@/lib/supabase';

export async function fetchData() {
  try {
    const { data, error } = await supabase
      .from('table')
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (err) {
    // Handle error with custom error types
    throw new NetworkError('Failed to fetch data');
  }
}
```

2. **Use in component**:
```typescript
const [data, setData] = useState(null);
const [error, setError] = useState(null);

useEffect(() => {
  fetchData()
    .then(setData)
    .catch(setError);
}, []);
```

### Adding a New Component

1. **Create component file**:
```typescript
// src/components/NewComponent.tsx
interface Props {
  title: string;
  onAction: () => void;
}

export default function NewComponent({ title, onAction }: Props) {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
}
```

2. **Use in page/component**:
```typescript
import NewComponent from '@/components/NewComponent';

export default function SomePage() {
  return <NewComponent title="Test" onAction={() => {}} />;
}
```

### Writing Tests

See `test/README.md` for comprehensive testing guide.

Quick example:
```typescript
// test/pages/NewPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NewPage from '@/pages/NewPage';

describe('NewPage', () => {
  it('should render page title', () => {
    render(<NewPage />);
    expect(screen.getByText('Page Title')).toBeInTheDocument();
  });
});
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue: TypeScript compilation errors**
```bash
# Solution: Clear build cache and rebuild
rm -rf dist
npx tsc --noEmit
pnpm run build
```

**Issue: Module not found errors**
```bash
# Solution: Check path aliases in tsconfig.json and vite.config.ts
# @ should map to src/
```

**Issue: Supabase connection errors**
```bash
# Solution: Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Make sure .env is in the root directory
```

**Issue: Tests not running**
```bash
# Solution: Install testing dependencies
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Issue: Hot reload not working**
```bash
# Solution: Restart dev server
pnpm run dev
```

### Performance Issues

1. **Slow build times**:
   - Clear cache: `pnpm run clean`
   - Check node version: `node --version` (should be 18+)

2. **Slow component load**:
   - Check bundle size: `vite build --report` (if available)
   - Verify lazy loading is working correctly
   - Use React DevTools Profiler

3. **API slow responses**:
   - Check network in DevTools
   - Verify database indexes in Supabase
   - Check Gemini API rate limits

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vite Guide](https://vitejs.dev/guide)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs/primitives/overview/introduction)

---

## 📞 Support

For questions or issues:
1. Check existing issues in the repository
2. Review the troubleshooting section above
3. Contact the development team

---

**Last Updated**: 2024
**Status**: Active Development ✅