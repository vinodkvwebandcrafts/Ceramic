import { Request, Response, NextFunction } from 'express';
import { uploadImage } from '../services/upload.service.js';
import { ValidationError } from '../utils/errors.js';

export async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new ValidationError('No file uploaded');
    const result = await uploadImage(req.file.buffer);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}
