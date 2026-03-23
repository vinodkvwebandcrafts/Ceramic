import { Router } from 'express';
import * as productsController from '../../controllers/products.controller.js';
import { auth } from '../../middleware/auth.js';
import { admin } from '../../middleware/admin.js';
import { validate } from '../../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '@ceramic/utils';

const router = Router();

router.use(auth, admin);
router.get('/', productsController.list);
router.post('/', validate(createProductSchema), productsController.create);
router.patch('/:id', validate(updateProductSchema), productsController.update);
router.delete('/:id', productsController.remove);

export default router;
