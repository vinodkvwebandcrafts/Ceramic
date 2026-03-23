# Ceramic -- Handcrafted Ceramics Ecommerce

## Project Structure
This is a pnpm monorepo managed with Turborepo.

```
Ceramic/
├── apps/
│   ├── api/          Express REST API (Node.js, TypeScript, Prisma, PostgreSQL)
│   ├── web/          Next.js 14 storefront (App Router, Tailwind CSS)
│   └── dashboard/    Next.js 14 admin panel (App Router, Tailwind CSS)
├── packages/
│   ├── types/        Shared TypeScript types (@ceramic/types)
│   └── utils/        Shared utilities (@ceramic/utils)
```

## Commands
```bash
pnpm install                       # Install all dependencies
pnpm dev                           # Start all apps in dev mode (turbo)
pnpm build                         # Build all apps
pnpm lint                          # Lint all apps
pnpm test                          # Run all tests
pnpm --filter api dev              # Start only the API (port 4000)
pnpm --filter web dev              # Start only the storefront (port 3000)
pnpm --filter dashboard dev        # Start only the dashboard (port 3001)
pnpm --filter api db:migrate       # Run Prisma migrations
pnpm --filter api db:seed          # Seed the database
pnpm --filter api db:studio        # Open Prisma Studio
docker compose up -d               # Start PostgreSQL + Redis
```

## Database
PostgreSQL via Docker: `docker compose up -d postgres`
Connection: `DATABASE_URL="postgresql://ceramic:ceramic@localhost:5432/ceramic"`

## Conventions
- All prices stored in **paise** (integer). 100 paise = ₹1. Use `formatINR()` from `@ceramic/utils` for display.
- API responses follow the `ApiResponse<T>` / `PaginatedResponse<T>` shape from `@ceramic/types`.
- Zod schemas in `@ceramic/utils/src/validation.ts` are shared between frontend and backend.
- File naming: kebab-case for files, PascalCase for React components, camelCase for utilities.
- Import shared code via `@ceramic/types` and `@ceramic/utils` workspace aliases.
- Server components by default in Next.js. Only add "use client" when interactivity is needed.
- Never use console.log in the API -- use pino logger.

## Architecture
- **API**: routes → controllers (HTTP concerns) → services (business logic) → Prisma (DB)
- **Web**: Next.js App Router, server components for data fetching, client components for interactivity
- **Dashboard**: Next.js App Router, admin-only access, data tables + forms

## Design System
| Token | Value |
|-------|-------|
| primary | #197278 |
| primary-dark | #283d3b |
| secondary | #c44536 |
| secondary-dark | #772e25 |
| tint | #edddd4 |
| cream | #faf7f4 |
| warm-white | #f5f0eb |
| Font: Logo | Fascinate |
| Font: Headings/Body | League Spartan |
| Font: UI/Buttons | Montserrat |
| Container | max-width 75rem, px 1.5rem |

## Environment Variables
Copy `.env.example` to `.env` and fill in values. Required:
- `DATABASE_URL` -- PostgreSQL connection string
- `JWT_SECRET`, `JWT_REFRESH_SECRET` -- 256-bit secrets for JWT signing
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` -- Razorpay API keys
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` -- Public Razorpay key for frontend
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `NEXTAUTH_SECRET` -- NextAuth encryption secret
- `NEXT_PUBLIC_API_URL` -- Backend URL (default http://localhost:4000/api/v1)

## Payment Flow (Razorpay)
1. Frontend POST /orders → backend creates Order + Razorpay order
2. Frontend opens Razorpay checkout modal
3. On success, POST /payments/verify with signature
4. Backend verifies HMAC-SHA256 → updates order → decrements stock → clears cart
5. Webhook fallback at /payments/webhook handles edge cases idempotently

## Key Dependencies
- **Backend**: express, prisma, bcryptjs, jsonwebtoken, razorpay, cloudinary, pino
- **Frontend**: next 14, react 19, zustand, class-variance-authority, tailwind-merge
- **Dashboard**: next 14, @tanstack/react-table, recharts, react-hook-form
- **Shared**: zod (validation), typescript (strict mode everywhere)
