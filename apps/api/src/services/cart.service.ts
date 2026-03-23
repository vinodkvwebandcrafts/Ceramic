import { prisma } from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export async function getCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { select: { id: true, name: true, slug: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } } },
            },
          },
        },
      },
    },
  });

  if (!cart) return { id: '', userId, items: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

  const items = cart.items.map((item) => ({
    id: item.id,
    cartId: item.cartId,
    variantId: item.variantId,
    quantity: item.quantity,
    variant: {
      id: item.variant.id,
      name: item.variant.name,
      sku: item.variant.sku,
      price: item.variant.price,
      stock: item.variant.stock,
      product: {
        id: item.variant.product.id,
        name: item.variant.product.name,
        slug: item.variant.product.slug,
        image: item.variant.product.images[0]?.url ?? null,
      },
    },
  }));

  return { ...cart, items };
}

export async function addItem(userId: string, variantId: string, quantity: number) {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant || !variant.isActive) throw new NotFoundError('Variant not found');
  if (variant.stock < quantity) throw new ValidationError('Insufficient stock');

  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId, items: { create: { variantId, quantity } } },
    update: {},
  });

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    create: { cartId: cart.id, variantId, quantity },
    update: { quantity: { increment: quantity } },
  });

  return getCart(userId);
}

export async function updateItem(userId: string, itemId: string, quantity: number) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true, variant: true },
  });
  if (!item || item.cart.userId !== userId) throw new NotFoundError('Cart item not found');
  if (item.variant.stock < quantity) throw new ValidationError('Insufficient stock');

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  return getCart(userId);
}

export async function removeItem(userId: string, itemId: string) {
  const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
  if (!item || item.cart.userId !== userId) throw new NotFoundError('Cart item not found');
  await prisma.cartItem.delete({ where: { id: itemId } });
  return getCart(userId);
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}
