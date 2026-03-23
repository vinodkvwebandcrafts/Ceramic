# Ceramic Storefront

## Architecture
Next.js 14 App Router. **Server components by default.** Only add `"use client"` when needed (interactivity, hooks, browser APIs, event handlers).

## Key Patterns

### Data Fetching
- Server components fetch via `lib/api.ts` typed functions: `getProducts()`, `getProduct(slug)`, etc.
- Client components use the same functions but called from effects or event handlers.
- No React Query or SWR unless real-time updates are needed.

### API Calls
`lib/api.ts` exports typed functions that call the backend:
```typescript
const products = await getProducts({ category: 'mugs', page: 1 });
// Returns PaginatedResponse<ProductListItem>
```
Base URL: `NEXT_PUBLIC_API_URL` (default http://localhost:4000/api/v1)

### Auth
NextAuth v5 with CredentialsProvider. On login, calls backend `/auth/login`, stores JWT in session.
- Server: `auth()` function
- Client: `useSession()` hook

### Cart State
Zustand store in `stores/cartStore.ts`:
- **Guest**: persisted to localStorage
- **Logged in**: synced with backend `/cart` API
- On login: merge guest cart items into server cart

### Styling
Tailwind CSS with design tokens from `tailwind.config.ts`. Use `cn()` utility for conditional classes:
```typescript
import { cn } from '@/lib/cn';
cn('base-class', condition && 'conditional-class')
```

### Currency Display
**Always** use `formatINRWithSymbol()` from `@ceramic/utils`:
```typescript
import { formatINRWithSymbol } from '@ceramic/utils';
// API returns { price: 59900 } → display "₹599.00"
```

## Design System

### Colors (Tailwind classes)
| Class | Hex | Usage |
|-------|-----|-------|
| `bg-primary` / `text-primary` | #197278 | Buttons, links, accents |
| `bg-primary-dark` | #283d3b | Hero, dark sections |
| `bg-secondary` | #c44536 | CTA buttons, sale badges, eyebrow text |
| `bg-tint` | #edddd4 | Tint buttons, light accents |
| `bg-cream` | #faf7f4 | Alternating section bg |
| `bg-warm-white` | #f5f0eb | Alternating section bg |
| `text-warm-gray-3` | #8a7f78 | Secondary text |

### Typography
| Element | Font | Size | Weight |
|---------|------|------|--------|
| Logo | `font-logo` (Fascinate) | 1.375rem | normal |
| h1 | `font-heading` (League Spartan) | 2.25rem | 700 |
| h2 | `font-heading` | 1.75rem | 700 |
| h3 | `font-heading` | 1.25rem | 700 |
| body | `font-body` (League Spartan) | 0.9375rem | 400 |
| button/ui | `font-ui` (Montserrat) | varies | 500 |
| eyebrow | `font-ui` | 0.625rem | 500, uppercase, ls 0.12em |

### Components
- `<Button variant="primary|secondary|outline|ghost|tint" size="sm|md|lg" />`
- `<Input size="sm|md|lg" error={message} />`
- `<Container>` -- max-w-[75rem] mx-auto px-6
- `<ProductCard product={...} />` -- Standard product card with image, name, price, rating, add btn

### Homepage Section Order + Backgrounds
1. Navbar (layout -- sticky, cream)
2. Hero (primary-dark #283d3b)
3. Category Strip (warm-white)
4. Featured Products (cream)
5. Best Sellers (warm-white)
6. About Brand (cream)
7. Recently Viewed (warm-white, client component)
8. Testimonials (cream)
9. FAQ (warm-white)
10. Newsletter (primary-dark)
11. Footer (layout -- #1a1614)

## Component Organization
```
src/components/
├── ui/        Atomic, reusable (Button, Input, Card, Badge, etc.)
├── layout/    App-wide (Navbar, Footer, MobileMenu)
├── product/   Product display (ProductCard, ProductGrid, ImageGallery)
├── cart/      Cart UI (CartDrawer, CartItem, CartSummary)
├── checkout/  Checkout flow (AddressForm, OrderSummary, PaymentStep)
└── home/      Homepage sections (HeroSection, FeaturedProducts, etc.)
```

## File Conventions
- Page components in `app/` directory (Next.js routing)
- Shared components in `components/`
- Hooks in `hooks/`
- State stores in `stores/`
- API functions and config in `lib/`
