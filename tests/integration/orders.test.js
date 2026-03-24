jest.mock('../../src/config/db');
jest.mock('../../src/services/stripeService');
jest.mock('../../src/services/cartService');
jest.mock('jsonwebtoken');

const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/db');
const stripeService = require('../../src/services/stripeService');
const cartService = require('../../src/services/cartService');
const jwt = require('jsonwebtoken');

const AUTH = 'Bearer valid_token';
const SHIPPING = {
  line1: '123 Main St',
  city: 'Portland',
  zip: '97201',
  country: 'US',
};

beforeEach(() => {
  jwt.verify = jest.fn().mockReturnValue({ userId: 'u1', role: 'CUSTOMER' });
});

describe('POST /api/orders/checkout', () => {
  it('creates checkout and returns clientSecret + orderId', async () => {
    cartService.getCart = jest.fn().mockResolvedValue({
      items: [{
        quantity: 1,
        variant: { id: 'v1', priceModifier: 0, product: { basePrice: 50 },
                   sku: 'SKU1', name: 'Vase', attributes: {} },
      }],
    });
    stripeService.createPaymentIntent = jest.fn().mockResolvedValue({
      id: 'pi_test123',
      client_secret: 'pi_test123_secret',
    });
    db.order = {
      create: jest.fn().mockResolvedValue({ id: 'ord1', status: 'PENDING' }),
    };

    const res = await request(app)
      .post('/api/orders/checkout')
      .set('Authorization', AUTH)
      .send({ shippingAddress: SHIPPING });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('clientSecret', 'pi_test123_secret');
    expect(res.body).toHaveProperty('orderId', 'ord1');
    expect(res.body).toHaveProperty('total');
  });

  it('returns 400 when cart is empty', async () => {
    cartService.getCart = jest.fn().mockResolvedValue({ items: [] });

    const res = await request(app)
      .post('/api/orders/checkout')
      .set('Authorization', AUTH)
      .send({ shippingAddress: SHIPPING });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Cart is empty');
  });

  it('returns 400 for invalid shipping address', async () => {
    const res = await request(app)
      .post('/api/orders/checkout')
      .set('Authorization', AUTH)
      .send({ shippingAddress: { city: 'Portland' } }); // missing line1, zip, country

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/orders/checkout')
      .send({ shippingAddress: SHIPPING });

    expect(res.status).toBe(401);
  });

  it('computes free shipping for orders >= $75', async () => {
    cartService.getCart = jest.fn().mockResolvedValue({
      items: [{
        quantity: 2,
        variant: { id: 'v1', priceModifier: 0, product: { basePrice: 50 },
                   sku: 'SKU1', name: 'Vase', attributes: {} },
      }],
    });
    stripeService.createPaymentIntent = jest.fn().mockResolvedValue({ id: 'pi_2', client_secret: 'sec_2' });
    db.order = { create: jest.fn().mockResolvedValue({ id: 'ord2' }) };

    const res = await request(app)
      .post('/api/orders/checkout')
      .set('Authorization', AUTH)
      .send({ shippingAddress: SHIPPING });

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(100); // 2 × $50, free shipping
    expect(stripeService.createPaymentIntent).toHaveBeenCalledWith(10000, 'usd', { userId: 'u1' });
  });
});

describe('GET /api/orders', () => {
  it('returns list of user orders', async () => {
    db.order = {
      findMany: jest.fn().mockResolvedValue([
        { id: 'ord1', status: 'PAID', total: '50.00', items: [] },
      ]),
    };

    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', AUTH);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty('status', 'PAID');
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/orders/:id', () => {
  it('returns a specific order', async () => {
    db.order = {
      findFirst: jest.fn().mockResolvedValue({ id: 'ord1', status: 'PAID', items: [] }),
    };

    const res = await request(app)
      .get('/api/orders/ord1')
      .set('Authorization', AUTH);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('ord1');
  });

  it('returns 404 for order not belonging to user', async () => {
    db.order = { findFirst: jest.fn().mockResolvedValue(null) };

    const res = await request(app)
      .get('/api/orders/other-order')
      .set('Authorization', AUTH);

    expect(res.status).toBe(404);
  });
});

describe('POST /api/webhooks/stripe', () => {
  it('handles payment_intent.succeeded and returns received:true', async () => {
    const event = {
      id: 'evt_001',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test123' } },
    };
    stripeService.constructEvent = jest.fn().mockReturnValue(event);
    db.order = {
      findUnique: jest.fn().mockResolvedValue({ id: 'ord1', status: 'PENDING', stripeEventId: null }),
      update: jest.fn().mockResolvedValue({ id: 'ord1', status: 'PAID' }),
    };

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 'sig_test')
      .send(JSON.stringify(event));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('received', true);
  });

  it('is idempotent — does not double-process same event', async () => {
    const event = {
      id: 'evt_001',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test123' } },
    };
    stripeService.constructEvent = jest.fn().mockReturnValue(event);
    // Order already has this stripeEventId
    db.order = {
      findUnique: jest.fn().mockResolvedValue({ id: 'ord1', status: 'PAID', stripeEventId: 'evt_001' }),
      update: jest.fn(),
    };

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 'sig_test')
      .send(JSON.stringify(event));

    expect(res.status).toBe(200);
    expect(db.order.update).not.toHaveBeenCalled(); // no duplicate update
  });

  it('returns 400 for invalid Stripe signature', async () => {
    stripeService.constructEvent = jest.fn().mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature');
    });

    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', 'bad_sig')
      .send('bad_payload');

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Webhook error');
  });
});

describe('Admin order routes', () => {
  beforeEach(() => {
    jwt.verify = jest.fn().mockReturnValue({ userId: 'admin1', role: 'ADMIN' });
  });

  it('GET /api/admin/orders — returns all orders for admin', async () => {
    db.order = {
      findMany: jest.fn().mockResolvedValue([
        { id: 'ord1', status: 'PAID', user: { email: 'a@b.com' }, items: [] },
        { id: 'ord2', status: 'PENDING', user: { email: 'c@d.com' }, items: [] },
      ]),
    };

    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', 'Bearer admin_token');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('PATCH /api/admin/orders/:id/status — updates order status', async () => {
    db.order = {
      findUnique: jest.fn().mockResolvedValue({ id: 'ord1' }),
      update: jest.fn().mockResolvedValue({ id: 'ord1', status: 'SHIPPED' }),
    };

    const res = await request(app)
      .patch('/api/admin/orders/ord1/status')
      .set('Authorization', 'Bearer admin_token')
      .send({ status: 'SHIPPED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('SHIPPED');
  });

  it('GET /api/admin/orders — returns 403 for customer', async () => {
    jwt.verify = jest.fn().mockReturnValue({ userId: 'u1', role: 'CUSTOMER' });

    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', 'Bearer customer_token');

    expect(res.status).toBe(403);
  });
});
