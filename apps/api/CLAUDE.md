# Ceramic API

## Architecture
```
routes → controllers → services → Prisma
```

- **Controllers** handle HTTP concerns: parse request, call service, send response. Keep them thin.
- **Services** contain business logic and call Prisma directly. All complex logic lives here.
- **Middleware** handles cross-cutting concerns: auth, validation, error handling, rate limiting.

## Key Patterns

### Error Handling
Throw `AppError` subclasses from services:
- `NotFoundError` → 404
- `ValidationError` → 400
- `UnauthorizedError` → 401
- `ForbiddenError` → 403
- `ConflictError` → 409

The centralized `errorHandler` middleware catches all errors and returns `ApiResponse` format.

### Validation
Use `validate(schema)` middleware in routes. Schemas are imported from `@ceramic/utils`:
```typescript
router.post('/', validate(createProductSchema), controller.create);
```

### Auth
- `auth` middleware extracts JWT from `Authorization: Bearer <token>`, verifies, attaches `req.user`.
- `admin` middleware checks `req.user.role === 'ADMIN'`, returns 403 otherwise.
- Access tokens: 15 min. Refresh tokens: 7 days (httpOnly cookie).

### Pagination
All list endpoints use `buildPagination(page, limit, total)`:
```typescript
return { success: true, data: items, pagination: { page, limit, total, totalPages } };
```

### Prices
All prices in **paise** (integer). 100 paise = ₹1. The API accepts and returns paise.
- GST: 18% (`GST_RATE` from `@ceramic/utils`)
- Shipping: Free above ₹999 (`FREE_SHIPPING_THRESHOLD`), otherwise ₹99 flat (`FLAT_SHIPPING_RATE`)

### Logging
Use `logger` from `utils/logger.ts` (Pino). **Never** use `console.log`.

## Database Commands
```bash
pnpm prisma migrate dev              # Create/apply migrations
pnpm prisma generate                 # Regenerate client after schema changes
pnpm prisma db seed                  # Run seed script (tsx prisma/seed.ts)
pnpm prisma studio                   # GUI browser at localhost:5555
pnpm prisma migrate reset            # Reset DB (DESTRUCTIVE)
```

## Testing
```bash
pnpm test                            # Run Vitest
pnpm test -- --watch                 # Watch mode
```
Tests in `src/__tests__/`. Integration tests use a test database (`TEST_DATABASE_URL`).

## Adding a New Endpoint
1. Add Zod schema in `packages/utils/src/validation.ts` if new validation needed
2. Add types in `packages/types/src/` if new response shape
3. Create/update route file in `src/routes/`
4. Create controller function (parse req → call service → send res)
5. Create service function (business logic → Prisma calls)
6. Register route in `src/routes/index.ts`
7. Add test in `src/__tests__/`

## API Routes Overview
- **Public**: `/auth/*`, `GET /products`, `GET /products/:slug`, `GET /categories`
- **Customer** (auth required): `/cart/*`, `/orders/*`, `/reviews/*`, `/wishlist/*`, `/addresses/*`, `/payments/*`
- **Admin** (auth + admin role): `/admin/products/*`, `/admin/orders/*`, `/admin/users/*`, `/admin/categories/*`, `/admin/reviews/*`, `/admin/analytics/*`

## Critical Implementation Notes
- Razorpay webhook at `/payments/webhook` must use `express.raw()` (NOT `express.json()`) for signature verification
- Stock decrement uses atomic Prisma operation with `WHERE stock >= quantity` to prevent overselling
- Order creation runs in a Prisma `$transaction` to ensure atomicity
- Refresh tokens stored in httpOnly cookies, not in response body
- Password hashing: bcrypt with 12 salt rounds
