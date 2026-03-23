import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { razorpayInstance } from '../config/razorpay.js';
import { env } from '../config/env.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export async function createRazorpayOrder(orderId: string) {
  if (!razorpayInstance) throw new ValidationError('Payment gateway not configured');

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError('Order not found');
  if (order.razorpayOrderId) return { orderId: order.id, razorpayOrderId: order.razorpayOrderId, amount: order.total, currency: 'INR', keyId: env.RAZORPAY_KEY_ID! };

  const rzpOrder = await razorpayInstance.orders.create({
    amount: order.total,
    currency: 'INR',
    receipt: order.orderNumber,
  });

  await prisma.order.update({ where: { id: orderId }, data: { razorpayOrderId: rzpOrder.id } });

  return {
    orderId: order.id,
    razorpayOrderId: rzpOrder.id,
    amount: order.total,
    currency: 'INR',
    keyId: env.RAZORPAY_KEY_ID!,
  };
}

export async function verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw new ValidationError('Invalid payment signature');
  }

  const order = await prisma.order.findUnique({ where: { razorpayOrderId } });
  if (!order) throw new NotFoundError('Order not found');

  if (order.paymentStatus === 'CAPTURED') {
    return { success: true, orderId: order.id, orderNumber: order.orderNumber, paymentId: razorpayPaymentId };
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: 'CAPTURED', status: 'CONFIRMED', razorpayPaymentId },
  });

  return { success: true, orderId: order.id, orderNumber: order.orderNumber, paymentId: razorpayPaymentId };
}

export async function handleWebhook(rawBody: Buffer, signature: string) {
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET!)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    logger.warn('Invalid webhook signature');
    return;
  }

  const event = JSON.parse(rawBody.toString());
  const paymentEntity = event.payload?.payment?.entity;

  if (!paymentEntity) return;

  switch (event.event) {
    case 'payment.captured': {
      const order = await prisma.order.findUnique({ where: { razorpayOrderId: paymentEntity.order_id } });
      if (order && order.paymentStatus !== 'CAPTURED') {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'CAPTURED', status: 'CONFIRMED', razorpayPaymentId: paymentEntity.id },
        });
      }
      break;
    }
    case 'payment.failed': {
      const order = await prisma.order.findUnique({ where: { razorpayOrderId: paymentEntity.order_id } });
      if (order && order.paymentStatus === 'PENDING') {
        await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'FAILED' } });
      }
      break;
    }
  }
}
