# Swagger API Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add interactive OpenAPI 3.0 documentation to the Ceramic backend, served at `GET /api/docs` (Swagger UI) and `GET /api/docs.json` (raw JSON export).

**Architecture:** `swagger-jsdoc` scans `@openapi` JSDoc blocks in all route files and compiles them into an OpenAPI 3.0 spec at startup. `swagger-ui-express` serves the interactive UI. The config lives in `src/config/swagger.js` — a pure module with no side effects that requires no Jest mocks.

**Tech Stack:** swagger-jsdoc, swagger-ui-express, Express.js 4, OpenAPI 3.0

**Spec:** `docs/superpowers/specs/2026-03-24-swagger-docs-design.md`

---

## File Map

| File | Action |
|---|---|
| `src/config/swagger.js` | **New** — swagger-jsdoc options + compiled spec export |
| `src/app.js` | **Modify** — add swagger-ui-express routes |
| `src/routes/auth.js` | **Modify** — add `@openapi` blocks (4 endpoints) |
| `src/routes/products.js` | **Modify** — add `@openapi` blocks (2 endpoints) |
| `src/routes/categories.js` | **Modify** — add `@openapi` blocks (3 endpoints) |
| `src/routes/cart.js` | **Modify** — add `@openapi` blocks (4 endpoints) |
| `src/routes/orders.js` | **Modify** — add `@openapi` blocks (3 endpoints) |
| `src/routes/webhooks.js` | **Modify** — add `@openapi` block (1 endpoint) |
| `src/routes/admin/products.js` | **Modify** — add `@openapi` blocks (3 endpoints) |
| `src/routes/admin/categories.js` | **Modify** — add `@openapi` blocks (3 endpoints) |
| `src/routes/admin/orders.js` | **Modify** — add `@openapi` blocks (2 endpoints) |

---

## Task 1: Install packages + create swagger config + wire app.js

**Files:**
- Create: `src/config/swagger.js`
- Modify: `src/app.js`

- [ ] **Step 1: Install dependencies**

```bash
cd D:/Github/Ceramic
npm install swagger-jsdoc swagger-ui-express
```

Expected: both packages added to `node_modules` and `package.json` dependencies.

- [ ] **Step 2: Create `src/config/swagger.js`**

```js
// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ceramic E-Commerce API',
      version: '1.0.0',
      description: 'REST API for the Ceramic shop backend.',
    },
    servers: [{ url: process.env.API_URL || 'http://localhost:4000' }],
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
  // Forward-slash glob works cross-platform — swagger-jsdoc normalises paths internally.
  apis: ['./src/routes/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
```

- [ ] **Step 3: Wire swagger into `src/app.js`**

Add these lines at the top of `src/app.js` (with the other requires):

```js
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
```

Add these two lines just before `app.use(errorHandler)`:

```js
// API docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));
```

- [ ] **Step 4: Verify server starts and endpoints respond**

```bash
npm run dev
```

In a second terminal:
```bash
curl http://localhost:4000/api/docs.json | head -c 200
```

Expected: JSON starting with `{"openapi":"3.0.0","info":{"title":"Ceramic E-Commerce API"...}`

```bash
curl -I http://localhost:4000/api/docs
```

Expected: `HTTP/1.1 200 OK`

- [ ] **Step 5: Run full test suite to confirm no regression**

```bash
npm test
```

Expected: 96 tests pass. Zero failures. (swagger config has no side effects, requires no mocks.)

- [ ] **Step 6: Commit**

```bash
git add src/config/swagger.js src/app.js package.json package-lock.json
git commit -m "feat: add swagger-jsdoc config and serve /api/docs + /api/docs.json"
```

---

## Task 2: Annotate Auth routes

**Files:**
- Modify: `src/routes/auth.js`

- [ ] **Step 1: Replace `src/routes/auth.js` with annotated version**

