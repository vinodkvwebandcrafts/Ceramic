import { Router } from 'express';
import * as categoriesController from '../../controllers/categories.controller.js';
import { auth } from '../../middleware/auth.js';
import { admin } from '../../middleware/admin.js';
import { validate } from '../../middleware/validate.js';
import { createCategorySchema } from '@ceramic/utils';

const router = Router();

router.use(auth, admin);
router.post('/', validate(createCategorySchema), categoriesController.create);
router.patch('/:id', categoriesController.update);
router.delete('/:id', categoriesController.remove);

export default router;
