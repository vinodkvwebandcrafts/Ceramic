import { z } from 'zod';

// ── Auth ──
export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').optional(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ── Product ──
export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10),
  shortDescription: z.string().max(300).optional(),
  categoryId: z.string().cuid(),
  basePrice: z.number().int().positive(),
  compareAtPrice: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  images: z
    .array(z.object({ url: z.string().url(), alt: z.string().optional() }))
    .optional(),
  variants: z
    .array(
      z.object({
        name: z.string().min(1),
        sku: z.string().min(1),
        price: z.number().int().positive(),
        stock: z.number().int().min(0),
        attributes: z.record(z.string()),
      }),
    )
    .optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const productFiltersSchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  search: z.string().optional(),
  inStock: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  sort: z
    .enum(['price_asc', 'price_desc', 'created_desc', 'rating_desc', 'name_asc'])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ── Category ──
export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().cuid().optional(),
  sortOrder: z.number().int().optional(),
});

// ── Address ──
export const createAddressSchema = z.object({
  label: z.string().max(50).default('Home'),
  fullName: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  line1: z.string().min(5).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2),
  postalCode: z.string().regex(/^\d{6}$/, 'Invalid Indian PIN code'),
  isDefault: z.boolean().optional(),
});

// ── Cart ──
export const addToCartSchema = z.object({
  variantId: z.string().cuid(),
  quantity: z.number().int().min(1).max(10),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(10),
});

// ── Order ──
export const createOrderSchema = z.object({
  addressId: z.string().cuid(),
});

// ── Review ──
export const createReviewSchema = z.object({
  productId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
});

// ── Payment ──
export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

// ── Pagination ──
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
