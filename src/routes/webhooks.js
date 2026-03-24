// src/routes/webhooks.js
const router = require('express').Router();
const { handleStripe } = require('../controllers/webhookController');

/**
 * @openapi
 * /api/webhooks/stripe:
 *   post:
 *     tags: [Webhooks]
 *     summary: Stripe webhook receiver (idempotent)
 *     description: >
 *       Receives Stripe events. Requires a valid Stripe-Signature header.
 *       Raw body must be forwarded unchanged (configured in app.js).
 *       On payment_intent.succeeded, updates the matching order to PAID.
 *       Duplicate events (same stripeEventId) are safely ignored.
 *     parameters:
 *       - in: header
 *         name: Stripe-Signature
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Event received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received: { type: boolean, example: true }
 *       400:
 *         description: Invalid Stripe signature
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Note: raw body middleware is applied in app.js BEFORE json middleware
router.post('/stripe', handleStripe);

module.exports = router;
