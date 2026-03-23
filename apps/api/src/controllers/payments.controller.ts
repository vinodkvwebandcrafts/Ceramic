import { Request, Response, NextFunction } from 'express';
import * as paymentService from '../services/payment.service.js';

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.createRazorpayOrder(req.body.orderId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function verify(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.verifyPayment(req.body.razorpay_order_id, req.body.razorpay_payment_id, req.body.razorpay_signature);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function webhook(req: Request, res: Response, next: NextFunction) {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    await paymentService.handleWebhook(req.body as Buffer, signature);
    res.json({ success: true, data: null });
  } catch (err) { next(err); }
}
