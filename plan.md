# Ceramic Ecommerce Monorepo -- Implementation Plan

## Context
Building a greenfield handcrafted ceramics ecommerce platform for the Indian market (prices in INR/paise). The design system is fully specified in `ceramic_ui_plan_rem.html` with colors, typography, spacing, components, and an 11-section homepage layout. The project directory is empty -- we're building from scratch.

## Tech Stack
- **Monorepo**: pnpm workspaces + Turborepo
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS
- **Dashboard**: Next.js 14 App Router, TypeScript, Tailwind CSS, @tanstack/react-table
- **Auth**: NextAuth v5 (frontend) + JWT (API)
- **Payments**: Razorpay (Indian market)
- **Images**: Cloudinary
- **State**: Zustand (cart), Zod (validation shared FE/BE)
- **Shared**: `@ceramic/types`, `@ceramic/utils`

---

## Monorepo Structure

```
Ceramic/
├── CLAUDE.md
├── package.json, pnpm-workspace.yaml, turbo.json, tsconfig.base.json
├── .gitignore, .prettierrc, .eslintrc.js, .env.example
├── docker-compose.yml
├── packages/
│   ├── types/        (@ceramic/types -- shared TS interfaces)
│   └── utils/        (@ceramic/utils -- formatINR, slugify, Zod schemas, constants)
├── apps/
│   ├── api/          (Express REST API, port 4000)
│   │   ├── CLAUDE.md
│   │   ├── prisma/   (schema.prisma, seed.ts, migrations/)
│   │   └── src/      (routes/, controllers/, services/, middleware/, config/, utils/)
│   ├── web/          (Next.js storefront, port 3000)
│   │   ├── CLAUDE.md
│   │   └── src/      (app/, components/, lib/, hooks/, stores/)
│   └── dashboard/    (Next.js admin panel, port 3001)
│       ├── CLAUDE.md
│       └── src/      (app/, components/, lib/)
```

---

## Database Schema (Prisma)

**Models**: User, Address, Category (self-referencing tree), Product, ProductImage, ProductVariant, Cart, CartItem, Order, OrderItem, Review, WishlistItem

**Key decisions**:
- All prices in **paise** (integers) -- 100 paise = 1 rupee
- OrderItem snapshots product name + price at order time
- ProductVariant.attributes is JSON for flexible combos (size/color/glaze)
- Cart is 1-per-user with cascade deletes
- Enums: Role (CUSTOMER/ADMIN), OrderStatus (PENDING→CONFIRMED→PROCESSING→SHIPPED→DELIVERED/CANCELLED/REFUNDED), PaymentStatus (PENDING/AUTHORIZED/CAPTURED/FAILED/REFUNDED)

---

## API Routes (`/api/v1`)

**Public**: auth (register/login/refresh/forgot/reset), products (list/detail), categories, product reviews
**Customer** (auth required): cart CRUD, wishlist, addresses, orders (create/list/detail), reviews (create/edit/delete), payments (create-order/verify)
**Admin** (auth + admin role): products CRUD + images + variants, orders (list/status update), users, review moderation, categories CRUD, analytics, image upload

Response shape: `{ success, data, error?, pagination? }` via `@ceramic/types`

---

## Razorpay Payment Flow

1. Frontend POST `/orders` → backend creates Order + calls Razorpay Orders API → returns `razorpayOrderId`
2. Frontend opens Razorpay checkout modal (UPI/card/netbanking/wallet)
3. On success, frontend POST `/payments/verify` with `{razorpay_order_id, payment_id, signature}`
4. Backend HMAC-SHA256 verifies signature → updates order status → decrements stock → clears cart → sends email
5. Webhook fallback at `/payments/webhook` (uses `express.raw()`) handles edge cases idempotently

---

## Phase 1: Foundation

### 1.1 Monorepo scaffold
- `package.json` (root), `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`
- `.gitignore`, `.prettierrc`, `.eslintrc.js`, `.env.example`
- `docker-compose.yml` (postgres:16 + redis:7)

### 1.2 Shared packages
- `packages/types/` -- TypeScript interfaces for all models + API response types
- `packages/utils/` -- `formatINR()`, `slugify()`, `generateOrderNumber()`, Zod schemas, constants

### 1.3 API scaffold
- Express app with: helmet, cors, rate limiter, pino logger, error handler
- Middleware: auth (JWT Bearer), admin (role check), validate (Zod), errorHandler
- Config: Zod-validated env vars, database, razorpay

### 1.4 Database + Prisma
- Full schema as designed above
- Seed: 1 admin, 5 categories (Mugs/Vases/Planters/Tableware/Decor), 20+ products with variants

### 1.5 Auth endpoints
- Register, login (JWT 15min + refresh 7d httpOnly cookie), refresh, forgot/reset password
- bcrypt 12 rounds, JWT payload: `{ userId, role }`

### 1.6 Products API
- `GET /products` -- paginated, filterable (category/price/tags/inStock), searchable
- `GET /products/:slug` -- with category, images, variants, review summary
- `GET /categories` -- tree structure with product counts

---

## Phase 2: Frontend Core (depends on Phase 1)

