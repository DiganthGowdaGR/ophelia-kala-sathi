# 🎨 Ophelia Kala Sathi

> **An AI-powered artisan marketplace** that connects skilled artisans with customers worldwide, powered by Google Gemini AI, Supabase, and modern web technologies.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [How It Works — Architecture](#-how-it-works--architecture)
5. [Project Lifecycle](#-project-lifecycle)
6. [Prerequisites](#-prerequisites)
7. [Quick Start](#-quick-start)
8. [Environment Variables](#-environment-variables)
9. [Project Structure](#-project-structure)
10. [Available Scripts](#-available-scripts)
11. [Testing](#-testing)
12. [Deployment](#-deployment)
13. [Contributing](#-contributing)

---

## 🎯 Project Overview

**Ophelia Kala Sathi** is a full-stack web application that provides:

- A **marketplace** where artisans can list and sell their handcrafted products.
- A suite of **AI-powered tools** (via Google Gemini) to help artisans grow their business — from creative assistance to market simulation.
- A seamless **customer experience** with product discovery, shopping cart, and checkout.
- **Multi-language support** (11 languages) and **voice commerce** capabilities.

---

## ✨ Features

### For Customers
- 🏪 Browse the global artisan marketplace
- 🔍 Find artisans by location using Google Maps
- 🛒 Add products to cart and checkout
- 👤 Manage profile and order history

### For Artisans
- 📊 Artisan dashboard with analytics
- 🤖 **AI Creative Studio** – AI-assisted product design and content creation
- 🧠 **AI Business Intelligence** – Market insights and pricing recommendations
- 🎤 **Voice Mentor** – Voice-driven guidance for business growth
- 📈 **Market Simulation** – Simulate how products perform in different markets
- 🌐 **Social Distribution** – Plan and automate social commerce campaigns
- ♻️ **Sustainability Tracker** – Monitor and improve sustainability practices
- 🌍 **Cross-Border Commerce** – Tools for selling internationally
- 🤝 Find customers and expand reach

### Platform-wide
- 🔐 Secure authentication and role-based access control
- 🌏 11-language localization
- 🤖 Floating AI assistant widget
- 📱 Responsive design
- ⚡ Performance-optimized with lazy loading and code splitting

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18.3 + TypeScript 5.6 |
| **Build Tool** | Vite 6.0 |
| **Styling** | Tailwind CSS v3 + Radix UI |
| **State / Data Fetching** | TanStack React Query |
| **Routing** | React Router DOM v6 |
| **Backend / Database** | Supabase (PostgreSQL + Auth) |
| **AI** | Google Gemini API |
| **Payments** | Stripe |
| **Maps** | Google Maps API |
| **Form Handling** | React Hook Form + Zod |
| **Testing** | Vitest + Testing Library |
| **Linting** | ESLint + TypeScript-ESLint |

---

## 🏗 How It Works — Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │   React UI   │  │  Auth Layer  │  │   AI Widget (Gemini)  │ │
│  │  (Pages +    │  │  (Supabase   │  │   Floating assistant  │ │
│  │  Components) │  │   Auth)      │  │   always available    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬────────────┘ │
│         │                 │                      │              │
│  ┌──────▼─────────────────▼──────────────────────▼───────────┐ │
│  │                    Service Layer                           │ │
│  │   supabaseService.ts        geminiService.ts              │ │
│  │   (DB + Auth operations)    (AI API calls)                │ │
│  └────────────┬───────────────────────────┬───────────────────┘ │
└───────────────│───────────────────────────│─────────────────────┘
                │                           │
       ┌────────▼────────┐        ┌─────────▼──────────┐
       │    Supabase      │        │   Google Gemini AI  │
       │  (PostgreSQL DB  │        │   (Generative AI    │
       │   + Auth + RLS)  │        │    API)             │
       └──────────────────┘        └────────────────────┘
                │
       ┌────────▼────────┐
       │  Stripe Payments │
       │  Google Maps API │
       └──────────────────┘
```

### Authentication Flow

```
User Opens App
      │
      ▼
AuthProvider initializes
(src/contexts/AuthContext.tsx)
      │
      ├─── Supabase checks existing session
      │
      ▼
Session Found?
  │         │
 YES        NO
  │         │
  ▼         ▼
Load user  Show public
profile    pages only
from DB    (/, /login, /signup,
  │         /marketplace)
  ▼
Set auth state
(user + profile)
      │
      ▼
ProtectedRoute evaluates role
  ├── No user → redirect /login
  ├── Role = "customer" → customer pages
  └── Role = "artisan" → artisan dashboard + AI tools
```

### Data Flow

```
User Interaction (Component)
          │
          ▼
    Service Layer
  ┌─────────────────────────────────────────┐
  │  supabaseService.ts  /  geminiService.ts │
  │  • Validation & error typing             │
  │  • Retry with exponential backoff        │
  │  • Custom error types (NetworkError,     │
  │    AuthError, ValidationError)           │
  └──────────────┬──────────────────────────┘
                 │
         ┌───────▼───────┐
         │  External API  │
         │  (Supabase /   │
         │   Gemini /     │
         │   Stripe /     │
         │   Maps)        │
         └───────┬───────┘
                 │
         ┌───────▼───────────────────┐
         │  Response / Error         │
         │  → Component state update │
         │  → Toast notification     │
         │  → UI re-render           │
         └───────────────────────────┘
```

### Frontend Component Architecture

```
src/
├── App.tsx                    ← Root: QueryClient + AuthProvider + Router
│   ├── ErrorBoundary          ← Global error catch
│   ├── LanguageProvider       ← i18n context
│   ├── AuthProvider           ← Auth state context
│   ├── FloatingAIWidget       ← Always-on Gemini assistant (lazy)
│   └── Routes
│       ├── Public Routes      ← HomePage, LoginPage, SignUpPage (eager)
│       ├── Customer Routes    ← Marketplace, ProductDetails, Cart, Checkout (lazy)
│       └── Artisan Routes     ← Dashboard, AI tools, Social, Analytics (lazy + role-guarded)
│
├── contexts/
│   └── AuthContext.tsx        ← useAuth() hook, session management
│
├── services/
│   ├── supabaseService.ts     ← All database operations
│   └── geminiService.ts       ← All AI operations
│
└── components/
    ├── shared/                ← Navigation, Footer, reusable UI
    └── ai/                    ← FloatingAIWidget, AI-specific components
```

### AI Features Architecture

```
Artisan
   │
   ├── Creative Studio ──────► Gemini: generate product descriptions,
   │                                   design ideas, marketing copy
   │
   ├── Business Intelligence ► Gemini: pricing, market analysis,
   │                                   competitor insights
   │
   ├── Voice Mentor ──────────► Gemini: voice-driven Q&A, business
   │                                    coaching, step-by-step guidance
   │
   ├── Market Simulation ─────► Gemini: simulate product launch outcomes,
   │                                    demand forecasting
   │
   ├── AI Agent Control ──────► Gemini: autonomous multi-step agents for
   │                                    social media, SEO, pricing
   │
   └── Agent Mode ────────────► Gemini: fully autonomous agents for
                                        social commerce, sustainability,
                                        cross-border expansion
```

---

## 🗓 Project Lifecycle

### Phase 1 — Project Start 🚀

**Goal**: Set up the foundation and validate the concept.

```
1. Clone repository
   git clone https://github.com/DiganthGowdaGR/ophelia-kala-sathi.git
   cd ophelia-kala-sathi

2. Install dependencies
   pnpm install

3. Configure environment
   cp .env.example .env
   # Fill in API keys (Supabase, Gemini, Stripe, Google Maps)

4. Verify setup
   npx tsc --noEmit     # TypeScript OK
   pnpm run lint        # Code style OK

5. Start development server
   pnpm run dev
   # → http://localhost:5173
```

### Phase 2 — Development 🛠

**Goal**: Build features iteratively.

```
Development Loop:
┌────────────────────────────────────────────────┐
│ 1. Write code (src/)                            │
│ 2. pnpm run dev     → live preview at :5173     │
│ 3. pnpm run lint    → check code quality        │
│ 4. npx tsc --noEmit → verify TypeScript         │
│ 5. pnpm run test    → run tests                 │
│ 6. Commit & push                                │
└────────────────────────────────────────────────┘

Key development commands:
  pnpm run dev          # Dev server with hot reload
  pnpm run lint         # Lint & type-check
  pnpm run test         # Run tests in watch mode
  pnpm run test:ui      # Visual test dashboard
  pnpm run test:coverage # Coverage report
```

### Phase 3 — Testing & Quality Assurance 🧪

**Goal**: Ensure stability before deployment.

```
1. Unit & Integration Tests
   pnpm run test:coverage
   # Target: 70%+ coverage

2. Build Verification
   pnpm run build
   pnpm run preview    # Test production build locally

3. TypeScript Strict Check
   npx tsc --noEmit    # Must pass with 0 errors

4. Lint Check
   pnpm run lint       # Must pass with 0 errors
```

### Phase 4 — Production Deployment 🌐

**Goal**: Ship to production.

```
1. Set production environment variables on your hosting platform
   (Vercel, Netlify, AWS, etc.)

2. Build for production
   pnpm run build:prod
   # Output: dist/

3. Deploy dist/ to your CDN/hosting

4. Supabase: enable Row Level Security (RLS) policies in production
   project settings

5. Stripe: switch from test keys (pk_test_) to live keys (pk_live_)

6. Verify all environment variables are set on the hosting platform:
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_GEMINI_API_KEY
   VITE_STRIPE_PUBLIC_KEY
   VITE_GOOGLE_MAPS_API_KEY
```

### Phase 5 — Maintenance & End of Life 🔄

**Goal**: Keep the project healthy and plan for sunset.

```
Ongoing:
  - Monitor Supabase usage and database health
  - Rotate API keys periodically
  - Update dependencies: pnpm update
  - Review and address security advisories

End of Project / Shutdown:
  1. Export user data from Supabase (GDPR compliance)
  2. Revoke all API keys (Gemini, Stripe, Google Maps)
  3. Disable Supabase project (Settings → General → Pause or delete)
  4. Remove production deployment
  5. Archive the repository
```

---

## 📦 Prerequisites

- **Node.js** 18+ or 20+
- **pnpm** (recommended) — install with `npm install -g pnpm`
- A **Supabase** account → [supabase.com](https://supabase.com)
- A **Google AI Studio** account for Gemini API → [makersuite.google.com](https://makersuite.google.com)
- A **Stripe** account (optional, for payments) → [stripe.com](https://stripe.com)
- A **Google Cloud** account for Maps API (optional) → [console.cloud.google.com](https://console.cloud.google.com)

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/DiganthGowdaGR/ophelia-kala-sathi.git
cd ophelia-kala-sathi

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Open .env and fill in your API keys

# 4. Start the development server
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚙️ Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
# Supabase — required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini AI — required for AI features
VITE_GEMINI_API_KEY=your-gemini-api-key

# Stripe — required for payments
VITE_STRIPE_PUBLIC_KEY=pk_test_your-stripe-key

# Google Maps — required for map features
VITE_GOOGLE_MAPS_API_KEY=your-maps-api-key
```

> ⚠️ **Never commit `.env` to version control.** It is already in `.gitignore`.

**Getting your keys:**

| Service | Where to get it |
|---------|----------------|
| Supabase URL & Key | Supabase Dashboard → Settings → API |
| Gemini API Key | [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey) |
| Stripe Key | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| Google Maps Key | Google Cloud Console → Credentials |

---

## 📁 Project Structure

```
ophelia-kala-sathi/
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ai/              # FloatingAIWidget and AI components
│   │   ├── shared/          # Navigation, Footer, common UI
│   │   └── ErrorBoundary.tsx
│   ├── pages/               # Route-level page components
│   │   ├── artisan/         # Artisan-only pages (AI tools, dashboard)
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignUpPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── CustomerMarketplace.tsx
│   │   └── ...
│   ├── contexts/            # React context providers
│   │   ├── AuthContext.tsx  # Authentication state
│   │   └── LanguageContext.tsx
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API and business logic
│   │   ├── supabaseService.ts  # All database operations
│   │   └── geminiService.ts    # All AI operations
│   ├── lib/                 # Utilities (Supabase client, helpers)
│   ├── config/              # Environment validation
│   ├── types/               # TypeScript type definitions
│   ├── locales/             # i18n translation files
│   ├── App.tsx              # Root component + routing
│   └── main.tsx             # Application entry point
├── test/                    # Test files (mirrors src/ structure)
│   ├── setup.ts
│   ├── contexts/
│   ├── pages/
│   ├── services/
│   └── README.md
├── docs/                    # Additional documentation
├── supabase/                # Supabase configuration & migrations
├── .env.example             # Environment variable template
├── vite.config.ts           # Vite build configuration
├── vitest.config.ts         # Test configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

---

## 📜 Available Scripts

```bash
# Development
pnpm run dev              # Start dev server (http://localhost:5173)
pnpm run preview          # Preview production build locally

# Building
pnpm run build            # Build for production (outputs to dist/)
pnpm run build:prod       # Optimized production build
pnpm run build-with-check # TypeScript check + build

# Code Quality
pnpm run lint             # Run ESLint

# Testing
pnpm run test             # Run tests in watch mode
pnpm run test:ui          # Interactive test dashboard
pnpm run test:coverage    # Generate coverage report

# Maintenance
pnpm run install-deps     # Install dependencies (offline-first)
pnpm run clean            # Remove node_modules, lockfile, and build cache
```

---

## 🧪 Testing

The project uses **Vitest** and **Testing Library**.

```bash
# Run all tests
pnpm run test

# Watch mode (re-runs on save)
pnpm run test

# Coverage report
pnpm run test:coverage

# Visual test UI
pnpm run test:ui
```

Tests are located in `test/` and mirror the `src/` structure:

```
test/
├── contexts/AuthContext.test.tsx
├── pages/CartPage.test.tsx
├── services/supabaseService.test.ts
├── services/geminiService.test.ts
└── README.md   ← detailed testing guide
```

See [`test/README.md`](./test/README.md) for a full guide on writing tests.

---

## 🌐 Deployment

1. **Build the application:**
   ```bash
   pnpm run build:prod
   ```

2. **Deploy the `dist/` directory** to your preferred platform:
   - [Vercel](https://vercel.com): connect your GitHub repo, set env vars, deploy.
   - [Netlify](https://netlify.com): drag & drop `dist/` or use Git integration.
   - Any static hosting (AWS S3 + CloudFront, GitHub Pages with a custom domain, etc.)

3. **Configure environment variables** on your hosting platform (same keys as `.env`).

4. **Supabase production checklist:**
   - Enable Row Level Security (RLS) on all tables.
   - Configure allowed redirect URLs in Auth settings.
   - Review and tighten RLS policies.

5. **Stripe:** replace `pk_test_` keys with `pk_live_` keys in production env vars.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following the code standards in [`DEVELOPMENT.md`](./DEVELOPMENT.md).
4. Run checks:
   ```bash
   pnpm run lint
   npx tsc --noEmit
   pnpm run test
   ```
5. Commit: `git commit -m "feat: add your feature"`
6. Push and open a Pull Request.

---

## 📚 Additional Documentation

| Document | Description |
|----------|-------------|
| [`DEVELOPMENT.md`](./DEVELOPMENT.md) | Full development guide, code standards, architecture |
| [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) | Supabase & Gemini API reference |
| [`test/README.md`](./test/README.md) | Testing guide and examples |
| [`QUICK_START.md`](./QUICK_START.md) | 2-minute setup guide |
| [`docs/QUICK_REFERENCE.md`](./docs/QUICK_REFERENCE.md) | Quick reference card |

---

## 🔒 Security

- All secrets are stored in `.env` (never committed to git).
- Supabase Row Level Security (RLS) protects database data.
- Environment variables are validated at startup via `src/config/validateEnv.ts`.
- If any API key is accidentally exposed, **rotate it immediately** in the respective dashboard.

---

*Built with ❤️ for artisans worldwide.*
