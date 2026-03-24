// src/controllers/productController.js
const productService = require('../services/productService');

async function list(req, res, next) {
  try {
    const { page = 1, limit = 20, categoryId, minPrice, maxPrice } = req.query;
    const result = await productService.getProducts({
      page: Number(page), limit: Number(limit), categoryId, minPrice, maxPrice,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const product = await productService.getProduct(req.params.slug);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, show, create, update, destroy };