### 2.1 Next.js scaffold
- Create `apps/web/`, configure Tailwind with full design token system
- Self-host fonts: Fascinate, League Spartan, Montserrat via `next/font/local`

### 2.2 UI component library
- `Button` (5 variants × 3 sizes, using class-variance-authority)
- `Input` (3 sizes, error state)
- `Container`, `Card`, `Chip`, `Accordion`, `StarRating`, `Skeleton`, `Badge`

### 2.3 Layout components
- `Navbar` -- sticky 4rem, logo, links, search, wishlist, cart badge, mobile menu
- `Footer` -- dark bg, 4-col, brand, links, payment icons

### 2.4 Homepage (11 sections)
1. Navbar (layout.tsx)
2. HeroSection -- dark bg, h1, 2× btn-lg, stats, image grid
3. CategoryStrip -- pill chips
4. FeaturedProducts -- tab bar, 5-col ProductCard grid
5. BestSellers -- feature card + ranked list
6. AboutBrand -- photo mosaic, values grid, CTAs
7. RecentlyViewed -- horizontal scroll (client component, localStorage)
8. Testimonials -- 3-col cards with stars + avatar
9. FAQ -- 2-col with accordion
10. Newsletter -- dark band, email input + subscribe btn
11. Footer (layout.tsx)

### 2.5 Product pages
- `/shop` -- grid with sidebar filters (category, price, sort)
- `/shop/[slug]` -- image gallery, variant selector, add to cart, reviews tab

### 2.6 Cart
- Zustand store, localStorage for guests, synced with backend on login
- CartDrawer (slide-in) + full cart page
- Guest→login cart merge

### 2.7 Auth pages
- NextAuth v5 with CredentialsProvider
- Login + Register pages

### 2.8 Checkout
- Multi-step: address → review → Razorpay payment
- AddressForm with Indian states, OrderSummary, PaymentStep

---

## Phase 3: Backend Features (after Phase 1, parallel with Phase 2)

### 3.1 Orders service
- Create order in transaction: validate stock, calculate totals (18% GST, shipping free >999 or flat 99), decrement stock atomically
- Order number: `CER-YYYYMMDD-XXXXX`

### 3.2 Razorpay integration
- Create Razorpay order, verify signature, webhook handler (idempotent)
- Webhook uses `express.raw()` for signature verification

### 3.3 Inventory
- Atomic decrement with `WHERE stock >= quantity` prevents overselling

### 3.4 Search
- PostgreSQL full-text search via `tsvector`/`tsquery`

### 3.5 Reviews
- Verified purchase check, admin approval required, auto-update product rating

### 3.6 Email (Resend/Nodemailer)
- Order confirmation, shipping notification, password reset

### 3.7 Image upload
- Cloudinary SDK, multer memory storage, validate type + size (max 5MB)

---

## Phase 4: Admin Dashboard (after Phase 3)

### 4.1 Scaffold + auth
- Sidebar layout, admin-only access check

### 4.2 Overview
- StatCards (revenue/orders/customers/low stock), recent orders, revenue chart (Recharts)

### 4.3 Product CRUD
- DataTable list, ProductForm (create/edit) with ImageUploader + VariantManager

### 4.4 Order management
- DataTable with filters, order detail with status timeline + actions

### 4.5-4.7 Customers, categories, reviews, analytics pages

---

## Phase 5: Polish

- SSR optimization (ISR, skeletons, `<Image>` with Cloudinary loader, `next/font`)
- Testing: Vitest + supertest (API), Vitest + Testing Library (components), Playwright (E2E)
- Docker: multi-stage builds for api/web/dashboard
- CI/CD: GitHub Actions (lint/typecheck/test/build/deploy)
- SEO: metadata, sitemap, robots, JSON-LD structured data

---

## Files to Create (deliverables beyond code)

1. **`CLAUDE.md`** (root) -- monorepo overview, commands, conventions, env vars, design system summary
2. **`apps/api/CLAUDE.md`** -- API architecture (routes→controllers→services), patterns (errors, validation, auth, pagination), DB commands, how to add endpoints
3. **`apps/web/CLAUDE.md`** -- Next.js patterns (server vs client components), API calls, auth, cart state, design system usage, component organization
4. **`apps/dashboard/CLAUDE.md`** -- admin layout, DataTable usage, forms (RHF+Zod), image uploads, auth

---

## Verification

1. `docker compose up -d` starts PostgreSQL
2. `pnpm install && pnpm --filter api db:migrate && pnpm --filter api db:seed`
3. `pnpm dev` starts all 3 apps
4. Browse `localhost:3000` -- homepage renders all 11 sections
5. Browse products, add to cart, checkout with Razorpay test mode
6. Login to `localhost:3001` as admin, create/edit product, manage orders
7. `pnpm test` passes all suites
8. `pnpm build` succeeds for all apps

---

## Parallelism Strategy
- `senior-nodejs-dev` agent handles Phase 1 + Phase 3 (API, DB, payments)
- `senior-frontend-dev` agent handles Phase 2 + Phase 4 (storefront, dashboard)
- They converge at Phase 2.4+ when frontend needs real API data
