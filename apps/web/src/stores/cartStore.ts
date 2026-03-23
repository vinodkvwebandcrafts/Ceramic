'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItemState {
  variantId: string;
  quantity: number;
  name: string;
  variantName: string;
  price: number;
  image: string | null;
  slug: string;
}

interface CartStore {
  items: CartItemState[];
  addItem: (item: CartItemState) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return { items: state.items.map((i) => i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i) };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (variantId) => set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.variantId !== variantId)
            : state.items.map((i) => i.variantId === variantId ? { ...i, quantity } : i),
        })),
      clearCart: () => set({ items: [] }),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'ceramic-cart' },
  ),
);