```js
// src/routes/auth.js
const router = require('express').Router();
const { register, login, refresh, logout } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, refreshSchema } = require('../validators/authValidator');

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
 *                 example: customer@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: password123
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     email: { type: string }
 *                     role: { type: string, example: "CUSTOMER" }
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

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in and receive access + refresh tokens
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
 *                 example: customer@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Tokens returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *                 refreshToken: { type: string }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validate(loginSchema), login);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate tokens using a valid refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: New tokens returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *                 refreshToken: { type: string }
 *       401:
 *         description: Invalid or revoked refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refresh', validate(refreshSchema), refresh);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Log out and revoke refresh token
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Logged out }
 *       401:
 *         description: No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', verifyToken, logout);

module.exports = router;
```

- [ ] **Step 2: Verify auth endpoints appear in spec**

```bash
curl -s http://localhost:4000/api/docs.json | node -e "const s=require('fs').readFileSync('/dev/stdin','utf8'); const p=JSON.parse(s); console.log(Object.keys(p.paths).filter(k=>k.includes('auth')))"
```

Expected: `[ '/api/auth/register', '/api/auth/login', '/api/auth/refresh', '/api/auth/logout' ]`

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: 96 passed.

- [ ] **Step 4: Commit**

```bash
git add src/routes/auth.js
git commit -m "docs: add OpenAPI annotations to auth routes"
```

---

## Task 3: Annotate Products + Categories routes

**Files:**
- Modify: `src/routes/products.js`
- Modify: `src/routes/categories.js`

- [ ] **Step 1: Replace `src/routes/products.js`**

```js
// src/routes/products.js
const router = require('express').Router();
const { list, show } = require('../controllers/productController');

/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: List active products (paginated)
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
 *         description: Filter by category ID
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Paginated product list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products: { type: array, items: { type: object } }
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 limit: { type: integer }
 *                 pages: { type: integer }
 */
router.get('/', list);

/**
 * @openapi
 * /api/products/{slug}:
 *   get:
 *     tags: [Products]
 *     summary: Get a single product by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *         example: classic-ramen-bowl
 *     responses:
 *       200:
 *         description: Product with variants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 name: { type: string }
 *                 slug: { type: string }
 *                 basePrice: { type: string }
 *                 variants: { type: array, items: { type: object } }
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:slug', show);

module.exports = router;
```

- [ ] **Step 2: Replace `src/routes/categories.js`**

```js
// src/routes/categories.js
const router = require('express').Router();
const { list, show, listProducts } = require('../controllers/categoryController');

/**
 * @openapi
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all top-level categories with children
 *     responses:
 *       200:
 *         description: Array of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string }
 *                   name: { type: string }
 *                   slug: { type: string }
 *                   children: { type: array, items: { type: object } }
 */
router.get('/', list);

/**
 * @openapi
 * /api/categories/{slug}:
 *   get:
 *     tags: [Categories]
 *     summary: Get a category by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *         example: bowls
 *     responses:
 *       200:
 *         description: Category object
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:slug', show);

/**
 * @openapi
 * /api/categories/{slug}/products:
 *   get:
 *     tags: [Categories]
 *     summary: List products in a category
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated products for this category
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:slug/products', listProducts);

module.exports = router;
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: 96 passed.

- [ ] **Step 4: Commit**

```bash
git add src/routes/products.js src/routes/categories.js
git commit -m "docs: add OpenAPI annotations to products and categories routes"
```

---

## Task 4: Annotate Cart routes

**Files:**
- Modify: `src/routes/cart.js`

- [ ] **Step 1: Replace `src/routes/cart.js`**

```js
// src/routes/cart.js
const router = require('express').Router();
const { show, addItem, updateItem, removeItem } = require('../controllers/cartController');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { addItemSchema, updateItemSchema } = require('../validators/cartValidator');

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 items:
 *                   type: array
 *                   items: { type: object }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', verifyToken, show);

