import { Request, Response, NextFunction } from 'express';
import * as wishlistService from '../services/wishlist.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await wishlistService.getWishlist(req.user!.userId);
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
}

export async function add(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await wishlistService.addItem(req.user!.userId, req.body.productId);
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await wishlistService.removeItem(req.user!.userId, req.params.productId);
    res.json({ success: true, data: null });
  } catch (err) { next(err); }
}
