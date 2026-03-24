jest.mock('../../../src/config/db');
const db = require('../../../src/config/db');
const cartService = require('../../../src/services/cartService');

describe('cartService.getCart', () => {
  it('returns existing cart with items', async () => {
    db.cart = { findUnique: jest.fn().mockResolvedValue({ id: 'c1', items: [] }) };
    const result = await cartService.getCart('u1');
    expect(db.cart.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1' } })
    );
    expect(result).toHaveProperty('items');
  });

  it('creates and returns empty cart if none exists', async () => {
    db.cart = {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'c2', items: [] }),
    };
    const result = await cartService.getCart('u1');
    expect(db.cart.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { userId: 'u1', items: { create: [] } } })
    );
    expect(result).toHaveProperty('id', 'c2');
  });
});

describe('cartService.addItem', () => {
  it('adds new item to cart', async () => {
    db.cart = { upsert: jest.fn().mockResolvedValue({ id: 'c1' }) };
    db.cartItem = {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'ci1', quantity: 2 }),
    };
    db.productVariant = { findUnique: jest.fn().mockResolvedValue({ id: 'v1', stockQty: 10 }) };

    const result = await cartService.addItem('u1', 'v1', 2);
    expect(db.cartItem.create).toHaveBeenCalled();
    expect(result.quantity).toBe(2);
  });

  it('throws 400 if quantity exceeds stock', async () => {
    db.cart = { upsert: jest.fn().mockResolvedValue({ id: 'c1' }) };
    db.cartItem = { findUnique: jest.fn().mockResolvedValue(null) };
    db.productVariant = { findUnique: jest.fn().mockResolvedValue({ id: 'v1', stockQty: 1 }) };

    await expect(cartService.addItem('u1', 'v1', 5)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('increments quantity if item already in cart', async () => {
    db.cart = { upsert: jest.fn().mockResolvedValue({ id: 'c1' }) };
    db.cartItem = {
      findUnique: jest.fn().mockResolvedValue({ id: 'ci1', quantity: 1 }),
      update: jest.fn().mockResolvedValue({ id: 'ci1', quantity: 3 }),
    };
    db.productVariant = { findUnique: jest.fn().mockResolvedValue({ id: 'v1', stockQty: 10 }) };

    const result = await cartService.addItem('u1', 'v1', 2);
    expect(db.cartItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { quantity: 3 } })
    );
  });
});

describe('cartService.removeItem', () => {
  it('deletes cart item', async () => {
    db.cartItem = {
      findFirst: jest.fn().mockResolvedValue({ id: 'ci1', cart: { userId: 'u1' } }),
      delete: jest.fn(),
    };
    await cartService.removeItem('u1', 'ci1');
    expect(db.cartItem.delete).toHaveBeenCalledWith({ where: { id: 'ci1' } });
  });

  it('throws 404 if item not found or belongs to another user', async () => {
    db.cartItem = { findFirst: jest.fn().mockResolvedValue(null) };
    await expect(cartService.removeItem('u1', 'ci1')).rejects.toMatchObject({ statusCode: 404 });
  });
});
