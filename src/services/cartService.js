// src/services/cartService.js
const db = require('../config/db');

function createError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function getCart(userId) {
  let cart = await db.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          variant: { include: { product: { select: { name: true, slug: true, images: true } } } },
        },
      },
    },
  });
  if (!cart) {
    cart = await db.cart.create({
      data: { userId, items: { create: [] } },
      include: { items: true },
    });
  }
  return cart;
}

async function addItem(userId, variantId, quantity) {
  const cart = await db.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const variant = await db.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) throw createError(404, 'Variant not found');

  const existing = await db.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  });

  const newQty = (existing?.quantity || 0) + quantity;
  if (newQty > variant.stockQty) throw createError(400, 'Insufficient stock');

  if (existing) {
    return db.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } });
  }
  return db.cartItem.create({ data: { cartId: cart.id, variantId, quantity } });
}

async function updateItem(userId, itemId, quantity) {
  const item = await db.cartItem.findFirst({
    where: { id: itemId, cart: { userId } },
    include: { variant: true },
  });
  if (!item) throw createError(404, 'Cart item not found');
  if (quantity > item.variant.stockQty) throw createError(400, 'Insufficient stock');
  return db.cartItem.update({ where: { id: itemId }, data: { quantity } });
}

async function removeItem(userId, itemId) {
  const item = await db.cartItem.findFirst({ where: { id: itemId, cart: { userId } } });
  if (!item) throw createError(404, 'Cart item not found');
  return db.cartItem.delete({ where: { id: itemId } });
}

async function clearCart(userId) {
  const cart = await db.cart.findUnique({ where: { userId } });
  if (cart) {
    await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
