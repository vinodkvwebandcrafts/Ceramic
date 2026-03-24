jest.mock('../../../src/config/db');
jest.mock('../../../src/services/stripeService');
jest.mock('../../../src/services/cartService');

const db = require('../../../src/config/db');
const stripeService = require('../../../src/services/stripeService');
const cartService = require('../../../src/services/cartService');
const orderService = require('../../../src/services/orderService');

describe('orderService.createCheckout', () => {
  it('creates payment intent and pending order', async () => {
    const mockCart = {
      items: [{
        quantity: 2,
        variant: { id: 'v1', priceModifier: 0, product: { basePrice: 25 }, stockQty: 10,
                   sku: 'SKU-1', name: 'Small Bowl', attributes: {} }
      }]
    };
    cartService.getCart = jest.fn().mockResolvedValue(mockCart);
    stripeService.createPaymentIntent = jest.fn().mockResolvedValue({
      id: 'pi_123',
      client_secret: 'secret_abc',
    });
    db.order = { create: jest.fn().mockResolvedValue({ id: 'o1', status: 'PENDING' }) };

    const shippingAddress = { line1: '1 Main St', city: 'Portland', zip: '97201', country: 'US' };
    const result = await orderService.createCheckout('u1', shippingAddress);
    expect(stripeService.createPaymentIntent).toHaveBeenCalled();
    expect(db.order.create).toHaveBeenCalled();
    expect(result).toHaveProperty('clientSecret', 'secret_abc');
  });

  it('throws 400 if cart is empty', async () => {
    cartService.getCart = jest.fn().mockResolvedValue({ items: [] });
    await expect(orderService.createCheckout('u1', {})).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('orderService.handleStripeEvent', () => {
  it('updates order to PAID on payment_intent.succeeded', async () => {
    db.order = {
      findUnique: jest.fn().mockResolvedValue({ id: 'o1', status: 'PENDING', stripeEventId: null }),
      update: jest.fn().mockResolvedValue({ id: 'o1', status: 'PAID' }),
    };

    const event = {
      id: 'evt_123',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_123' } },
    };

    await orderService.handleStripeEvent(event);
    expect(db.order.update).toHaveBeenCalledWith({
      where: { stripePaymentIntentId: 'pi_123' },
      data: { status: 'PAID', stripeEventId: 'evt_123' },
    });
  });

  it('is idempotent — skips if stripeEventId already processed', async () => {
    db.order = {
      findUnique: jest.fn().mockResolvedValue({ id: 'o1', status: 'PAID', stripeEventId: 'evt_123' }),
      update: jest.fn(),
    };

    const event = {
      id: 'evt_123',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_123' } },
    };

    await orderService.handleStripeEvent(event);
    expect(db.order.update).not.toHaveBeenCalled();
  });

  it('ignores unhandled event types', async () => {
    db.order = { findUnique: jest.fn(), update: jest.fn() };
    const event = { id: 'evt_456', type: 'customer.created', data: { object: {} } };
    await orderService.handleStripeEvent(event);
    expect(db.order.update).not.toHaveBeenCalled();
  });
});
