import { prisma } from '../config/database.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';

export async function getWishlist(userId: string) {
  return prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        select: { id: true, name: true, slug: true, basePrice: true, compareAtPrice: true, averageRating: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addItem(userId: string, productId: string) {
  const existing = await prisma.wishlistItem.findUnique({ where: { userId_productId: { userId, productId } } });
  if (existing) throw new ConflictError('Already in wishlist');

  return prisma.wishlistItem.create({
    data: { userId, productId },
    include: { product: { select: { id: true, name: true, slug: true, basePrice: true } } },
  });
}

export async function removeItem(userId: string, productId: string) {
  const item = await prisma.wishlistItem.findUnique({ where: { userId_productId: { userId, productId } } });
  if (!item) throw new NotFoundError('Item not in wishlist');
  await prisma.wishlistItem.delete({ where: { id: item.id } });
}
