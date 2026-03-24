# Ceramic Storefront Frontend — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a customer-facing Next.js storefront for the Ceramic e-commerce backend API.

**Architecture:** Next.js App Router with Server Components for SEO-critical product/category pages, Client Components for interactive features (cart, auth, checkout). Plain fetch + React Context for state. API wrapper handles JWT token rotation. Separate repo from backend.

**Tech Stack:** Next.js 15, React 19, JavaScript (no TS), shadcn/ui, Tailwind CSS 4, Stripe Elements, localStorage auth

**Spec:** `docs/superpowers/specs/2026-03-24-ceramic-frontend-design.md`

**Backend runs at:** `http://localhost:4000` (start with `npm run dev` in the Ceramic backend repo)

**Backend prerequisite:** The `GET /api/cart` endpoint must include `basePrice` in its product select. This fix has been applied to `src/services/cartService.js` in the backend repo.

---

## File Map

```
ceramic-frontend/
├── .env.local                    # API_URL, NEXT_PUBLIC_API_URL, NEXT_PUBLIC_STRIPE_KEY
├── jsconfig.json                 # Path alias: @/* → ./*
├── next.config.mjs               # API proxy rewrites (ESM)
├── app/
│   ├── globals.css               # Tailwind imports + custom CSS vars
│   ├── layout.js                 # Root layout: fonts, metadata, Providers
│   ├── not-found.js              # 404 page
│   ├── error.js                  # Global error boundary
│   ├── loading.js                # Global loading skeleton
│   ├── page.js                   # Home: hero, featured products, categories
│   ├── products/
│   │   ├── page.js               # Product listing with filters + pagination
│   │   └── [slug]/
│   │       ├── page.js           # Product detail (Server) with Client islands
│   │       └── ProductDetailClient.js  # Client island for variant selection + add to cart
│   ├── categories/
│   │   └── [slug]/
│   │       └── page.js           # Category product listing
│   ├── cart/
│   │   └── page.js               # Cart page
│   ├── checkout/
│   │   └── page.js               # Checkout: address form + Stripe
│   ├── orders/
│   │   ├── page.js               # Order history
│   │   └── [id]/
│   │       └── page.js           # Order detail / confirmation
│   ├── login/
│   │   └── page.js               # Login form
│   └── register/
│       └── page.js               # Register form
├── components/
│   ├── Providers.js              # "use client" context wrapper
│   ├── ui/                       # shadcn/ui components (Button, Card, Input, Badge, etc.)
│   ├── layout/
│   │   ├── Header.js             # Sticky header with nav, cart badge, auth
│   │   └── Footer.js             # Simple footer
│   ├── products/
│   │   ├── ProductCard.js        # Product card for grids
│   │   ├── ProductGrid.js        # Responsive grid wrapper
│   │   ├── VariantSelector.js    # Client Component: pill toggles
│   │   ├── AddToCartButton.js    # Client Component: add to cart
│   │   └── ProductFilters.js     # Client Component: filter bar
│   ├── cart/
│   │   ├── CartItem.js           # Single cart line item
│   │   └── CartSummary.js        # Subtotal, shipping, total
│   └── checkout/
│       ├── AddressForm.js        # Shipping address fields
│       └── StripePayment.js      # Stripe Elements wrapper
├── context/
│   ├── AuthContext.js            # Auth state, login, register, logout, refresh
│   └── CartContext.js            # Cart state, CRUD, merge on login
└── lib/
    ├── api.js                    # apiFetch() with auth + refresh
    └── utils.js                  # formatPrice(), cn()
```

---

## Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `ceramic-frontend/` (new repo on Desktop)
- Create: `.env.local`, `jsconfig.json`, `next.config.js`, `tailwind.config.js`, `app/globals.css`, `app/layout.js`

- [ ] **Step 1: Create Next.js project with JavaScript**

```bash
cd ~/Desktop
npx create-next-app@latest ceramic-frontend --js --app --tailwind --eslint --no-src-dir --import-alias "@/*"
cd ceramic-frontend
```

Select defaults when prompted. This creates the app with Tailwind v4 and App Router.

- [ ] **Step 2: Install dependencies**

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js class-variance-authority clsx tailwind-merge lucide-react
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

- [ ] **Step 4: Add required shadcn/ui components**

```bash
npx shadcn@latest add button card input label badge separator select skeleton sheet
```

- [ ] **Step 5: Create `.env.local`**

```
API_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

- [ ] **Step 6: Configure API proxy in `next.config.mjs`**

Replace contents of `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://localhost:4000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 7: Set up earthy theme in `app/globals.css`**

Replace `app/globals.css` with:

```css
@import "tailwindcss";

@theme {
  --color-background: #faf8f5;
  --color-surface: #f3efe8;
  --color-terracotta: #c4775a;
  --color-sage: #8a9a7b;
  --color-charcoal: #2c2c2c;
  --color-warm-gray: #7a7268;
  --color-sand: #e5ddd3;
  --color-success: #6b8f5e;
  --color-error: #c45c4d;
}

body {
  background-color: var(--color-background);
  color: var(--color-charcoal);
  font-family: var(--font-body);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}
```

