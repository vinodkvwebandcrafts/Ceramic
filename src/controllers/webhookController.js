// src/controllers/webhookController.js
const stripeService = require('../services/stripeService');
const orderService = require('../services/orderService');

async function handleStripe(req, res, next) {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripeService.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  try {
    await orderService.handleStripeEvent(event);
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { handleStripe };
