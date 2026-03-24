jest.mock('../../src/config/db');
jest.mock('../../src/config/stripe');
jest.mock('jsonwebtoken');

const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/db');
const jwt = require('jsonwebtoken');

// Authenticated user helper
const AUTH = 'Bearer valid_token';

beforeEach(() => {
  jwt.verify = jest.fn().mockReturnValue({ userId: 'u1', role: 'CUSTOMER' });
});

describe('GET /api/cart', () => {
  it('returns cart with items for authenticated user', async () => {
    db.cart = {
      findUnique: jest.fn().mockResolvedValue({
        id: 'c1', userId: 'u1',
        items: [
          { id: 'ci1', quantity: 2, variant: { id: 'v1', product: { name: 'Vase', slug: 'vase', images: [] } } },
        ],
      }),
    };

    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body.items).toHaveLength(1);
  });

  it('creates and returns empty cart if user has none', async () => {
    db.cart = {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'c2', userId: 'u1', items: [] }),
    };

    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', AUTH);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(0);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/cart/items', () => {
  it('adds item to cart (201)', async () => {
    db.cart = { upsert: jest.fn().mockResolvedValue({ id: 'c1' }) };
    db.productVariant = { findUnique: jest.fn().mockResolvedValue({ id: 'v1', stockQty: 10 }) };
    db.cartItem = {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'ci1', quantity: 2 }),
    };

    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', AUTH)
      .send({ variantId: 'v1', quantity: 2 });

    expect(res.status).toBe(201);
    expect(res.body.quantity).toBe(2);
  });

  it('returns 400 when quantity exceeds stock', async () => {
    db.cart = { upsert: jest.fn().mockResolvedValue({ id: 'c1' }) };
    db.productVariant = { findUnique: jest.fn().mockResolvedValue({ id: 'v1', stockQty: 1 }) };
    db.cartItem = { findUnique: jest.fn().mockResolvedValue(null) };

    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', AUTH)
      .send({ variantId: 'v1', quantity: 5 });

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid payload (missing variantId)', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', AUTH)
      .send({ quantity: 2 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('returns 400 for quantity 0', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', AUTH)
      .send({ variantId: 'v1', quantity: 0 });

    expect(res.status).toBe(400);
  });

  it('increments quantity if item already in cart', async () => {
    db.cart = { upsert: jest.fn().mockResolvedValue({ id: 'c1' }) };
    db.productVariant = { findUnique: jest.fn().mockResolvedValue({ id: 'v1', stockQty: 10 }) };
    db.cartItem = {
      findUnique: jest.fn().mockResolvedValue({ id: 'ci1', quantity: 1 }),
      update: jest.fn().mockResolvedValue({ id: 'ci1', quantity: 3 }),
    };

    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', AUTH)
      .send({ variantId: 'v1', quantity: 2 });

    expect(res.status).toBe(201);
    expect(db.cartItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { quantity: 3 } })
    );
  });
});

describe('PUT /api/cart/items/:id', () => {
  it('updates item quantity', async () => {
    db.cartItem = {
      findFirst: jest.fn().mockResolvedValue({ id: 'ci1', quantity: 1, variant: { stockQty: 10 } }),
      update: jest.fn().mockResolvedValue({ id: 'ci1', quantity: 4 }),
    };

    const res = await request(app)
      .put('/api/cart/items/ci1')
      .set('Authorization', AUTH)
      .send({ quantity: 4 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(4);
  });

  it('returns 404 for item not in user cart', async () => {
    db.cartItem = { findFirst: jest.fn().mockResolvedValue(null) };

    const res = await request(app)
      .put('/api/cart/items/bad-id')
      .set('Authorization', AUTH)
      .send({ quantity: 2 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/cart/items/:id', () => {
  it('removes item from cart (204)', async () => {
    db.cartItem = {
      findFirst: jest.fn().mockResolvedValue({ id: 'ci1' }),
      delete: jest.fn(),
    };

    const res = await request(app)
      .delete('/api/cart/items/ci1')
      .set('Authorization', AUTH);

    expect(res.status).toBe(204);
  });

  it('returns 404 for item not found', async () => {
    db.cartItem = { findFirst: jest.fn().mockResolvedValue(null) };

    const res = await request(app)
      .delete('/api/cart/items/bad-id')
      .set('Authorization', AUTH);

    expect(res.status).toBe(404);
  });
});
