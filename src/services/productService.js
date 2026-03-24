// src/services/productService.js
const db = require('../config/db');

function createError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function getProducts({ categoryId, minPrice, maxPrice, page = 1, limit = 20 } = {}) {
  const where = { status: 'ACTIVE' };
  if (categoryId) where.categoryId = categoryId;
  if (minPrice || maxPrice) {
    where.basePrice = {};
    if (minPrice) where.basePrice.gte = minPrice;
    if (maxPrice) where.basePrice.lte = maxPrice;
  }

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: { variants: true, category: { select: { name: true, slug: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.product.count({ where }),
  ]);

  return { products, total, page, limit, pages: Math.ceil(total / limit) };
}

async function getProduct(slug) {
  const product = await db.product.findUnique({
    where: { slug },
    include: { variants: true, category: { select: { name: true, slug: true } } },
  });
  if (!product) throw createError(404, 'Product not found');
  return product;
}

async function createProduct(data) {
  return db.product.create({ data });
}

async function updateProduct(id, data) {
  const product = await db.product.findUnique({ where: { id } });
  if (!product) throw createError(404, 'Product not found');
  return db.product.update({ where: { id }, data });
}

async function deleteProduct(id) {
  const product = await db.product.findUnique({ where: { id } });
  if (!product) throw createError(404, 'Product not found');
  return db.product.delete({ where: { id } });
}

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
