// src/services/categoryService.js
const db = require('../config/db');

function createError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function getCategories() {
  return db.category.findMany({
    where: { parentId: null },
    include: { children: true },
    orderBy: { name: 'asc' },
  });
}

async function getCategoryBySlug(slug) {
  const category = await db.category.findUnique({ where: { slug }, include: { children: true } });
  if (!category) throw createError(404, 'Category not found');
  return category;
}

async function createCategory(data) {
  return db.category.create({ data });
}

async function updateCategory(id, data) {
  const cat = await db.category.findUnique({ where: { id } });
  if (!cat) throw createError(404, 'Category not found');
  return db.category.update({ where: { id }, data });
}

async function deleteCategory(id) {
  const cat = await db.category.findUnique({ where: { id } });
  if (!cat) throw createError(404, 'Category not found');
  return db.category.delete({ where: { id } });
}

module.exports = { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory };
