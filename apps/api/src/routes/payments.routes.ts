import { Router, raw } from 'express';
import * as paymentsController from '../controllers/payments.controller.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { verifyPaymentSchema } from '@ceramic/utils';

const router = Router();

router.post('/create-order', auth, paymentsController.createOrder);
router.post('/verify', auth, validate(verifyPaymentSchema), paymentsController.verify);
router.post('/webhook', raw({ type: 'application/json' }), paymentsController.webhook);

export default router;
