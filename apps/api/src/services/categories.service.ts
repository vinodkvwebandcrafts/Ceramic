import { prisma } from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { slugify } from '@ceramic/utils';

export async function findAll() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    parentId: c.parentId,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
    productCount: c._count.products,
  }));
}

export async function findBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug, isActive: true },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  if (!category) throw new NotFoundError('Category not found');
  return { ...category, productCount: category._count.products };
}

export async function create(data: { name: string; slug?: string; description?: string; image?: string; parentId?: string; sortOrder?: number }) {
  return prisma.category.create({
    data: { name: data.name, slug: data.slug || slugify(data.name), description: data.description, image: data.image, parentId: data.parentId, sortOrder: data.sortOrder ?? 0 },
  });
}

export async function update(id: string, data: Partial<{ name: string; slug: string; description: string; image: string; parentId: string; sortOrder: number; isActive: boolean }>) {
  return prisma.category.update({ where: { id }, data });
}

export async function remove(id: string) {
  return prisma.category.update({ where: { id }, data: { isActive: false } });
}
