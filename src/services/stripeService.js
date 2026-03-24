// src/services/stripeService.js
const stripe = require('../config/stripe');

async function createPaymentIntent(amount, currency = 'usd', metadata = {}) {
  return stripe.paymentIntents.create({ amount, currency, metadata });
}

function constructEvent(payload, sig, secret) {
  return stripe.webhooks.constructEvent(payload, sig, secret);
}

module.exports = { createPaymentIntent, constructEvent };
