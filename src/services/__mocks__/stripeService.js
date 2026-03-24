// Manual mock for stripeService — prevents Stripe SDK from loading with undefined key
module.exports = {
  createPaymentIntent: jest.fn(),
  constructEvent: jest.fn(),
};
