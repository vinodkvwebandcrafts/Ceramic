# Ceramic Storefront Frontend — Design Spec

**Date:** 2026-03-24
**Status:** Approved
**Stack:** Next.js (App Router), JavaScript, shadcn/ui + Tailwind CSS, Stripe Elements

---

## Overview

Customer-facing storefront for the Ceramic e-commerce backend. Server Components for SEO-critical pages (products, categories, home). Client Components for interactive features (cart, checkout, auth, orders). Plain fetch + React Context for state management. Separate repository from the backend.

---

## Tech Choices

| Concern | Decision |
|---|---|
| Framework | Next.js (App Router, Server Components) |
| Language | JavaScript only (jsconfig.json for aliases) |
| Styling | Tailwind CSS + shadcn/ui |
| State management | React Context + plain fetch |
| Auth storage | localStorage (access + refresh tokens) |
| Payments | Stripe Elements via `@stripe/react-stripe-js` |
| Data fetching (server) | Direct fetch to backend in Server Components |
| Data fetching (client) | `lib/api.js` wrapper with auto token refresh |

---

## Project Structure

```
ceramic-frontend/
├── app/
│   ├── layout.js              # Root layout — fonts, global styles, providers
│   ├── page.js                # Home — hero, featured products, categories
│   ├── products/
│   │   ├── page.js            # Product listing (Server Component)
│   │   └── [slug]/
│   │       └── page.js        # Product detail (Server Component)
│   ├── categories/
│   │   └── [slug]/
│   │       └── page.js        # Category products (Server Component)
│   ├── cart/
│   │   └── page.js            # Cart page (Client Component)
│   ├── checkout/
│   │   └── page.js            # Checkout — address + Stripe (Client Component)
│   ├── orders/
│   │   ├── page.js            # Order history (Client Component, auth required)
│   │   └── [id]/
│   │       └── page.js        # Order detail / confirmation (Client Component)
│   ├── login/
│   │   └── page.js            # Login form (Client Component)
│   ├── register/
│   │   └── page.js            # Register form (Client Component)
│   ├── not-found.js           # Custom 404 page
│   ├── error.js               # Global error boundary (Client Component)
│   ├── loading.js             # Global loading skeleton
│   └── globals.css
├── components/
│   ├── Providers.js           # "use client" wrapper for AuthContext + CartContext
│   ├── ui/                    # shadcn/ui components
│   ├── layout/                # Header, Footer, Navbar
│   ├── products/              # ProductCard, ProductGrid, VariantSelector
│   ├── cart/                  # CartItem, CartSummary
│   └── checkout/              # AddressForm, StripePayment
├── context/
│   ├── AuthContext.js         # Auth state + token management
│   └── CartContext.js         # Cart state + sync with backend
├── lib/
│   ├── api.js                 # Fetch wrapper with auth headers + token refresh
│   └── utils.js               # Helpers (formatPrice, etc.)
├── jsconfig.json
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## Visual Design

### Color Palette (Minimal / Clean — Earthy Tones)

| Role | Color | Hex |
|---|---|---|
| Background | Warm white | `#faf8f5` |
| Surface | Soft cream | `#f3efe8` |
| Primary accent | Warm terracotta | `#c4775a` |
| Secondary accent | Muted sage | `#8a9a7b` |
| Text primary | Deep charcoal | `#2c2c2c` |
| Text secondary | Warm gray | `#7a7268` |
| Borders | Light sand | `#e5ddd3` |
| Success | Sage green | `#6b8f5e` |
| Error | Soft red | `#c45c4d` |

### Typography

- Font family: `DM Sans` or `Lora` — warm, elegant serif/sans-serif pairing (headings in serif, body in sans)
- Generous whitespace, understated sizing, letting the products speak
- Lightweight font weights (300-400) for body, medium (500) for headings

### Component Patterns

- **ProductCard:** White card, soft shadow, large image with subtle scale on hover, name + price below in muted tones
- **Header:** Clean white, logo left, minimal nav center, cart icon + auth right, thin bottom border
- **Buttons:** Primary = terracotta fill + white text, Secondary = outlined in charcoal, ghost for nav
- **VariantSelector:** Soft rounded toggles with sand border, terracotta fill when active
- **Forms:** White inputs, sand borders, terracotta focus ring, rounded corners

### Layout

- Max-width container (~1200px), centered
- Product grid: 1 col mobile, 2 col tablet, 3 col desktop
- Abundant whitespace and padding — airy, gallery-like feel

---

## Data Flow & State Management

### Server Components (Public Pages)

Product listing, product detail, category pages, and home page fetch directly from the backend at request time. No auth needed. No client-side caching — fresh data on every load.

**Backend URL configuration:** Server Components use a server-only env var `API_URL` (e.g., `http://localhost:4000`). Client Components use `NEXT_PUBLIC_API_URL`. Both default to `http://localhost:4000` in development. In production, `API_URL` can point to an internal network address while `NEXT_PUBLIC_API_URL` points to the public backend URL.

**CORS:** The backend already has `cors()` enabled. In development, add a `rewrites()` entry in `next.config.js` to proxy `/api` requests to the backend, avoiding CORS issues during local development.

### Auth Context

