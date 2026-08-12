import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/lib/services/product.service';
import { updateDbCartItemAction, removeDbCartItemAction, clearDbCartAction } from '@/lib/actions/cart';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isAuth: boolean;
  setAuth: (isAuth: boolean) => void;
  setItems: (items: CartItem[]) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  get totalItems(): number;
  get totalPrice(): number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isAuth: false,
      setAuth: (isAuth) => set({ isAuth }),
      setItems: (items) => set({ items }),
      
      addItem: (product, quantity = 1) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.product.id === product.id);
        const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
        
        // Ensure we don't exceed stock
        const finalQuantity = Math.min(newQuantity, product.stock);

        if (existingItem) {
          set({
            items: currentItems.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: finalQuantity }
                : item
            ),
          });
        } else {
          set({ items: [...currentItems, { product, quantity: finalQuantity }] });
        }

        if (get().isAuth) {
          // Fire and forget
          updateDbCartItemAction(product.id, finalQuantity);
        }
      },
      
      removeItem: (productId) => {
        set({
          items: get().items.filter(item => item.product.id !== productId),
        });
        
        if (get().isAuth) {
          removeDbCartItemAction(productId);
        }
      },
      
      updateQuantity: (productId, quantity) => {
        const item = get().items.find(i => i.product.id === productId);
        if (!item) return;

        const finalQuantity = Math.min(Math.max(0, quantity), item.product.stock);

        if (finalQuantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map(item =>
            item.product.id === productId ? { ...item, quantity: finalQuantity } : item
          ),
        });

        if (get().isAuth) {
          updateDbCartItemAction(productId, finalQuantity);
        }
      },
      
      clearCart: () => {
        set({ items: [] });
        if (get().isAuth) {
          clearDbCartAction();
        }
      },
      
      get totalItems() {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      get totalPrice() {
        return get().items.reduce(
          (total, item) => total + (item.product.discount_price || item.product.price) * item.quantity,
          0
        );
      },
    }),
    {
      name: 'vegetable-cart-storage',
      // Don't persist isAuth flag
      partialize: (state) => ({ items: state.items }),
    }
  )
);
