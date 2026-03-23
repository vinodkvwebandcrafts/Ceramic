export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  variant: {
    id: string;
    name: string;
    sku: string;
    price: number; // paise
    stock: number;
    product: {
      id: string;
      name: string;
      slug: string;
      image: string | null;
    };
  };
}

export interface AddToCartInput {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number; // paise
  items: CartItem[];
}
