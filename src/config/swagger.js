// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ceramic E-Commerce API',
      version: '1.0.0',
      description: 'REST API for the Ceramic shop backend.',
    },
    servers: [{ url: process.env.API_URL || 'http://localhost:4000' }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Validation failed' },
            details: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    tags: [
      { name: 'Auth' },
      { name: 'Products' },
      { name: 'Categories' },
      { name: 'Cart' },
      { name: 'Orders' },
      { name: 'Webhooks' },
      { name: 'Reviews' },
      { name: 'Admin - Products' },
      { name: 'Admin - Categories' },
      { name: 'Admin - Orders' },
      { name: 'Admin - Reviews' },
    ],
  },
  // Forward-slash glob works cross-platform — swagger-jsdoc normalises paths internally.
  apis: ['./src/routes/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
