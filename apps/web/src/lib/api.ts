import type { ApiResponse, PaginatedResponse, ProductListItem, ProductDetail, Category, CartSummary, OrderListItem, OrderDetail } from '@ceramic/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new Error(error.error?.message || 'Request failed');
  }
  return res.json();
}

// Products
export async function getProducts(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchApi<PaginatedResponse<ProductListItem>>(`/products${query}`);
}

export async function getProduct(slug: string) {
  return fetchApi<ApiResponse<ProductDetail>>(`/products/${slug}`);
}

// Categories
export async function getCategories() {
  return fetchApi<ApiResponse<Category[]>>('/categories');
}

// Auth
export async function login(email: string, password: string) {
  return fetchApi<ApiResponse<{ user: any; accessToken: string }>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(data: { name: string; email: string; password: string; phone?: string }) {
  return fetchApi<ApiResponse<{ user: any; accessToken: string }>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