- [ ] **Step 8: Set up root layout with fonts**

Replace `app/layout.js`:

```jsx
import { DM_Sans, Lora } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500'],
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600'],
});

export const metadata = {
  title: 'Ceramic — Handcrafted Pottery',
  description: 'Shop handcrafted ceramic pieces made with care.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${lora.variable}`}>
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 9: Verify it runs**

```bash
npm run dev
```

Open `http://localhost:3000` — should show the default Next.js page with earthy background.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind earthy theme and shadcn/ui"
```

---

## Task 2: Utility Layer (`lib/`)

**Files:**
- Create: `lib/utils.js`
- Create: `lib/api.js`

- [ ] **Step 1: Create `lib/utils.js`**

```js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
}
```

- [ ] **Step 2: Create `lib/api.js`**

```js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

let authContext = null;

export function setAuthContext(ctx) {
  authContext = ctx;
}

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const accessToken = authContext?.accessToken;
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, { ...options, headers });

  // If 401, try token refresh once
  if (res.status === 401 && authContext?.refreshToken) {
    const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: authContext.refreshToken }),
    });

    if (refreshRes.ok) {
      const tokens = await refreshRes.json();
      authContext.onRefresh(tokens.accessToken, tokens.refreshToken);
      headers['Authorization'] = `Bearer ${tokens.accessToken}`;
      res = await fetch(url, { ...options, headers });
    } else {
      authContext.onLogout();
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || body.message || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

// Server-side fetch (no auth, uses internal API_URL)
export async function serverFetch(endpoint) {
  const baseUrl = process.env.API_URL || 'http://localhost:4000';
  const res = await fetch(`${baseUrl}${endpoint}`, { cache: 'no-store' });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.message || `Request failed: ${res.status}`);
  }

  return res.json();
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/
git commit -m "feat: add utility functions and API fetch wrapper with token refresh"
```

---

## Task 3: Auth Context

**Files:**
- Create: `context/AuthContext.js`

- [ ] **Step 1: Create `context/AuthContext.js`**

```jsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch, setAuthContext } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedAccess = localStorage.getItem('accessToken');
    const storedRefresh = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');
    if (storedAccess && storedRefresh && storedUser) {
      setAccessToken(storedAccess);
      setRefreshToken(storedRefresh);
      setUser(JSON.parse(storedUser));
    }
    setIsHydrated(true);
  }, []);

  // Sync auth context with api.js
  useEffect(() => {
    setAuthContext({
      accessToken,
      refreshToken,
      onRefresh: (newAccess, newRefresh) => {
        setAccessToken(newAccess);
        setRefreshToken(newRefresh);
        localStorage.setItem('accessToken', newAccess);
        localStorage.setItem('refreshToken', newRefresh);
      },
      onLogout: () => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      },
    });
  }, [accessToken, refreshToken]);

  const login = useCallback(async (email, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    // Decode JWT payload for user info
    const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
    const userData = { userId: payload.userId, role: payload.role, email };
    setUser(userData);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  }, []);

  const register = useCallback(async (email, password) => {
    await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // Auto-login after registration
    return login(email, password);
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Logout even if request fails
    }
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isHydrated,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add context/
git commit -m "feat: add AuthContext with login, register, logout, and token refresh"
```

---

## Task 4: Cart Context

**Files:**
- Create: `context/CartContext.js`

- [ ] **Step 1: Create `context/CartContext.js`**

```jsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const CartContext = createContext(null);

const LOCAL_CART_KEY = 'ceramic_cart';

function getLocalCart() {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(LOCAL_CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

function setLocalCart(items) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const { isAuthenticated, isHydrated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  // Fetch cart from backend or localStorage
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: getLocalCart() });
      return;
    }
    try {
      setLoading(true);
      const data = await apiFetch('/api/cart');
      setCart(data);
    } catch {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load cart when auth state settles; merge local cart first if needed
  useEffect(() => {
    if (!isHydrated) return;

    (async () => {
      // If authenticated, merge any local cart items first
      if (isAuthenticated) {
        const localItems = getLocalCart();
        if (localItems.length > 0) {
          for (const item of localItems) {
            try {
              await apiFetch('/api/cart/items', {
                method: 'POST',
                body: JSON.stringify({ variantId: item.variantId, quantity: item.quantity }),
              });
            } catch {
              // skip items that fail (e.g. out of stock)
            }
          }
          localStorage.removeItem(LOCAL_CART_KEY);
        }
      }
      // Then fetch the cart (backend or localStorage)
      await fetchCart();
    })();
  }, [isHydrated, isAuthenticated, fetchCart]);

  const addItem = useCallback(async (variant, product, quantity = 1) => {
    if (!isAuthenticated) {
      const localItems = getLocalCart();
      const existing = localItems.find((i) => i.variantId === variant.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        localItems.push({
          id: `local_${Date.now()}`,
          variantId: variant.id,
          quantity,
          variant: { ...variant, product },
        });
      }
      setLocalCart(localItems);
      setCart({ items: localItems });
      return;
    }
    // Optimistic: add to state, then call API
    const prev = cart;
    try {
      await apiFetch('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ variantId: variant.id, quantity }),
      });
      await fetchCart();
    } catch (err) {
      setCart(prev);
      throw err;
    }
  }, [isAuthenticated, cart, fetchCart]);

  const updateItem = useCallback(async (itemId, quantity) => {
    if (!isAuthenticated) {
      const localItems = getLocalCart();
      const item = localItems.find((i) => i.id === itemId);
      if (item) item.quantity = quantity;
      setLocalCart(localItems);
      setCart({ items: localItems });
      return;
    }
    const prev = cart;
    try {
      await apiFetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      await fetchCart();
    } catch (err) {
      setCart(prev);
      throw err;
    }
  }, [isAuthenticated, cart, fetchCart]);

  const removeItem = useCallback(async (itemId) => {
    if (!isAuthenticated) {
      const localItems = getLocalCart().filter((i) => i.id !== itemId);
      setLocalCart(localItems);
      setCart({ items: localItems });
      return;
    }
    const prev = cart;
    try {
      await apiFetch(`/api/cart/items/${itemId}`, { method: 'DELETE' });
      await fetchCart();
    } catch (err) {
      setCart(prev);
      throw err;
    }
  }, [isAuthenticated, cart, fetchCart]);

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal = cart.items.reduce((sum, item) => {
    const base = Number(item.variant?.product?.basePrice || 0);
    const mod = Number(item.variant?.priceModifier || 0);
    return sum + (base + mod) * item.quantity;
  }, 0);

  const shipping = subtotal >= 75 ? 0 : 9.99;
  const total = subtotal + shipping;

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addItem,
      updateItem,
      removeItem,
      itemCount,
      subtotal,
      shipping,
      total,
      refetch: fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add context/CartContext.js
git commit -m "feat: add CartContext with localStorage fallback and backend sync"
```

---

## Task 5: Providers Wrapper & Layout Integration

**Files:**
- Create: `components/Providers.js`
- Modify: `app/layout.js`

- [ ] **Step 1: Create `components/Providers.js`**

```jsx
'use client';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  );
}
```

- [ ] **Step 2: Update `app/layout.js` to use Providers**

Add import at top and wrap `{children}`:

```jsx
import { DM_Sans, Lora } from 'next/font/google';
import Providers from '@/components/Providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500'],
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600'],
});

