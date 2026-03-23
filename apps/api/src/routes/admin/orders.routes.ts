import { Router } from 'express';
import * as ordersController from '../../controllers/orders.controller.js';
import { auth } from '../../middleware/auth.js';
import { admin } from '../../middleware/admin.js';

const router = Router();

router.use(auth, admin);
router.get('/', ordersController.adminList);
router.get('/:id', ordersController.getDetail);
router.patch('/:id/status', ordersController.updateStatus);

export default router;
