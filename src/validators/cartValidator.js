// src/validators/cartValidator.js
const Joi = require('joi');

const addItemSchema = Joi.object({
  variantId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
});

const updateItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

module.exports = { addItemSchema, updateItemSchema };
