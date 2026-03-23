# API Skills Reference

## Quick Start
```bash
docker compose up -d postgres        # Start database
pnpm --filter api db:migrate         # Run migrations
pnpm --filter api db:seed            # Seed sample data
pnpm --filter api dev                # Start dev server (port 4000)
```

## Skill: Add a New Resource Endpoint
1. Define types in `packages/types/src/{resource}.ts`
2. Add Zod validation schemas in `packages/utils/src/validation.ts`
3. Add Prisma model in `prisma/schema.prisma` → run `pnpm prisma migrate dev --name add_{resource}`
4. Create service: `src/services/{resource}.service.ts`
5. Create controller: `src/controllers/{resource}.controller.ts`
6. Create routes: `src/routes/{resource}.routes.ts`
7. Register in `src/routes/index.ts`
8. Add tests: `src/__tests__/{resource}.test.ts`

## Skill: Add Admin Endpoint
Same as above but:
- Routes go in `src/routes/admin/{resource}.routes.ts`
- Apply `auth` + `admin` middleware
- Register under `/admin/` prefix

## Skill: Payment Integration
- Razorpay SDK in `src/config/razorpay.ts`
- Payment service in `src/services/payment.service.ts`
- Critical: webhook route uses `express.raw()` for signature verification
- Test with Stripe CLI equivalent: `razorpay webhook test`

## Skill: Database Operations
- Always use Prisma transactions for multi-table updates
- Use atomic operations for stock: `prisma.productVariant.update({ where: { id, stock: { gte: quantity } }, data: { stock: { decrement: quantity } } })`
- Seed realistic data for development

## Skill: Error Handling
```typescript
// In service:
throw new NotFoundError('Product not found');
throw new ValidationError('Invalid input', details);
throw new UnauthorizedError('Invalid credentials');
throw new ForbiddenError('Admin access required');
throw new ConflictError('Email already registered');
```

## Common Gotchas
- Always validate with Zod middleware before controller logic
- JWT refresh tokens go in httpOnly cookies, not response body
- Razorpay webhook must be idempotent (check if payment already processed)
- Prices are always in paise (integer) -- never store rupees as float
- Use `include` and `select` in Prisma queries to avoid over-fetching
- Log with pino, never console.log
