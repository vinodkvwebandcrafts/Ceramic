// src/routes/admin/products.js
const router = require('express').Router();
const { create, update, destroy } = require('../../controllers/productController');
const { verifyToken } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/admin');
const validate = require('../../middleware/validate');
const { createProductSchema, updateProductSchema } = require('../../validators/productValidator');

/**
 * @openapi
 * /api/admin/products:
 *   post:
 *     tags: [Admin - Products]
 *     summary: Create a new product (admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug, categoryId, basePrice]
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               description: { type: string }
 *               categoryId: { type: string }
 *               basePrice: { type: number }
 *               images: { type: array, items: { type: string } }
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, DRAFT, ARCHIVED]
 *                 default: ACTIVE
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', verifyToken, requireAdmin, validate(createProductSchema), create);

/**
 * @openapi
 * /api/admin/products/{id}:
 *   put:
 *     tags: [Admin - Products]
 *     summary: Update a product (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               categoryId: { type: string }
 *               basePrice: { type: number }
 *               images: { type: array, items: { type: string } }
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, DRAFT, ARCHIVED]
 *     responses:
 *       200:
 *         description: Product updated
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags: [Admin - Products]
 *     summary: Delete a product (admin only)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Product deleted
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', verifyToken, requireAdmin, validate(updateProductSchema), update);
router.delete('/:id', verifyToken, requireAdmin, destroy);

module.exports = router;
