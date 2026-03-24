# Swagger API Documentation — Design Spec

**Project:** Ceramic E-Commerce Backend
**Date:** 2026-03-24
**Scope:** Backend only — OpenAPI 3.0 spec + Swagger UI served from the Express app.
**Status:** Approved

---

## Overview

Add interactive API documentation to the Ceramic backend using `swagger-jsdoc` + `swagger-ui-express`. JSDoc `@openapi` annotation blocks live directly above each route handler, keeping docs co-located with the code they describe. The compiled spec is served as an interactive UI and as a raw JSON export for Postman/frontend teams.

---

## 1. Dependencies

```bash
npm install swagger-jsdoc swagger-ui-express
```

No dev-only distinction — the UI is useful in staging environments too.

---

## 2. New File: `src/config/swagger.js`

Holds the swagger-jsdoc options object and exports the compiled spec.

```js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ceramic E-Commerce API',
      version: '1.0.0',
      description: 'REST API for the Ceramic shop backend.',
    },
    servers: [{ url: 'http://localhost:4000' }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Validation failed' },
            details: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    tags: [
      { name: 'Auth' },
      { name: 'Products' },
      { name: 'Categories' },
      { name: 'Cart' },
      { name: 'Orders' },
      { name: 'Webhooks' },
      { name: 'Reviews' },
      { name: 'Admin - Products' },
      { name: 'Admin - Categories' },
      { name: 'Admin - Orders' },
      { name: 'Admin - Reviews' },
    ],
  },
  apis: ['./src/routes/**/*.js'],
};

// Note: the forward-slash glob pattern is platform-agnostic — swagger-jsdoc
// normalises paths internally and works correctly on Windows as written.

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
```

The `apis` glob covers all existing routes and will automatically pick up future route files (e.g., `src/routes/reviews.js`) when they are created.

---

## 3. `src/app.js` Changes

Two lines added after the existing middleware, before `app.use(errorHandler)`:

```js
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Swagger docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));
```

- **`GET /api/docs`** — Interactive Swagger UI
- **`GET /api/docs.json`** — Raw OpenAPI 3.0 JSON (importable into Postman, Insomnia, or shared with a frontend team)

**Test safety:** `src/config/swagger.js` is a pure module — it imports `swagger-jsdoc` and calls `swaggerJsdoc(options)` with a static config. It makes no DB calls, no network calls, and requires no mocks. The existing 96-test Jest suite is unaffected.

**Server URL:** The spec hardcodes `http://localhost:4000`. To make it environment-aware in future, replace with `process.env.API_URL || 'http://localhost:4000'` and add `API_URL` to `.env.example`.

---

## 4. Route Annotation Strategy

Each route file gets JSDoc `@openapi` blocks directly above `router.<method>()` calls. Inline schemas are used per-route rather than a shared schema library, keeping annotations self-contained and readable.

### Annotation examples

**Public GET with query params:**
```js
/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: List active products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: categoryId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated product list
 */
router.get('/', list);
```

**Public GET with path parameter:**
```js
/**
 * @openapi
 * /api/products/{slug}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product object
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:slug', show);
```

**POST with request body (no auth):**
```js
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new customer account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', validate(registerSchema), register);
```

**Protected route (Bearer required):**
```js
/**
 * @openapi
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get the authenticated user's cart
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart with items
 *       401:
 *         description: No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', verifyToken, show);
```

All protected routes include `security: [{ BearerAuth: [] }]`. All routes include relevant error responses (400/401/403/404/409).

### Tags per file

| File | Tags |
|---|---|
| `src/routes/auth.js` | `Auth` |
| `src/routes/products.js` | `Products` |
| `src/routes/categories.js` | `Categories` |
| `src/routes/cart.js` | `Cart` |
| `src/routes/orders.js` | `Orders` |
| `src/routes/webhooks.js` | `Webhooks` |
| `src/routes/reviews.js` *(future)* | `Reviews` |
| `src/routes/admin/products.js` | `Admin - Products` |
| `src/routes/admin/categories.js` | `Admin - Categories` |
| `src/routes/admin/orders.js` | `Admin - Orders` |
| `src/routes/admin/reviews.js` *(future)* | `Admin - Reviews` |

