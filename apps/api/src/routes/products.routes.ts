import { Router } from 'express';
import * as productsController from '../controllers/products.controller.js';
import * as reviewsController from '../controllers/reviews.controller.js';
import { validate } from '../middleware/validate.js';
import { productFiltersSchema } from '@ceramic/utils';

const router = Router();

router.get('/', validate(productFiltersSchema, 'query'), productsController.list);
router.get('/:slug', productsController.getBySlug);
router.get('/:slug/reviews', reviewsController.listByProduct);

export default router;
