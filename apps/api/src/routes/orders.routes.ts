import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema } from '@ceramic/utils';

const router = Router();

router.use(auth);
router.post('/', validate(createOrderSchema), ordersController.create);
router.get('/', ordersController.list);
router.get('/:id', ordersController.getDetail);

export default router;
