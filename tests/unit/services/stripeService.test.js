jest.mock('../../../src/config/stripe');
const stripe = require('../../../src/config/stripe');
const stripeService = require('../../../src/services/stripeService');

describe('stripeService.createPaymentIntent', () => {
  it('calls stripe.paymentIntents.create with correct args', async () => {
    stripe.paymentIntents = {
      create: jest.fn().mockResolvedValue({ id: 'pi_123', client_secret: 'secret_abc' }),
    };
    const result = await stripeService.createPaymentIntent(5000, 'usd', { userId: 'u1' });
    expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
      amount: 5000,
      currency: 'usd',
      metadata: { userId: 'u1' },
    });
    expect(result).toHaveProperty('id', 'pi_123');
  });
});

describe('stripeService.constructEvent', () => {
  it('delegates to stripe.webhooks.constructEvent', () => {
    stripe.webhooks = {
      constructEvent: jest.fn().mockReturnValue({ type: 'payment_intent.succeeded' }),
    };
    const result = stripeService.constructEvent('payload', 'sig', 'secret');
    expect(stripe.webhooks.constructEvent).toHaveBeenCalledWith('payload', 'sig', 'secret');
    expect(result.type).toBe('payment_intent.succeeded');
  });

  it('propagates error when signature is invalid', () => {
    stripe.webhooks = {
      constructEvent: jest.fn().mockImplementation(() => { throw new Error('Invalid signature'); }),
    };
    expect(() => stripeService.constructEvent('bad', 'bad', 'secret')).toThrow('Invalid signature');
  });
});
