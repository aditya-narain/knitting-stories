import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import api from "../lib/api";
import type { Cart } from "../types";
import { useAuth } from "./AuthContext";

interface CartContextValue {
  cart: Cart | null;
  count: number;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const isCustomer = user?.role === "CUSTOMER";

  const refresh = useCallback(async () => {
    if (!isCustomer) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<Cart>("/cart");
      setCart(res.data);
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addItem = useCallback(async (variantId: string, quantity: number) => {
    const res = await api.post<Cart>("/cart/items", { variantId, quantity });
    setCart(res.data);
  }, []);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    const res = await api.patch<Cart>(`/cart/items/${itemId}`, { quantity });
    setCart(res.data);
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    const res = await api.delete<Cart>(`/cart/items/${itemId}`);
    setCart(res.data);
  }, []);

  const clear = useCallback(async () => {
    const res = await api.delete<Cart>("/cart");
    setCart(res.data);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      count: cart?.totalItems ?? 0,
      loading,
      refresh,
      addItem,
      updateItem,
      removeItem,
      clear,
    }),
    [cart, loading, refresh, addItem, updateItem, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
