"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/hooks/use-cart";
import { syncCartAction } from "@/lib/actions/cart";

export function CartSync({ isAuth }: { isAuth: boolean }) {
  const { items, setAuth, setItems, isAuth: currentIsAuth } = useCart();
  const hasSynced = useRef(false);

  useEffect(() => {
    // Update auth state in Zustand so future actions hit DB
    setAuth(isAuth);

    // If we just authenticated and haven't synced this session yet
    if (isAuth && !hasSynced.current) {
      hasSynced.current = true;
      
      const performSync = async () => {
        try {
          const localItems = items.map(i => ({ productId: i.product.id, quantity: i.quantity }));
          
          const result = await syncCartAction(localItems);
          
          if (result.success && 'items' in result && result.items) {
            // Hydrate the definitive DB state back into Zustand
            setItems(result.items as any);
          }
        } catch (error) {
          console.error("Cart sync failed:", error);
        }
      };

      performSync();
    }
  }, [isAuth, setAuth]);

  return null; // Silent component
}
