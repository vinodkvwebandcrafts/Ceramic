// src/controllers/categoryController.js
const categoryService = require('../services/categoryService');
const productService = require('../services/productService');

async function list(req, res, next) {
  try {
    const categories = await categoryService.getCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

async function show(req, res, next) {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    res.json(category);
  } catch (err) {
    next(err);
  }
}

async function listProducts(req, res, next) {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    const { page = 1, limit = 20 } = req.query;
    const result = await productService.getProducts({
      categoryId: category.id, page: Number(page), limit: Number(limit),
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.json(category);
  } catch (err) {
    next(err);
  }
}

async function destroy(req, res, next) {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, show, listProducts, create, update, destroy };
