import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors.js';

export function admin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return next(new ForbiddenError('Admin access required'));
  }
  next();
}
