// src/validators/orderValidator.js
const Joi = require('joi');

const checkoutSchema = Joi.object({
  shippingAddress: Joi.object({
    line1: Joi.string().required(),
    line2: Joi.string().optional(),
    city: Joi.string().required(),
    state: Joi.string().optional(),
    zip: Joi.string().required(),
    country: Joi.string().length(2).required(),
  }).required(),
});

module.exports = { checkoutSchema };