export const metadata = {
  title: 'Ceramic — Handcrafted Pottery',
  description: 'Shop handcrafted ceramic pieces made with care.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${lora.variable}`}>
      <body className="min-h-screen bg-background antialiased font-body">
        <Providers>
          <Header />
          <main className="max-w-[1200px] mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/Providers.js app/layout.js
git commit -m "feat: add Providers wrapper and integrate into root layout"
```

---

## Task 6: Header & Footer Layout Components

**Files:**
- Create: `components/layout/Header.js`
- Create: `components/layout/Footer.js`

- [ ] **Step 1: Create `components/layout/Header.js`**

```jsx
'use client';

import Link from 'next/link';
import { ShoppingBag, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { isAuthenticated, isHydrated, logout, user } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-sand">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-heading text-xl font-semibold text-charcoal">
          Ceramic
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/products" className="text-warm-gray hover:text-charcoal transition-colors text-sm">
            Shop
          </Link>
          <Link href="/categories" className="text-warm-gray hover:text-charcoal transition-colors text-sm">
            Categories
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative">
            <ShoppingBag className="h-5 w-5 text-warm-gray hover:text-charcoal transition-colors" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-terracotta text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          {isHydrated && (
            <>
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link href="/orders">
                    <Button variant="ghost" size="sm" className="text-warm-gray hover:text-charcoal">
                      Orders
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-warm-gray hover:text-charcoal"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-warm-gray hover:text-charcoal">
                    <User className="h-4 w-4 mr-1" />
                    Sign in
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create `components/layout/Footer.js`**

```jsx
export default function Footer() {
  return (
    <footer className="border-t border-sand mt-16 py-8">
      <div className="max-w-[1200px] mx-auto px-4 text-center text-warm-gray text-sm">
        <p>&copy; {new Date().getFullYear()} Ceramic. Handcrafted with care.</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Verify header and footer render**

```bash
npm run dev
```

Open `http://localhost:3000` — should see header with logo, nav links, cart icon, sign in button, and footer.

- [ ] **Step 4: Commit**

```bash
git add components/layout/
git commit -m "feat: add Header with cart badge and auth, and Footer"
```

---

## Task 7: Error, Not Found, and Loading Pages

**Files:**
- Create: `app/not-found.js`
- Create: `app/error.js`
- Create: `app/loading.js`

- [ ] **Step 1: Create `app/not-found.js`**

```jsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <h1 className="font-heading text-4xl font-semibold text-charcoal mb-4">Page Not Found</h1>
      <p className="text-warm-gray mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/">
        <Button className="bg-terracotta hover:bg-terracotta/90 text-white">
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/error.js`**

```jsx
'use client';

import { Button } from '@/components/ui/button';

export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <h1 className="font-heading text-4xl font-semibold text-charcoal mb-4">Something went wrong</h1>
      <p className="text-warm-gray mb-8">{error?.message || 'An unexpected error occurred.'}</p>
      <Button onClick={reset} className="bg-terracotta hover:bg-terracotta/90 text-white">
        Try again
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Create `app/loading.js`**

```jsx
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-48 bg-sand" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-64 w-full rounded-lg bg-sand" />
            <Skeleton className="h-4 w-3/4 bg-sand" />
            <Skeleton className="h-4 w-1/4 bg-sand" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/not-found.js app/error.js app/loading.js
git commit -m "feat: add 404, error boundary, and loading skeleton pages"
```

---

## Task 8: Product Card & Grid Components

**Files:**
- Create: `components/products/ProductCard.js`
- Create: `components/products/ProductGrid.js`

- [ ] **Step 1: Create `components/products/ProductCard.js`**

```jsx
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

export default function ProductCard({ product }) {
  const image = product.images?.[0] || '/placeholder.jpg';
  const minPrice = Number(product.basePrice);

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group overflow-hidden border-sand hover:shadow-md transition-shadow bg-white">
        <div className="aspect-square overflow-hidden bg-surface">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <p className="text-warm-gray text-xs uppercase tracking-wide mb-1">
            {product.category?.name}
          </p>
          <h3 className="font-heading text-charcoal font-medium">{product.name}</h3>
          <p className="text-terracotta font-medium mt-1">{formatPrice(minPrice)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 2: Create `components/products/ProductGrid.js`**

```jsx
import ProductCard from '@/components/products/ProductCard';

export default function ProductGrid({ products }) {
  if (!products?.length) {
    return (
      <p className="text-warm-gray text-center py-16">No products found.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/products/ProductCard.js components/products/ProductGrid.js
git commit -m "feat: add ProductCard and ProductGrid components"
```

---

## Task 9: Home Page

**Files:**
- Create: `app/page.js`

- [ ] **Step 1: Replace `app/page.js`**

```jsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/products/ProductGrid';
import { serverFetch } from '@/lib/api';

export default async function HomePage() {
  const [productsData, categories] = await Promise.all([
    serverFetch('/api/products?limit=8'),
    serverFetch('/api/categories'),
  ]);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-20">
        <h1 className="font-heading text-5xl md:text-6xl font-semibold text-charcoal mb-4">
          Handcrafted Ceramics
        </h1>
        <p className="text-warm-gray text-lg max-w-xl mx-auto mb-8">
          Unique pottery pieces, thoughtfully made by hand. Each one tells a story.
        </p>
        <Link href="/products">
          <Button className="bg-terracotta hover:bg-terracotta/90 text-white px-8 py-3 text-base">
            Shop Collection
          </Button>
        </Link>
      </section>

      {/* Featured Products */}
      <section>
        <h2 className="font-heading text-2xl font-medium text-charcoal mb-8">Latest Pieces</h2>
        <ProductGrid products={productsData.products} />
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <h2 className="font-heading text-2xl font-medium text-charcoal mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="bg-surface border border-sand rounded-lg p-6 text-center hover:shadow-sm transition-shadow"
              >
                <h3 className="font-heading text-charcoal font-medium">{cat.name}</h3>
                {cat.children?.length > 0 && (
                  <p className="text-warm-gray text-sm mt-1">
                    {cat.children.length} subcategories
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify with backend running**

Start backend (`npm run dev` in Ceramic directory), then open `http://localhost:3000`.
Should display hero, product grid (if seeded), and categories.

- [ ] **Step 3: Commit**

```bash
git add app/page.js
git commit -m "feat: add home page with hero, featured products, and categories"
```

---

## Task 10: Product Listing Page with Filters & Pagination

**Files:**
- Create: `components/products/ProductFilters.js`
- Create: `app/products/page.js`

- [ ] **Step 1: Create `components/products/ProductFilters.js`**

```jsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProductFilters({ categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  function applyFilters() {
    const params = new URLSearchParams();
    if (categoryId) params.set('categoryId', categoryId);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    router.push(`/products?${params.toString()}`);
  }

  function clearFilters() {
    setCategoryId('');
    setMinPrice('');
    setMaxPrice('');
    router.push('/products');
  }

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-surface border border-sand rounded-lg">
      <div>
        <Label className="text-warm-gray text-xs">Category</Label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1 block w-40 rounded-md border border-sand bg-white px-3 py-2 text-sm text-charcoal focus:border-terracotta focus:ring-terracotta"
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div>
        <Label className="text-warm-gray text-xs">Min Price</Label>
        <Input
          type="number"
          placeholder="0"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="mt-1 w-24 border-sand focus-visible:ring-terracotta"
        />
      </div>
      <div>
        <Label className="text-warm-gray text-xs">Max Price</Label>
        <Input
          type="number"
          placeholder="999"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="mt-1 w-24 border-sand focus-visible:ring-terracotta"
        />
      </div>
      <Button onClick={applyFilters} className="bg-terracotta hover:bg-terracotta/90 text-white">
        Filter
      </Button>
      <Button onClick={clearFilters} variant="outline" className="border-sand text-warm-gray">
        Clear
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/products/page.js`**

```jsx
import { Suspense } from 'react';
import Link from 'next/link';
import { serverFetch } from '@/lib/api';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import { Button } from '@/components/ui/button';

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.categoryId) query.set('categoryId', params.categoryId);
  if (params.minPrice) query.set('minPrice', params.minPrice);
  if (params.maxPrice) query.set('maxPrice', params.maxPrice);
  if (params.page) query.set('page', params.page);

  const [productsData, categories] = await Promise.all([
    serverFetch(`/api/products?${query.toString()}`),
    serverFetch('/api/categories'),
  ]);

  const { products, page, pages } = productsData;

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-semibold text-charcoal">Shop</h1>

      <Suspense fallback={null}>
        <ProductFilters categories={categories} />
      </Suspense>

      <ProductGrid products={products} />

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          {page > 1 && (
            <Link href={`/products?${new URLSearchParams({ ...params, page: page - 1 }).toString()}`}>
              <Button variant="outline" size="sm" className="border-sand">Previous</Button>
            </Link>
          )}
          <span className="text-warm-gray text-sm">
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Link href={`/products?${new URLSearchParams({ ...params, page: page + 1 }).toString()}`}>
              <Button variant="outline" size="sm" className="border-sand">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify with backend**

Open `http://localhost:3000/products` — should show filter bar, product grid, and pagination.

- [ ] **Step 4: Commit**

```bash
git add components/products/ProductFilters.js app/products/page.js
git commit -m "feat: add product listing page with filters and pagination"
```

---

## Task 11: Product Detail Page with Client Islands

**Files:**
- Create: `components/products/VariantSelector.js`
- Create: `components/products/AddToCartButton.js`
- Create: `app/products/[slug]/page.js`

- [ ] **Step 1: Create `components/products/VariantSelector.js`**

```jsx
'use client';

import { cn } from '@/lib/utils';

export default function VariantSelector({ variants, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => {
        const isActive = selected?.id === variant.id;
        const inStock = variant.stockQty > 0;

        return (
          <button
            key={variant.id}
            onClick={() => onSelect(variant)}
            disabled={!inStock}
            className={cn(
              'px-4 py-2 rounded-full border text-sm transition-colors',
              isActive
                ? 'bg-terracotta text-white border-terracotta'
                : 'border-sand text-charcoal hover:border-terracotta',
              !inStock && 'opacity-40 cursor-not-allowed line-through'
            )}
          >
            {variant.name}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create `components/products/AddToCartButton.js`**

```jsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Check } from 'lucide-react';

export default function AddToCartButton({ variant, product }) {
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const inStock = variant && variant.stockQty > 0;

  async function handleAdd() {
    if (!variant || !inStock) return;
    setLoading(true);
    try {
      await addItem(variant, product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // error handled by context
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleAdd}
      disabled={!inStock || loading}
      className="bg-terracotta hover:bg-terracotta/90 text-white w-full py-3"
    >
      {added ? (
        <><Check className="h-4 w-4 mr-2" /> Added</>
      ) : (
        <><ShoppingBag className="h-4 w-4 mr-2" /> {inStock ? 'Add to Cart' : 'Out of Stock'}</>
      )}
    </Button>
  );
}
```

- [ ] **Step 3: Create `app/products/[slug]/page.js`**

```jsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { serverFetch } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import VariantSelector from '@/components/products/VariantSelector';
import AddToCartButton from '@/components/products/AddToCartButton';
import ProductDetailClient from './ProductDetailClient';

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  let product;
  try {
    product = await serverFetch(`/api/products/${slug}`);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="text-sm text-warm-gray">
        <Link href="/products" className="hover:text-charcoal">Shop</Link>
        {' / '}
        {product.category && (
          <>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-charcoal">
              {product.category.name}
            </Link>
            {' / '}
          </>
        )}
        <span className="text-charcoal">{product.name}</span>
      </nav>

      {/* Product content — client island handles variant selection */}
      <ProductDetailClient product={product} />
    </div>
  );
}
```

- [ ] **Step 4: Create `app/products/[slug]/ProductDetailClient.js`**

This Client Component handles the interactive variant selection + add to cart:

```jsx
'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import VariantSelector from '@/components/products/VariantSelector';
import AddToCartButton from '@/components/products/AddToCartButton';

export default function ProductDetailClient({ product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);

  const price = Number(product.basePrice) + Number(selectedVariant?.priceModifier || 0);
  const inStock = selectedVariant && selectedVariant.stockQty > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Images */}
      <div className="aspect-square bg-surface rounded-lg overflow-hidden">
        <img
          src={product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-charcoal">{product.name}</h1>
          <p className="text-2xl text-terracotta font-medium mt-2">{formatPrice(price)}</p>
        </div>

        {product.description && (
          <p className="text-warm-gray leading-relaxed">{product.description}</p>
        )}

        {/* Variants */}
        {product.variants?.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-charcoal">Options</p>
            <VariantSelector
              variants={product.variants}
              selected={selectedVariant}
              onSelect={setSelectedVariant}
            />
          </div>
        )}

        {/* Stock */}
        {selectedVariant && (
          <Badge variant="outline" className={inStock ? 'border-success text-success' : 'border-error text-error'}>
            {inStock ? `In stock (${selectedVariant.stockQty})` : 'Out of stock'}
          </Badge>
        )}

        {/* Add to cart */}
        <AddToCartButton variant={selectedVariant} product={product} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify product detail page**

Open `http://localhost:3000/products/<some-slug>` — should display product image, info, variant pills, stock badge, and add to cart button.

- [ ] **Step 6: Commit**

```bash
git add components/products/VariantSelector.js components/products/AddToCartButton.js app/products/
git commit -m "feat: add product detail page with variant selector and add to cart"
```

---

## Task 12: Category Page

**Files:**
- Create: `app/categories/[slug]/page.js`

- [ ] **Step 1: Create `app/categories/[slug]/page.js`**

```jsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { serverFetch } from '@/lib/api';
import ProductGrid from '@/components/products/ProductGrid';
import { Button } from '@/components/ui/button';

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const page = query.page || 1;

  let category;
  try {
    category = await serverFetch(`/api/categories/${slug}`);
  } catch {
    notFound();
  }

  const productsData = await serverFetch(`/api/categories/${slug}/products?page=${page}`);
  const { products, pages } = productsData;

  return (
    <div className="space-y-8">
      <div>
        <nav className="text-sm text-warm-gray mb-2">
          <Link href="/products" className="hover:text-charcoal">Shop</Link>
          {' / '}
          <span className="text-charcoal">{category.name}</span>
        </nav>
        <h1 className="font-heading text-3xl font-semibold text-charcoal">{category.name}</h1>
        {category.description && (
          <p className="text-warm-gray mt-2">{category.description}</p>
        )}
      </div>

      {/* Subcategories */}
      {category.children?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {category.children.map((child) => (
            <Link key={child.id} href={`/categories/${child.slug}`}>
              <Button variant="outline" size="sm" className="border-sand text-warm-gray hover:text-charcoal">
                {child.name}
              </Button>
            </Link>
          ))}
        </div>
      )}

      <ProductGrid products={products} />

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          {Number(page) > 1 && (
            <Link href={`/categories/${slug}?page=${Number(page) - 1}`}>
              <Button variant="outline" size="sm" className="border-sand">Previous</Button>
            </Link>
          )}
          <span className="text-warm-gray text-sm">Page {page} of {pages}</span>
          {Number(page) < pages && (
            <Link href={`/categories/${slug}?page=${Number(page) + 1}`}>
              <Button variant="outline" size="sm" className="border-sand">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/categories/
git commit -m "feat: add category page with subcategories and product listing"
```

---

## Task 13: Cart Page

**Files:**
- Create: `components/cart/CartItem.js`
- Create: `components/cart/CartSummary.js`
- Create: `app/cart/page.js`

- [ ] **Step 1: Create `components/cart/CartItem.js`**

```jsx
'use client';

import { Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export default function CartItem({ item }) {
  const { updateItem, removeItem } = useCart();
  const variant = item.variant;
  const product = variant?.product;
  const price = Number(product?.basePrice || 0) + Number(variant?.priceModifier || 0);

  return (
    <div className="flex items-center gap-4 py-4 border-b border-sand">
      <div className="h-20 w-20 bg-surface rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={product?.images?.[0] || '/placeholder.jpg'}
          alt={product?.name || 'Product'}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-charcoal font-medium truncate">{product?.name}</p>
        <p className="text-warm-gray text-sm">{variant?.name}</p>
        <p className="text-terracotta text-sm font-medium">{formatPrice(price)}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-sand"
          onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center text-sm">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 border-sand"
          onClick={() => updateItem(item.id, item.quantity + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <p className="w-20 text-right font-medium text-charcoal">
        {formatPrice(price * item.quantity)}
      </p>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-warm-gray hover:text-error"
        onClick={() => removeItem(item.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/cart/CartSummary.js`**

```jsx
'use client';

import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function CartSummary() {
  const { subtotal, shipping, total } = useCart();

  return (
    <div className="bg-surface border border-sand rounded-lg p-6 space-y-3">
      <h3 className="font-heading text-lg font-medium text-charcoal">Order Summary</h3>
      <div className="flex justify-between text-sm">
        <span className="text-warm-gray">Subtotal</span>
        <span className="text-charcoal">{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-warm-gray">Shipping</span>
        <span className="text-charcoal">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
      </div>
      {shipping > 0 && (
        <p className="text-xs text-sage">Free shipping on orders over $75</p>
      )}
      <Separator className="bg-sand" />
      <div className="flex justify-between font-medium">
        <span className="text-charcoal">Total</span>
        <span className="text-terracotta text-lg">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `app/cart/page.js`**

```jsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { cart } = useCart();
  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div className="text-center py-32">
        <ShoppingBag className="h-12 w-12 text-sand mx-auto mb-4" />
        <h1 className="font-heading text-2xl text-charcoal mb-2">Your cart is empty</h1>
        <p className="text-warm-gray mb-8">Browse our collection and find something you love.</p>
        <Link href="/products">
          <Button className="bg-terracotta hover:bg-terracotta/90 text-white">
            Shop Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-semibold text-charcoal">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <div className="space-y-4">
          <CartSummary />
          <Link href={isAuthenticated ? '/checkout' : '/login?redirect=/checkout'}>
            <Button className="w-full bg-terracotta hover:bg-terracotta/90 text-white py-3">
              {isAuthenticated ? 'Proceed to Checkout' : 'Sign in to Checkout'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/cart/ app/cart/
git commit -m "feat: add cart page with item management and order summary"
```

---

## Task 14: Auth Pages (Login & Register)

**Files:**
- Create: `app/login/page.js`
- Create: `app/register/page.js`

- [ ] **Step 1: Create `app/login/page.js`**

```jsx
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push(redirect);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center py-16">
      <Card className="w-full max-w-md border-sand bg-white">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl text-charcoal">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-charcoal">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-sand focus-visible:ring-terracotta"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-charcoal">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-sand focus-visible:ring-terracotta"
              />
            </div>
            {error && <p className="text-error text-sm">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-terracotta hover:bg-terracotta/90 text-white"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <p className="text-center text-sm text-warm-gray mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-terracotta hover:underline">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
```

- [ ] **Step 2: Create `app/register/page.js`**

```jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center py-16">
      <Card className="w-full max-w-md border-sand bg-white">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl text-charcoal">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-charcoal">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-sand focus-visible:ring-terracotta"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-charcoal">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-sand focus-visible:ring-terracotta"
              />
              <p className="text-xs text-warm-gray mt-1">Must be at least 8 characters</p>
            </div>
            {error && <p className="text-error text-sm">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-terracotta hover:bg-terracotta/90 text-white"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <p className="text-center text-sm text-warm-gray mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-terracotta hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/login/ app/register/
git commit -m "feat: add login and register pages"
```

---

## Task 15: Checkout Page with Stripe

**Files:**
- Create: `components/checkout/AddressForm.js`
- Create: `components/checkout/StripePayment.js`
- Create: `app/checkout/page.js`

- [ ] **Step 1: Create `components/checkout/AddressForm.js`**

```jsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AddressForm({ address, onChange }) {
  function update(field, value) {
    onChange({ ...address, [field]: value });
  }

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg font-medium text-charcoal">Shipping Address</h3>
      <div>
        <Label className="text-charcoal text-sm">Address Line 1</Label>
        <Input
          required
          value={address.line1}
          onChange={(e) => update('line1', e.target.value)}
          placeholder="123 Main St"
          className="border-sand focus-visible:ring-terracotta"
        />
      </div>
      <div>
        <Label className="text-charcoal text-sm">Address Line 2 (optional)</Label>
        <Input
          value={address.line2}
          onChange={(e) => update('line2', e.target.value)}
          placeholder="Apt, suite, etc."
          className="border-sand focus-visible:ring-terracotta"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-charcoal text-sm">City</Label>
          <Input
            required
            value={address.city}
            onChange={(e) => update('city', e.target.value)}
            className="border-sand focus-visible:ring-terracotta"
          />
        </div>
        <div>
          <Label className="text-charcoal text-sm">State</Label>
          <Input
            value={address.state}
            onChange={(e) => update('state', e.target.value)}
            className="border-sand focus-visible:ring-terracotta"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-charcoal text-sm">ZIP Code</Label>
          <Input
            required
            value={address.zip}
            onChange={(e) => update('zip', e.target.value)}
            className="border-sand focus-visible:ring-terracotta"
          />
        </div>
        <div>
          <Label className="text-charcoal text-sm">Country (2-letter code)</Label>
          <Input
            required
            maxLength={2}
            value={address.country}
            onChange={(e) => update('country', e.target.value.toUpperCase())}
            placeholder="US"
            className="border-sand focus-visible:ring-terracotta"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/checkout/StripePayment.js`**

```jsx
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ onSuccess, orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}?success=true`,
      },
    });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
    }
    // If successful, Stripe redirects — no code runs after this
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-error text-sm">{error}</p>}
      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-terracotta hover:bg-terracotta/90 text-white py-3"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
}

export default function StripePayment({ clientSecret, orderId, onSuccess }) {
  if (!clientSecret) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'flat',
          variables: {
            colorPrimary: '#c4775a',
            colorBackground: '#faf8f5',
            colorText: '#2c2c2c',
            borderRadius: '8px',
          },
        },
      }}
    >
      <PaymentForm onSuccess={onSuccess} orderId={orderId} />
    </Elements>
  );
}
```

- [ ] **Step 3: Create `app/checkout/page.js`**

```jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { apiFetch } from '@/lib/api';
import AddressForm from '@/components/checkout/AddressForm';
import StripePayment from '@/components/checkout/StripePayment';
import CartSummary from '@/components/cart/CartSummary';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const { cart } = useCart();

  const [address, setAddress] = useState({
    line1: '', line2: '', city: '', state: '', zip: '', country: 'US',
  });
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isHydrated, isAuthenticated, router]);

  async function handleCreateOrder() {
    if (!address.line1 || !address.city || !address.zip || !address.country) {
      setError('Please fill in all required address fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch('/api/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({ shippingAddress: address }),
      });
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
    } catch (err) {
      setError(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  if (!isHydrated || !isAuthenticated) return null;

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-semibold text-charcoal">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <AddressForm address={address} onChange={setAddress} />

          {!clientSecret && (
            <>
              {error && <p className="text-error text-sm">{error}</p>}
              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className="w-full bg-terracotta hover:bg-terracotta/90 text-white py-3 rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Creating order...' : 'Continue to Payment'}
              </button>
            </>
          )}

          {clientSecret && (
            <StripePayment clientSecret={clientSecret} orderId={orderId} />
          )}
        </div>

        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/checkout/ app/checkout/
git commit -m "feat: add checkout page with address form and Stripe payment"
```

---

## Task 16: Order History & Order Detail Pages

**Files:**
- Create: `app/orders/page.js`
- Create: `app/orders/[id]/page.js`

- [ ] **Step 1: Create `app/orders/page.js`**

```jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login?redirect=/orders');
      return;
    }
    if (isAuthenticated) {
      apiFetch('/api/orders')
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated || !isAuthenticated) return null;

  if (loading) {
    return <p className="text-warm-gray text-center py-16">Loading orders...</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-32">
        <Package className="h-12 w-12 text-sand mx-auto mb-4" />
        <h1 className="font-heading text-2xl text-charcoal mb-2">No orders yet</h1>
        <p className="text-warm-gray">Your order history will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-3xl font-semibold text-charcoal">Your Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <Card className="border-sand bg-white hover:shadow-sm transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-charcoal font-medium text-sm">
                    Order #{order.id.slice(-8)}
                  </p>
                  <p className="text-warm-gray text-xs mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}>
                    {order.status}
                  </Badge>
                  <p className="text-terracotta font-medium">{formatPrice(order.total)}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/orders/[id]/page.js`**

```jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const { isAuthenticated, isHydrated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated && params.id) {
      apiFetch(`/api/orders/${params.id}`)
        .then(setOrder)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, isHydrated, params.id, router]);

  if (!isHydrated || !isAuthenticated) return null;
  if (loading) return <p className="text-warm-gray text-center py-16">Loading order...</p>;
  if (error) return <p className="text-error text-center py-16">{error}</p>;
  if (!order) return null;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {isSuccess && (
        <div className="bg-green-50 border border-success rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-success" />
          <p className="text-success font-medium">Payment successful! Your order has been placed.</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-charcoal">
          Order #{order.id.slice(-8)}
        </h1>
        <Badge className={STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}>
          {order.status}
        </Badge>
      </div>

      <p className="text-warm-gray text-sm">
        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        })}
      </p>

      {/* Items */}
      <Card className="border-sand bg-white">
        <CardContent className="p-4 divide-y divide-sand">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-3">
              <div>
                <p className="text-charcoal font-medium">
                  {item.variantSnapshot?.name || item.variant?.name}
                </p>
                <p className="text-warm-gray text-sm">
                  SKU: {item.variantSnapshot?.sku || item.variant?.sku} &middot; Qty: {item.quantity}
                </p>
              </div>
              <p className="text-charcoal font-medium">
                {formatPrice(Number(item.unitPrice) * item.quantity)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Totals */}
      <Card className="border-sand bg-surface">
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-warm-gray">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-warm-gray">Shipping</span>
            <span>{Number(order.shipping) === 0 ? 'Free' : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between font-medium text-lg pt-2 border-t border-sand">
            <span>Total</span>
            <span className="text-terracotta">{formatPrice(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      <Link href="/orders">
        <Button variant="outline" className="border-sand text-warm-gray">
          Back to Orders
        </Button>
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/orders/
git commit -m "feat: add order history and order detail/confirmation pages"
```

---

## Task 17: End-to-End Verification

- [ ] **Step 1: Start the backend**

```bash
cd ~/Desktop/Ceramic && npm run dev
```

Ensure it's running on port 4000 and the database is seeded (`npm run db:seed`).

- [ ] **Step 2: Start the frontend**

```bash
cd ~/Desktop/ceramic-frontend && npm run dev
```

Open `http://localhost:3000`.

- [ ] **Step 3: Verify all pages manually**

Walk through each flow:
1. Home page loads with products and categories
2. `/products` shows listing with filters and pagination
3. Click a product → detail page with variants, add to cart
4. Cart page shows items, quantity controls, summary
5. Register a new account at `/register`
6. Login at `/login`
7. Cart merges local items to backend
8. `/checkout` → fill address, create order, Stripe payment form appears
9. `/orders` → shows order history
10. 404 page: visit `/nonexistent`

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address issues found during end-to-end verification"
```
