jest.mock('../../../src/config/db');
const db = require('../../../src/config/db');
const productService = require('../../../src/services/productService');

describe('productService.getProducts', () => {
  it('returns products with pagination', async () => {
    db.product = {
      findMany: jest.fn().mockResolvedValue([{ id: 'p1', name: 'Bowl' }]),
      count: jest.fn().mockResolvedValue(1),
    };
    const result = await productService.getProducts({ page: 1, limit: 10 });
    expect(result).toHaveProperty('products');
    expect(result).toHaveProperty('total', 1);
    expect(result).toHaveProperty('page', 1);
  });

  it('filters by categoryId when provided', async () => {
    db.product = { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) };
    await productService.getProducts({ categoryId: 'c1', page: 1, limit: 10 });
    expect(db.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ categoryId: 'c1' }) })
    );
  });
});

describe('productService.getProduct', () => {
  it('returns product by slug', async () => {
    db.product = { findUnique: jest.fn().mockResolvedValue({ id: 'p1', slug: 'bowl' }) };
    const result = await productService.getProduct('bowl');
    expect(result.slug).toBe('bowl');
  });

  it('throws 404 if not found', async () => {
    db.product = { findUnique: jest.fn().mockResolvedValue(null) };
    await expect(productService.getProduct('missing')).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('productService.createProduct', () => {
  it('creates and returns product', async () => {
    db.product = { create: jest.fn().mockResolvedValue({ id: 'p1', name: 'Bowl', slug: 'bowl' }) };
    const data = { name: 'Bowl', slug: 'bowl', categoryId: 'c1', basePrice: 29.99 };
    const result = await productService.createProduct(data);
    expect(result.id).toBe('p1');
  });
});

describe('productService.updateProduct', () => {
  it('updates product by id', async () => {
    db.product = {
      findUnique: jest.fn().mockResolvedValue({ id: 'p1' }),
      update: jest.fn().mockResolvedValue({ id: 'p1', name: 'Updated Bowl' }),
    };
    const result = await productService.updateProduct('p1', { name: 'Updated Bowl' });
    expect(result.name).toBe('Updated Bowl');
  });

  it('throws 404 if product not found', async () => {
    db.product = { findUnique: jest.fn().mockResolvedValue(null) };
    await expect(productService.updateProduct('missing', {})).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('productService.deleteProduct', () => {
  it('deletes product by id', async () => {
    db.product = {
      findUnique: jest.fn().mockResolvedValue({ id: 'p1' }),
      delete: jest.fn().mockResolvedValue({ id: 'p1' }),
    };
    await productService.deleteProduct('p1');
    expect(db.product.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
  });
});
