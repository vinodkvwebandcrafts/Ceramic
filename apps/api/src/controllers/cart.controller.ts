import { Request, Response, NextFunction } from 'express';
import * as cartService from '../services/cart.service.js';

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.getCart(req.user!.userId);
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
}

export async function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.addItem(req.user!.userId, req.body.variantId, req.body.quantity);
    res.status(201).json({ success: true, data: cart });
  } catch (err) { next(err); }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.updateItem(req.user!.userId, req.params.id, req.body.quantity);
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
}

export async function removeItem(req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartService.removeItem(req.user!.userId, req.params.id);
    res.json({ success: true, data: cart });
  } catch (err) { next(err); }
}

export async function clearCart(req: Request, res: Response, next: NextFunction) {
  try {
    await cartService.clearCart(req.user!.userId);
    res.json({ success: true, data: null });
  } catch (err) { next(err); }
}
