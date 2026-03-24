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
│   │   └── page.js            # Order history (Client Component, auth required)
│   ├── login/
│   │   └── page.js            # Login form (Client Component)
│   ├── register/
│   │   └── page.js            # Register form (Client Component)
│   └── globals.css
├── components/
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

### Color Palette (Bold/Modern Dark Theme)

| Role | Color | Hex |
|---|---|---|
| Background | Dark charcoal | `#0a0a0a` |
| Surface | Elevated cards | `#171717` |
| Primary accent | Warm amber/gold | `#d4a574` |
| Text primary | Off-white | `#fafafa` |
| Text secondary | Muted gray | `#a1a1aa` |
| Borders | Subtle | `#262626` |
| Success | Green | standard |
| Error | Red | standard |

### Typography

- Font family: `Inter` or `Geist` — clean, geometric, modern
- Large product names, generous spacing throughout

### Component Patterns

- **ProductCard:** Dark card, large image with hover-zoom, name + price below, subtle border glow on hover
- **Header:** Sticky, dark, logo left, nav center, cart icon (badge count) + auth right
- **Buttons:** Primary = amber fill + dark text, Secondary = outlined, ghost for nav
- **VariantSelector:** Pill-style toggles for size/color
- **Forms:** Dark inputs, subtle borders, amber focus ring

### Layout

- Max-width container (~1280px), centered
- Product grid: 1 col mobile, 2 col tablet, 3-4 col desktop
- Generous padding and spacing

---

## Data Flow & State Management

### Server Components (Public Pages)

Product listing, product detail, category pages, and home page fetch directly from the backend (`http://localhost:4000/api/...`) at request time. No auth needed. No client-side caching — fresh data on every load.

### Auth Context

- Stores `accessToken`, `refreshToken`, and `user` object in React state
- Persists tokens to `localStorage` on login/register
- Hydrates from `localStorage` on mount
- Exposes: `login()`, `register()`, `logout()`, `isAuthenticated`
- Wraps entire app via root layout providers

### Cart Context

- **Authenticated users:** Syncs with backend (`GET/POST/PUT/DELETE /api/cart`)
- **Unauthenticated users:** localStorage-only cart
- On login: merges local cart into backend cart
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

### Cart (`/cart`)

- Line items: image, name, variant info, quantity +/- controls, remove button
- Line item price: unitPrice x qty
- Summary: subtotal, shipping ($9.99 or free over $75), total
- "Proceed to Checkout": redirects to `/login` if unauthenticated

### Checkout (`/checkout`)

- Protected route — redirect to `/login` if not authenticated
- Shipping address form: name, street, city, state, zip, country
- Stripe Elements card input
- Order summary sidebar: items + total
- "Pay now" button with loading state
- Success: redirect to `/orders` with success toast

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
4. On Stripe payment success → redirect to order confirmation page
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
  "@stripe/stripe-js": "latest",
  "@stripe/react-stripe-js": "latest",
  "tailwindcss": "^4",
  "class-variance-authority": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest",
  "lucide-react": "latest"
}
```

Plus shadcn/ui components installed via CLI (`npx shadcn@latest init` + individual components as needed).
