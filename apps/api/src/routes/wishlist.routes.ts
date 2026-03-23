import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.use(auth);
router.get('/', wishlistController.list);
router.post('/', wishlistController.add);
router.delete('/:productId', wishlistController.remove);

export default router;