- Stores `accessToken`, `refreshToken`, and `user` object in React state
- Persists tokens to `localStorage` on login/register
- Hydrates from `localStorage` on mount
- Exposes: `login()`, `register()`, `logout()`, `isAuthenticated`
- Wraps entire app via `Providers.js` — a `"use client"` component imported by root layout
- Initial render shows unauthenticated state until client hydrates from localStorage (brief flash handled by suppressing auth-dependent UI until `isHydrated` flag is true)

### Cart Context

- **Authenticated users:** Syncs with backend (`GET/POST/PUT/DELETE /api/cart`)
- **Unauthenticated users:** localStorage-only cart
- On login: merges local cart into backend cart by calling `POST /api/cart/items` for each local item (backend increments quantity if variant already exists), then clears localStorage cart
- Optimistic updates: mutate state first, fire API, rollback on failure
- Exposes: `cart`, `addItem()`, `updateItem()`, `removeItem()`, `itemCount`, `total`

### API Wrapper (`lib/api.js`)

- `apiFetch(endpoint, options)` — thin wrapper around `fetch`
- Attaches `Authorization: Bearer <token>` header automatically
- On 401: attempts token refresh via `/api/auth/refresh`, retries original request once
- If refresh fails: clears auth state, redirects to `/login`

---

## Page Behaviors

### Home (`/`)

- Hero section: large gradient/image background, headline ("Handcrafted Ceramics"), CTA to shop
- Featured products: latest 8 active products in a grid
- Category showcase: top-level categories with names, linked to browse pages

### Product Listing (`/products`)

- Filter bar: category dropdown, price range (min/max inputs)
- URL-based filters via query params (`?categoryId=x&minPrice=10&maxPrice=50`)
- Pagination: page numbers + prev/next at bottom
- Skeleton cards during server fetch

### Product Detail (`/products/[slug]`)

- Large product image(s) — gallery/carousel if multiple
- Product name, price (base + variant modifier)
- Variant selector: pill toggles, updates displayed price dynamically
- Stock indicator: "In stock" / "Out of stock" per variant `stockQty`
- Add to cart button: disabled when out of stock
- Category breadcrumb at top
- **Note:** VariantSelector and AddToCartButton are Client Component islands embedded inside this Server Component page

### Cart (`/cart`)

- Line items: image, name, variant info, quantity +/- controls, remove button
- Line item price: unitPrice x qty
- Summary: subtotal, shipping ($9.99 or free over $75), total
- "Proceed to Checkout": redirects to `/login` if unauthenticated

### Checkout (`/checkout`)

- Protected route — redirect to `/login` if not authenticated
- Shipping address form: `line1`, `line2` (optional), `city`, `state`, `zip`, `country` (matches backend `checkoutSchema`)
- Stripe Elements card input
- Order summary sidebar: items + total
- "Pay now" button with loading state
- Success: redirect to `/orders/[id]?success=true` — shows order confirmation with success toast

### Order History (`/orders`)

- Protected route
- Order list: ID, date, status badge (color-coded), total
- Expandable: click to see line items with variant details

### Auth (`/login`, `/register`)

- Centered card form on dark background
- Email + password fields
- Toggle link between login/register
- Inline error messages below fields

---

## Checkout / Payment Flow

1. User fills shipping address form
2. Frontend calls `POST /api/orders/checkout` with shipping address → receives `clientSecret` + `orderId`
3. Stripe Elements collects card details using `clientSecret`
4. On Stripe payment success → redirect to `/orders/[orderId]?success=true` (order confirmation page)
5. Stripe webhook updates order status to PAID on the backend (async)

---

## Backend API Endpoints Consumed

### Public (Server Components)

| Method | Endpoint | Used By |
|---|---|---|
| GET | `/api/products` | Product listing, home (featured) |
| GET | `/api/products/:slug` | Product detail |
| GET | `/api/categories` | Home, filter sidebar |
| GET | `/api/categories/:slug` | Category page |
| GET | `/api/categories/:slug/products` | Category products |

### Authenticated (Client Components)

| Method | Endpoint | Used By |
|---|---|---|
| POST | `/api/auth/register` | Register page |
| POST | `/api/auth/login` | Login page |
| POST | `/api/auth/refresh` | API wrapper (auto) |
| POST | `/api/auth/logout` | Header logout button |
| GET | `/api/cart` | Cart context |
| POST | `/api/cart/items` | Add to cart |
| PUT | `/api/cart/items/:id` | Update quantity |
| DELETE | `/api/cart/items/:id` | Remove item |
| POST | `/api/orders/checkout` | Checkout page |
| GET | `/api/orders` | Order history |
| GET | `/api/orders/:id` | Order detail |

---

## Dependencies

```json
{
  "next": "^15",
  "react": "^19",
  "react-dom": "^19",
  "@stripe/stripe-js": "^5",
  "@stripe/react-stripe-js": "^3",
  "tailwindcss": "^4",
  "class-variance-authority": "^0.7",
  "clsx": "^2",
  "tailwind-merge": "^3",
  "lucide-react": "^0.475"
}
```

Plus shadcn/ui components installed via CLI (`npx shadcn@latest init` + individual components as needed).
