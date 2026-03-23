import { Router } from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import * as uploadController from '../controllers/upload.controller.js';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@ceramic/utils';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
  },
});

const router = Router();

router.post('/', auth, admin, upload.single('image'), uploadController.upload);

export default router;
