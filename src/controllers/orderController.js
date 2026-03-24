// src/controllers/orderController.js
const orderService = require('../services/orderService');

async function createCheckout(req, res, next) {
  try {
    const result = await orderService.createCheckout(req.user.userId, req.body.shippingAddress);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const orders = await orderService.getOrders(req.user.userId);
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const order = await orderService.getOrder(req.user.userId, req.params.id);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = { createCheckout, list, show };
