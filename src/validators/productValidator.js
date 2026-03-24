// src/validators/productValidator.js
const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  slug: Joi.string().min(2).max(200).required(),
  description: Joi.string().optional(),
  categoryId: Joi.string().required(),
  basePrice: Joi.number().positive().required(),
  images: Joi.array().items(Joi.string()).default([]),
  status: Joi.string().valid('ACTIVE', 'DRAFT', 'ARCHIVED').default('ACTIVE'),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(2).max(200),
  description: Joi.string(),
  categoryId: Joi.string(),
  basePrice: Joi.number().positive(),
  images: Joi.array().items(Joi.string()),
  status: Joi.string().valid('ACTIVE', 'DRAFT', 'ARCHIVED'),
}).min(1);

module.exports = { createProductSchema, updateProductSchema };
