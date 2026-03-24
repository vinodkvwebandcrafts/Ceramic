// src/controllers/cartController.js
const cartService = require('../services/cartService');

async function show(req, res, next) {
  try {
    const cart = await cartService.getCart(req.user.userId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

async function addItem(req, res, next) {
  try {
    const item = await cartService.addItem(req.user.userId, req.body.variantId, req.body.quantity);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const item = await cartService.updateItem(req.user.userId, req.params.id, req.body.quantity);
    res.json(item);
  } catch (err) {
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    await cartService.removeItem(req.user.userId, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { show, addItem, updateItem, removeItem };
