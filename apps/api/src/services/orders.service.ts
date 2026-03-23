import { prisma } from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { parsePagination, buildPagination } from '../utils/pagination.js';
import { generateOrderNumber, GST_RATE, FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_RATE } from '@ceramic/utils';

export async function createOrder(userId: string, addressId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });
  if (!cart || cart.items.length === 0) throw new ValidationError('Cart is empty');

  const address = await prisma.user.findUnique({ where: { id: userId } }).then(() =>
    prisma.address.findFirst({ where: { id: addressId, userId } }),
  );
  if (!address) throw new NotFoundError('Address not found');

  // Validate stock for all items
  for (const item of cart.items) {
    if (item.variant.stock < item.quantity) {
      throw new ValidationError(`Insufficient stock for ${item.variant.product.name} - ${item.variant.name}`);
    }
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  const tax = Math.round(subtotal * GST_RATE);
  const total = subtotal + shippingCost + tax;

  const order = await prisma.$transaction(async (tx) => {
    // Decrement stock atomically
    for (const item of cart.items) {
      const updated = await tx.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new ValidationError(`Item ${item.variant.name} went out of stock`);
      }
    }

    // Create order
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        addressId,
        subtotal,
        shippingCost,
        tax,
        total,
        items: {
          create: cart.items.map((item) => ({
            variantId: item.variantId,
            productName: item.variant.product.name,
            variantName: item.variant.name,
            price: item.variant.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // Clear cart
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  return order;
}

export async function getOrders(userId: string, query: { page?: number; limit?: number; status?: string }) {
  const { page, limit, skip } = parsePagination(query);
  const where: any = { userId };
  if (query.status) where.status = query.status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { _count: { select: { items: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  const data = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentStatus: o.paymentStatus,
    total: o.total,
    itemCount: o._count.items,
    createdAt: o.createdAt.toISOString(),
  }));

  return { data, pagination: buildPagination(page, limit, total) };
}

export async function getOrderDetail(orderId: string, userId?: string) {
  const where: any = { id: orderId };
  if (userId) where.userId = userId;

  const order = await prisma.order.findFirst({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      address: { select: { fullName: true, phone: true, line1: true, line2: true, city: true, state: true, postalCode: true } },
      items: { include: { variant: { select: { id: true, sku: true } } } },
    },
  });
  if (!order) throw new NotFoundError('Order not found');
  return order;
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export async function updateStatus(orderId: string, status: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError('Order not found');

  const allowed = STATUS_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(status)) {
    throw new ValidationError(`Cannot transition from ${order.status} to ${status}`);
  }

  return prisma.order.update({ where: { id: orderId }, data: { status: status as any } });
}

export async function getAllOrders(query: { page?: number; limit?: number; status?: string }) {
  const { page, limit, skip } = parsePagination(query);
  const where: any = {};
  if (query.status) where.status = query.status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { data: orders, pagination: buildPagination(page, limit, total) };
}
