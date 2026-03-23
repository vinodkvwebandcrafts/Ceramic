export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
] as const;

export const PAYMENT_STATUSES = [
  'PENDING',
  'AUTHORIZED',
  'CAPTURED',
  'FAILED',
  'REFUNDED',
] as const;

export const ROLES = ['CUSTOMER', 'ADMIN'] as const;

export const CATEGORIES = ['Mugs', 'Vases', 'Planters', 'Tableware', 'Decor'] as const;

/** Free shipping threshold in paise (₹999) */
export const FREE_SHIPPING_THRESHOLD = 99900;

/** Flat shipping rate in paise (₹99) */
export const FLAT_SHIPPING_RATE = 9900;

/** GST rate (18%) */
export const GST_RATE = 0.18;

/** Pagination defaults */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/** Image upload limits */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