---

## 5. Endpoints Documented

### Auth (4 endpoints)
| Method | Path | Auth |
|---|---|---|
| `POST` | `/api/auth/register` | none |
| `POST` | `/api/auth/login` | none |
| `POST` | `/api/auth/refresh` | none |
| `POST` | `/api/auth/logout` | Bearer |

### Products (2 public + 3 admin)
| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/products` | none |
| `GET` | `/api/products/:slug` | none |
| `POST` | `/api/admin/products` | Bearer + Admin |
| `PUT` | `/api/admin/products/:id` | Bearer + Admin |
| `DELETE` | `/api/admin/products/:id` | Bearer + Admin |

### Categories (3 public + 3 admin)
| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/categories` | none |
| `GET` | `/api/categories/:slug` | none |
| `GET` | `/api/categories/:slug/products` | none |
| `POST` | `/api/admin/categories` | Bearer + Admin |
| `PUT` | `/api/admin/categories/:id` | Bearer + Admin |
| `DELETE` | `/api/admin/categories/:id` | Bearer + Admin |

### Cart (4 endpoints)
| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/cart` | Bearer |
| `POST` | `/api/cart/items` | Bearer |
| `PUT` | `/api/cart/items/:id` | Bearer |
| `DELETE` | `/api/cart/items/:id` | Bearer |

### Orders (3 customer + 1 webhook + 2 admin)
| Method | Path | Auth |
|---|---|---|
| `POST` | `/api/orders/checkout` | Bearer |
| `GET` | `/api/orders` | Bearer |
| `GET` | `/api/orders/:id` | Bearer |
| `POST` | `/api/webhooks/stripe` | Stripe-Signature header |
| `GET` | `/api/admin/orders` | Bearer + Admin |
| `PATCH` | `/api/admin/orders/:id/status` | Bearer + Admin |

### Reviews — coming soon (2 public + 4 admin)
| Method | Path | Auth |
|---|---|---|
| `POST` | `/api/reviews` | Bearer |
| `GET` | `/api/reviews/:productId` | none |
| `GET` | `/api/admin/reviews` | Bearer + Admin |
| `GET` | `/api/admin/reviews/count` | Bearer + Admin |
| `PATCH` | `/api/admin/reviews/:id/status` | Bearer + Admin |
| `DELETE` | `/api/admin/reviews/:id` | Bearer + Admin |

**Total: 31 endpoints** (25 implemented + 6 from review moderation spec)

---

## 6. Files Changed / Created

| File | Action |
|---|---|
| `src/config/swagger.js` | New — swagger-jsdoc options + compiled spec export |
| `src/app.js` | Add `swagger-ui-express` routes |
| `src/routes/auth.js` | Add `@openapi` JSDoc blocks |
| `src/routes/products.js` | Add `@openapi` JSDoc blocks |
| `src/routes/categories.js` | Add `@openapi` JSDoc blocks |
| `src/routes/cart.js` | Add `@openapi` JSDoc blocks |
| `src/routes/orders.js` | Add `@openapi` JSDoc blocks |
| `src/routes/webhooks.js` | Add `@openapi` JSDoc blocks |
| `src/routes/admin/products.js` | Add `@openapi` JSDoc blocks |
| `src/routes/admin/categories.js` | Add `@openapi` JSDoc blocks |
| `src/routes/admin/orders.js` | Add `@openapi` JSDoc blocks |

Review route files (`src/routes/reviews.js`, `src/routes/admin/reviews.js`) will receive annotations when implemented.

---

## 7. Out of Scope

- Authentication on the `/api/docs` UI itself (no HTTP basic auth gate)
- Generating a static HTML export
- Syncing to an external platform (Stoplight, Swagger Hub)
- Response schema validation at runtime
