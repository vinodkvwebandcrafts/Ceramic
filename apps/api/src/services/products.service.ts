import { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { parsePagination, buildPagination } from '../utils/pagination.js';
import { slugify } from '@ceramic/utils';
import type { ProductFilters } from '@ceramic/types';

export async function findAll(filters: ProductFilters & { page?: number; limit?: number }) {
  const { page, limit, skip } = parsePagination(filters);

  const where: Prisma.ProductWhereInput = { isActive: true };

  if (filters.category) {
    where.category = { slug: filters.category };
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.basePrice = {};
    if (filters.minPrice !== undefined) where.basePrice.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.basePrice.lte = filters.maxPrice;
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.inStock) {
    where.variants = { some: { stock: { gt: 0 }, isActive: true } };
  }
  if (filters.isFeatured) {
    where.isFeatured = true;
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
    switch (filters.sort) {
      case 'price_asc': return { basePrice: 'asc' as const };
      case 'price_desc': return { basePrice: 'desc' as const };
      case 'rating_desc': return { averageRating: 'desc' as const };
      case 'name_asc': return { name: 'asc' as const };
      case 'created_desc':
      default: return { createdAt: 'desc' as const };
    }
  })();

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        variants: { where: { isActive: true }, select: { stock: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const data = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    categoryId: p.categoryId,
    categoryName: p.category.name,
    basePrice: p.basePrice,
    compareAtPrice: p.compareAtPrice,
    image: p.images[0]?.url ?? null,
    tags: p.tags,
    isFeatured: p.isFeatured,
    averageRating: p.averageRating,
    reviewCount: p.reviewCount,
    inStock: p.variants.some((v) => v.stock > 0),
  }));

  return { data, pagination: buildPagination(page, limit, total) };
}

export async function findBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: 'asc' } },
      variants: { where: { isActive: true } },
    },
  });
  if (!product) throw new NotFoundError('Product not found');
  return product;
}

export async function create(data: {
  name: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  basePrice: number;
  compareAtPrice?: number;
  tags?: string[];
  isFeatured?: boolean;
  images?: { url: string; alt?: string }[];
  variants?: { name: string; sku: string; price: number; stock: number; attributes: Record<string, string> }[];
}) {
  return prisma.product.create({
    data: {
      name: data.name,
      slug: slugify(data.name),
      description: data.description,
      shortDescription: data.shortDescription,
      categoryId: data.categoryId,
      basePrice: data.basePrice,
      compareAtPrice: data.compareAtPrice,
      tags: data.tags ?? [],
      isFeatured: data.isFeatured ?? false,
      images: data.images ? { create: data.images.map((img, i) => ({ url: img.url, alt: img.alt, sortOrder: i })) } : undefined,
      variants: data.variants ? { create: data.variants } : undefined,
    },
    include: { images: true, variants: true, category: { select: { id: true, name: true, slug: true } } },
  });
}

export async function update(id: string, data: Partial<typeof create extends (d: infer T) => unknown ? T : never>) {
  return prisma.product.update({
    where: { id },
    data: {
      ...data,
      slug: data.name ? slugify(data.name) : undefined,
      images: undefined,
      variants: undefined,
    },
    include: { images: true, variants: true, category: { select: { id: true, name: true, slug: true } } },
  });
}

export async function remove(id: string) {
  return prisma.product.update({ where: { id }, data: { isActive: false } });
}
