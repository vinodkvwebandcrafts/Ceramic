import { prisma } from '../config/database.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors.js';
import { parsePagination, buildPagination } from '../utils/pagination.js';

export async function findByProduct(productId: string, query: { page?: number; limit?: number }) {
  const { page, limit, skip } = parsePagination(query);
  const where = { productId, isApproved: true };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { user: { select: { name: true, avatar: true } } },
    }),
    prisma.review.count({ where }),
  ]);

  return { data: reviews, pagination: buildPagination(page, limit, total) };
}

export async function create(userId: string, data: { productId: string; rating: number; title?: string; body?: string }) {
  const existing = await prisma.review.findUnique({ where: { productId_userId: { productId: data.productId, userId } } });
  if (existing) throw new ConflictError('You have already reviewed this product');

  // Check if user purchased this product
  const hasPurchased = await prisma.orderItem.findFirst({
    where: { order: { userId, paymentStatus: 'CAPTURED' }, variant: { productId: data.productId } },
  });

  const review = await prisma.review.create({
    data: { ...data, userId, isVerified: !!hasPurchased },
    include: { user: { select: { name: true, avatar: true } } },
  });

  await updateProductRating(data.productId);
  return review;
}

export async function update(reviewId: string, userId: string, data: { rating?: number; title?: string; body?: string }) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new NotFoundError('Review not found');
  if (review.userId !== userId) throw new ForbiddenError('Cannot edit another user\'s review');

  const updated = await prisma.review.update({ where: { id: reviewId }, data, include: { user: { select: { name: true, avatar: true } } } });
  await updateProductRating(review.productId);
  return updated;
}

export async function remove(reviewId: string, userId: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new NotFoundError('Review not found');
  if (review.userId !== userId) throw new ForbiddenError('Cannot delete another user\'s review');

  await prisma.review.delete({ where: { id: reviewId } });
  await updateProductRating(review.productId);
}

export async function moderate(reviewId: string, isApproved: boolean) {
  const review = await prisma.review.update({ where: { id: reviewId }, data: { isApproved } });
  await updateProductRating(review.productId);
  return review;
}

async function updateProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: { averageRating: agg._avg.rating ?? 0, reviewCount: agg._count },
  });
}

export async function findAllAdmin(query: { page?: number; limit?: number }) {
  const { page, limit, skip } = parsePagination(query);
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { user: { select: { name: true } }, product: { select: { name: true } } },
    }),
    prisma.review.count(),
  ]);
  return { data: reviews, pagination: buildPagination(page, limit, total) };
}
