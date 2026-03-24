// src/services/orderService.js
const db = require('../config/db');
const stripeService = require('./stripeService');
const cartService = require('./cartService');

function createError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function createCheckout(userId, shippingAddress) {
  const cart = await cartService.getCart(userId);
  if (!cart.items.length) throw createError(400, 'Cart is empty');

  const subtotal = cart.items.reduce((sum, item) => {
    const price = Number(item.variant.product.basePrice) + Number(item.variant.priceModifier);
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal >= 75 ? 0 : 9.99;
  const total = subtotal + shipping;
  const amountInCents = Math.round(total * 100);

  const paymentIntent = await stripeService.createPaymentIntent(amountInCents, 'usd', { userId });

  const order = await db.order.create({
    data: {
      userId,
      status: 'PENDING',
      stripePaymentIntentId: paymentIntent.id,
      subtotal,
      shipping,
      total,
      shippingAddress,
      items: {
        create: cart.items.map((item) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
          unitPrice: Number(item.variant.product.basePrice) + Number(item.variant.priceModifier),
          variantSnapshot: {
            sku: item.variant.sku,
            name: item.variant.name,
            attributes: item.variant.attributes,
          },
        })),
      },
    },
  });

  return { orderId: order.id, clientSecret: paymentIntent.client_secret, total };
}

async function handleStripeEvent(event) {
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const order = await db.order.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    });
    // Idempotency: skip if already processed this exact event
    if (!order || order.stripeEventId === event.id) return;

    await db.order.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: 'PAID', stripeEventId: event.id },
    });
  }
}

async function getOrders(userId) {
  return db.order.findMany({
    where: { userId },
    include: { items: { include: { variant: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function getOrder(userId, orderId) {
  const order = await db.order.findFirst({
    where: { id: orderId, userId },
    include: { items: { include: { variant: true } } },
  });
  if (!order) throw createError(404, 'Order not found');
  return order;
}

async function getAllOrders() {
  return db.order.findMany({
    include: {
      user: { select: { email: true } },
      items: { include: { variant: { select: { sku: true, name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function updateOrderStatus(orderId, status) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw createError(404, 'Order not found');
  return db.order.update({ where: { id: orderId }, data: { status } });
}

module.exports = { createCheckout, handleStripeEvent, getOrders, getOrder, getAllOrders, updateOrderStatus };
