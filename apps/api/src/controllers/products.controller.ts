import { Request, Response, NextFunction } from 'express';
import * as productsService from '../services/products.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await productsService.findAll(req.query as any);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productsService.findBySlug(req.params.slug);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productsService.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productsService.update(req.params.id, req.body);
    res.json({ success: true, data: product });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await productsService.remove(req.params.id);
    res.json({ success: true, data: null });
  } catch (err) { next(err); }
}
