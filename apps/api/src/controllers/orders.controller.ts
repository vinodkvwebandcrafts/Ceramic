import { Request, Response, NextFunction } from 'express';
import * as ordersService from '../services/orders.service.js';

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await ordersService.createOrder(req.user!.userId, req.body.addressId);
    res.status(201).json({ success: true, data: order });
  } catch (err) { next(err); }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ordersService.getOrders(req.user!.userId, req.query as any);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function getDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await ordersService.getOrderDetail(req.params.id, req.user!.userId);
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
}

export async function adminList(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ordersService.getAllOrders(req.query as any);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await ordersService.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
}
