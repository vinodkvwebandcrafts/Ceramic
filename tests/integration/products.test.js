jest.mock('../../src/config/db');
jest.mock('../../src/config/stripe');
jest.mock('jsonwebtoken');

const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/config/db');

const mockProducts = [
  { id: 'p1', name: 'Handmade Clay Vase', slug: 'handmade-clay-vase', basePrice: '49.99',
    status: 'ACTIVE', variants: [{ id: 'v1', sku: 'VASE_001', stockQty: 12 }],
    category: { name: 'Vases', slug: 'vases' } },
  { id: 'p2', name: 'Speckled Ceramic Mug', slug: 'speckled-ceramic-mug', basePrice: '22.00',
    status: 'ACTIVE', variants: [{ id: 'v2', sku: 'MUG_001', stockQty: 30 }],
    category: { name: 'Mugs & Cups', slug: 'mugs-and-cups' } },
];

describe('GET /api/products', () => {
  it('returns paginated product list', async () => {
    db.product = {
      findMany: jest.fn().mockResolvedValue(mockProducts),
      count: jest.fn().mockResolvedValue(2),
    };

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('products');
    expect(res.body).toHaveProperty('total', 2);
    expect(res.body).toHaveProperty('page', 1);
    expect(res.body.products).toHaveLength(2);
  });

  it('filters by categoryId query param', async () => {
    db.product = {
      findMany: jest.fn().mockResolvedValue([mockProducts[0]]),
      count: jest.fn().mockResolvedValue(1),
    };

    const res = await request(app).get('/api/products?categoryId=c1');

    expect(res.status).toBe(200);
    expect(db.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ categoryId: 'c1' }) })
    );
  });

  it('supports page and limit params', async () => {
    db.product = {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    };

    const res = await request(app).get('/api/products?page=2&limit=5');

    expect(res.status).toBe(200);
    expect(db.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });
});

describe('GET /api/products/:slug', () => {
  it('returns product by slug', async () => {
    db.product = { findUnique: jest.fn().mockResolvedValue(mockProducts[0]) };

    const res = await request(app).get('/api/products/handmade-clay-vase');

    expect(res.status).toBe(200);
    expect(res.body.slug).toBe('handmade-clay-vase');
    expect(res.body).toHaveProperty('variants');
  });

  it('returns 404 for unknown slug', async () => {
    db.product = { findUnique: jest.fn().mockResolvedValue(null) };

    const res = await request(app).get('/api/products/no-such-product');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Product not found');
  });
});

describe('GET /api/categories', () => {
  it('returns all top-level categories', async () => {
    db.category = {
      findMany: jest.fn().mockResolvedValue([
        { id: 'c1', name: 'Vases', slug: 'vases', children: [] },
        { id: 'c2', name: 'Bowls', slug: 'bowls', children: [] },
      ]),
    };

    const res = await request(app).get('/api/categories');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('slug', 'vases');
  });
});

describe('GET /api/categories/:slug', () => {
  it('returns category by slug', async () => {
    db.category = {
      findUnique: jest.fn().mockResolvedValue({ id: 'c1', name: 'Vases', slug: 'vases', children: [] }),
    };

    const res = await request(app).get('/api/categories/vases');

    expect(res.status).toBe(200);
    expect(res.body.slug).toBe('vases');
  });

  it('returns 404 for unknown category', async () => {
    db.category = { findUnique: jest.fn().mockResolvedValue(null) };

    const res = await request(app).get('/api/categories/no-such-cat');

    expect(res.status).toBe(404);
  });
});

describe('Admin product routes', () => {
  const adminToken = 'admin_bearer_token';

  beforeEach(() => {
    const jwt = require('jsonwebtoken');
    jwt.verify = jest.fn().mockReturnValue({ userId: 'admin1', role: 'ADMIN' });
  });

  it('POST /api/admin/products — creates product (admin)', async () => {
    db.product = {
      create: jest.fn().mockResolvedValue({ id: 'p3', name: 'New Vase', slug: 'new-vase' }),
    };

    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New Vase', slug: 'newvase', categoryId: 'c1', basePrice: 55.00 });

    expect(res.status).toBe(201);
  });

  it('POST /api/admin/products — returns 403 for non-admin', async () => {
    const jwt = require('jsonwebtoken');
    jwt.verify = jest.fn().mockReturnValue({ userId: 'u1', role: 'CUSTOMER' });

    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New Vase', slug: 'newvase', categoryId: 'c1', basePrice: 55.00 });

    expect(res.status).toBe(403);
  });

  it('PUT /api/admin/products/:id — updates product', async () => {
    db.product = {
      findUnique: jest.fn().mockResolvedValue({ id: 'p1' }),
      update: jest.fn().mockResolvedValue({ id: 'p1', name: 'Updated Vase' }),
    };

    const res = await request(app)
      .put('/api/admin/products/p1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Vase' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Vase');
  });

  it('DELETE /api/admin/products/:id — deletes product', async () => {
    db.product = {
      findUnique: jest.fn().mockResolvedValue({ id: 'p1' }),
      delete: jest.fn().mockResolvedValue({ id: 'p1' }),
    };

    const res = await request(app)
      .delete('/api/admin/products/p1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });
});