/**
 * @openapi
 * /api/cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: Add a product variant to cart (or increment quantity)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [variantId, quantity]
 *             properties:
 *               variantId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Cart item created or updated
 *       400:
 *         description: Validation error or insufficient stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/items', verifyToken, validate(addItemSchema), addItem);

/**
 * @openapi
 * /api/cart/items/{id}:
 *   put:
 *     tags: [Cart]
 *     summary: Update cart item quantity
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cart item updated
 *       400:
 *         description: Insufficient stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cart item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags: [Cart]
 *     summary: Remove an item from cart
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Item removed
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cart item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/items/:id', verifyToken, validate(updateItemSchema), updateItem);
router.delete('/items/:id', verifyToken, removeItem);

module.exports = router;
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: 96 passed.

- [ ] **Step 3: Commit**

```bash
git add src/routes/cart.js
git commit -m "docs: add OpenAPI annotations to cart routes"
```

---

## Task 5: Annotate Orders + Webhooks routes

**Files:**
- Modify: `src/routes/orders.js`
- Modify: `src/routes/webhooks.js`

- [ ] **Step 1: Replace `src/routes/orders.js`**

```js
// src/routes/orders.js
const router = require('express').Router();
const { createCheckout, list, show } = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { checkoutSchema } = require('../validators/orderValidator');

/**
 * @openapi
 * /api/orders/checkout:
 *   post:
 *     tags: [Orders]
 *     summary: Create a Stripe payment intent and pending order from cart
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shippingAddress]
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 required: [line1, city, zip, country]
 *                 properties:
 *                   line1: { type: string }
 *                   line2: { type: string }
 *                   city: { type: string }
 *                   state: { type: string }
 *                   zip: { type: string }
 *                   country: { type: string, minLength: 2, maxLength: 2, example: US }
 *     responses:
 *       201:
 *         description: Order created, Stripe client secret returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId: { type: string }
 *                 clientSecret: { type: string }
 *                 total: { type: number }
 *       400:
 *         description: Cart empty or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/checkout', verifyToken, validate(checkoutSchema), createCheckout);

/**
 * @openapi
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: List authenticated user's orders
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Array of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { type: object }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', verifyToken, list);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get a specific order (must belong to authenticated user)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order object with items
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', verifyToken, show);

module.exports = router;
```

- [ ] **Step 2: Replace `src/routes/webhooks.js`**

```js
// src/routes/webhooks.js
const router = require('express').Router();
const { handleStripe } = require('../controllers/webhookController');

/**
 * @openapi
 * /api/webhooks/stripe:
 *   post:
 *     tags: [Webhooks]
 *     summary: Stripe webhook receiver (idempotent)
 *     description: >
 *       Receives Stripe events. Requires a valid `Stripe-Signature` header.
 *       Raw body must be forwarded unchanged (configured in app.js).
 *       On `payment_intent.succeeded`, updates the matching order to PAID.
 *       Duplicate events (same `stripeEventId`) are safely ignored.
 *     parameters:
 *       - in: header
 *         name: Stripe-Signature
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received: { type: boolean, example: true }
 *       400:
 *         description: Invalid Stripe signature
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Note: raw body middleware is applied in app.js BEFORE json middleware
router.post('/stripe', handleStripe);

module.exports = router;
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: 96 passed.

- [ ] **Step 4: Commit**

```bash
git add src/routes/orders.js src/routes/webhooks.js
git commit -m "docs: add OpenAPI annotations to orders and webhooks routes"
```

---

## Task 6: Annotate Admin routes

**Files:**
- Modify: `src/routes/admin/products.js`
- Modify: `src/routes/admin/categories.js`
- Modify: `src/routes/admin/orders.js`

- [ ] **Step 1: Replace `src/routes/admin/products.js`**

```js
// src/routes/admin/products.js
const router = require('express').Router();
const { create, update, destroy } = require('../../controllers/productController');
const { verifyToken } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/admin');
const validate = require('../../middleware/validate');
const { createProductSchema, updateProductSchema } = require('../../validators/productValidator');

/**
 * @openapi
 * /api/admin/products:
 *   post:
 *     tags: [Admin - Products]
 *     summary: Create a new product (admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug, categoryId, basePrice]
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               description: { type: string }
 *               categoryId: { type: string }
 *               basePrice: { type: number }
 *               images: { type: array, items: { type: string } }
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, DRAFT, ARCHIVED]
 *                 default: ACTIVE
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', verifyToken, requireAdmin, validate(createProductSchema), create);

/**
 * @openapi
 * /api/admin/products/{id}:
 *   put:
 *     tags: [Admin - Products]
 *     summary: Update a product (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               categoryId: { type: string }
 *               basePrice: { type: number }
 *               images: { type: array, items: { type: string } }
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, DRAFT, ARCHIVED]
 *     responses:
 *       200:
 *         description: Product updated
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags: [Admin - Products]
 *     summary: Delete a product (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Product deleted
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', verifyToken, requireAdmin, validate(updateProductSchema), update);
router.delete('/:id', verifyToken, requireAdmin, destroy);

module.exports = router;
```

- [ ] **Step 2: Replace `src/routes/admin/categories.js`**

```js
// src/routes/admin/categories.js
const router = require('express').Router();
const { create, update, destroy } = require('../../controllers/categoryController');
const { verifyToken } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/admin');

/**
 * @openapi
 * /api/admin/categories:
 *   post:
 *     tags: [Admin - Categories]
 *     summary: Create a new category (admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               description: { type: string }
 *               parentId: { type: string, description: Parent category ID for nested categories }
 *     responses:
 *       201:
 *         description: Category created
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', verifyToken, requireAdmin, create);

/**
 * @openapi
 * /api/admin/categories/{id}:
 *   put:
 *     tags: [Admin - Categories]
 *     summary: Update a category (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Category updated
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags: [Admin - Categories]
 *     summary: Delete a category (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Category deleted
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', verifyToken, requireAdmin, update);
router.delete('/:id', verifyToken, requireAdmin, destroy);

module.exports = router;
```

- [ ] **Step 3: Replace `src/routes/admin/orders.js`**

```js
// src/routes/admin/orders.js
const router = require('express').Router();
const { verifyToken } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/admin');
const orderService = require('../../services/orderService');

/**
 * @openapi
 * /api/admin/orders:
 *   get:
 *     tags: [Admin - Orders]
 *     summary: List all orders (admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All orders with user and item details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { type: object }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/admin/orders/{id}/status:
 *   patch:
 *     tags: [Admin - Orders]
 *     summary: Update an order's status (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Order status updated
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/status', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: 96 passed.

- [ ] **Step 5: Commit**

```bash
git add src/routes/admin/
git commit -m "docs: add OpenAPI annotations to all admin routes"
```

---

## Task 7: Final verification

- [ ] **Step 1: Verify all 25 endpoints appear in the spec**

```bash
curl -s http://localhost:4000/api/docs.json | node -e "
const s = require('fs').readFileSync('/dev/stdin','utf8');
const p = JSON.parse(s);
const paths = Object.keys(p.paths);
console.log('Total paths:', paths.length);
paths.forEach(p => console.log(' ', p));
"
```

Expected: 25 paths listed covering auth, products, categories, cart, orders, webhooks, and all admin routes.

- [ ] **Step 2: Open Swagger UI in browser**

Navigate to `http://localhost:4000/api/docs`

Expected:
- Title: "Ceramic E-Commerce API"
- Tags visible: Auth, Products, Categories, Cart, Orders, Webhooks, Admin - Products, Admin - Categories, Admin - Orders
- "Authorize" button present (BearerAuth)
- All endpoints expandable with request/response schemas

- [ ] **Step 3: Verify JSON export is importable**

Download `http://localhost:4000/api/docs.json` and import into Postman (File → Import → Raw Text). Expected: all 25 endpoints appear as a collection.

- [ ] **Step 4: Run full test suite one final time**

```bash
npm test
```

Expected: 96 passed, 0 failed.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "docs: complete OpenAPI 3.0 annotations for all 25 endpoints"
```

---

## Verification Checklist

- [ ] `GET /api/docs` returns 200 with Swagger UI HTML
- [ ] `GET /api/docs.json` returns valid OpenAPI 3.0 JSON
- [ ] All 25 endpoints documented with request/response schemas
- [ ] Protected routes show `security: BearerAuth`
- [ ] `$ref: '#/components/schemas/Error'` resolves correctly in the UI
- [ ] 96 tests still pass
