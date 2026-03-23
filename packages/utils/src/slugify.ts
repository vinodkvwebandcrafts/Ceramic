/**
 * Convert a string to a URL-friendly slug.
 * Example: "Earthy Matte Mug" -> "earthy-matte-mug"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate order number: CER-YYYYMMDD-XXXXX
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `CER-${date}-${random}`;
}

/**
 * Generate a random SKU: CER-XXXX-XXXX
 */
export function generateSku(prefix = 'CER'): string {
  const seg1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const seg2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${seg1}-${seg2}`;
}
