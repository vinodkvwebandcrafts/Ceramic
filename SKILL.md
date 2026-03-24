# SKILL.md — Ceramic Backend Developer Reference

## Quick Reference

### Adding a new endpoint
1. Add route to `src/routes/<domain>.js`
2. Add controller method to `src/controllers/<domain>Controller.js`
3. Add business logic to `src/services/<domain>Service.js`
4. Add Joi validator to `src/validators/<domain>Validator.js`
5. Write unit test in `tests/unit/services/<domain>Service.test.js`

### Prisma patterns used in this project
```js
// Always import the singleton
const db = require('../../config/db');

// Mock in tests
jest.mock('../../config/db');
```

### Auth flow
1. POST /api/auth/login → returns { accessToken, refreshToken }
2. Send `Authorization: Bearer <accessToken>` on protected routes
3. POST /api/auth/refresh with { refreshToken } to rotate tokens

### Stripe webhook flow
1. POST /api/webhooks/stripe (raw body, Stripe-Signature header)
2. stripeService.constructEvent() verifies signature
3. orderService.handleStripeEvent() checks stripeEventId for idempotency
4. On payment_intent.succeeded: update Order status to PAID

### Common test patterns
```js
// Mock Prisma
jest.mock('../../config/db');
const db = require('../../config/db');
db.user.findUnique = jest.fn();

// Mock bcryptjs
jest.mock('bcryptjs');

// Mock jsonwebtoken
jest.mock('jsonwebtoken');
```
