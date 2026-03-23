import { Request, Response, NextFunction } from 'express';
import * as reviewsService from '../services/reviews.service.js';

export async function listByProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reviewsService.findByProduct(req.params.slug, req.query as any);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const review = await reviewsService.create(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const review = await reviewsService.update(req.params.id, req.user!.userId, req.body);
    res.json({ success: true, data: review });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await reviewsService.remove(req.params.id, req.user!.userId);
    res.json({ success: true, data: null });
  } catch (err) { next(err); }
}

export async function adminList(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reviewsService.findAllAdmin(req.query as any);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function moderate(req: Request, res: Response, next: NextFunction) {
  try {
    const review = await reviewsService.moderate(req.params.id, req.body.isApproved);
    res.json({ success: true, data: review });
  } catch (err) { next(err); }
}
