import { Router } from 'express';
import * as reviewsController from '../controllers/reviews.controller.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createReviewSchema, updateReviewSchema } from '@ceramic/utils';

const router = Router();

router.use(auth);
router.post('/', validate(createReviewSchema), reviewsController.create);
router.patch('/:id', validate(updateReviewSchema), reviewsController.update);
router.delete('/:id', reviewsController.remove);

export default router;
