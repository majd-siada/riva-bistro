"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  addCartLine,
  fetchCart,
  removeCartLine,
  updateCartLine,
  type Cart,
  type CartLine,
} from "@/lib/api";

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  refresh: () => Promise<void>;
  addItem: (
    productId: number,
    quantity: number,
    modifiers?: { option_id: number; name: string }[],
  ) => Promise<void>;
  updateItem: (lineId: number, quantity: number) => Promise<void>;
  removeItem: (lineId: number) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [bounce, setBounce] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (bounce) {
      document.documentElement.dataset.cartBounce = "true";
      const t = setTimeout(() => {
        delete document.documentElement.dataset.cartBounce;
      }, 400);
      return () => clearTimeout(t);
    }
  }, [bounce]);

  const addItem = useCallback(
    async (
      productId: number,
      quantity: number,
      modifiers?: { option_id: number; name: string }[],
    ) => {
      await addCartLine({ product_id: productId, quantity, selected_modifiers: modifiers });
      await refresh();
      toast.success("Tillagt i varukorgen");
      setBounce(true);
      setTimeout(() => setBounce(false), 400);
    },
    [refresh],
  );

  const updateItem = useCallback(
    async (lineId: number, quantity: number) => {
      await updateCartLine(lineId, { quantity });
      await refresh();
    },
    [refresh],
  );

  const removeItem = useCallback(
    async (lineId: number) => {
      await removeCartLine(lineId);
      await refresh();
      toast("Artikel borttagen");
    },
    [refresh],
  );

  const itemCount = cart?.lines.reduce((sum: number, l: CartLine) => sum + l.quantity, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, itemCount, refresh, addItem, updateItem, removeItem }}
    >
      <div data-cart-bounce={bounce ? "true" : "false"}>{children}</div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
