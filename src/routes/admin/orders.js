// src/routes/admin/orders.js
const router = require('express').Router();
const { verifyToken } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/admin');
const orderService = require('../../services/orderService');

/**
 * @openapi
 * /api/admin/orders:
 *   get:
 *     tags: [Admin - Orders]
 *     summary: List all orders (admin only)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All orders with user and item details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { type: object }
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
router.get('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/admin/orders/{id}/status:
 *   patch:
 *     tags: [Admin - Orders]
 *     summary: Update an order's status (admin only)
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Order status updated
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
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:id/status', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
