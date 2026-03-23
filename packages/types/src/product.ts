export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  categoryId: string;
  basePrice: number; // paise
  compareAtPrice: number | null; // paise
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number; // paise
  stock: number;
  attributes: Record<string, string>;
  isActive: boolean;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  categoryId: string;
  categoryName: string;
  basePrice: number;
  compareAtPrice: number | null;
  image: string | null; // first image URL
  tags: string[];
  isFeatured: boolean;
  averageRating: number;
  reviewCount: number;
  inStock: boolean;
}

export interface ProductDetail extends Product {
  category: { id: string; name: string; slug: string };
}

export interface CreateProductInput {
  name: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  basePrice: number;
  compareAtPrice?: number;
  tags?: string[];
  isFeatured?: boolean;
  images?: { url: string; alt?: string }[];
  variants?: {
    name: string;
    sku: string;
    price: number;
    stock: number;
    attributes: Record<string, string>;
  }[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  isActive?: boolean;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  sort?: 'price_asc' | 'price_desc' | 'created_desc' | 'rating_desc' | 'name_asc';
}
