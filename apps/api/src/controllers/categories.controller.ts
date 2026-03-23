import { Request, Response, NextFunction } from 'express';
import * as categoriesService from '../services/categories.service.js';

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await categoriesService.findAll();
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
}

export async function getBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoriesService.findBySlug(req.params.slug);
    res.json({ success: true, data: category });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoriesService.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoriesService.update(req.params.id, req.body);
    res.json({ success: true, data: category });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await categoriesService.remove(req.params.id);
    res.json({ success: true, data: null });
  } catch (err) { next(err); }
}
