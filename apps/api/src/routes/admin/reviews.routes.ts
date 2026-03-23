import { Router } from 'express';
import * as reviewsController from '../../controllers/reviews.controller.js';
import { auth } from '../../middleware/auth.js';
import { admin } from '../../middleware/admin.js';

const router = Router();

router.use(auth, admin);
router.get('/', reviewsController.adminList);
router.patch('/:id', reviewsController.moderate);

export default router;
