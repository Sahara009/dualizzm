'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/types';

export type CartItem = {
  id: number;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  kind: 'original' | 'print';
  stock: number;
  qty: number;
  w: number;
  h: number;
};

type Cart = {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (p: Product) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  has: (id: number) => boolean;
};

const Ctx = createContext<Cart | null>(null);
const KEY = 'dz-cart-v1';

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart вне CartProvider');
  return c;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* корзина просто начнётся с нуля */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* приватный режим: не страшно */
    }
  }, [items, ready]);

  const add = useCallback((p: Product) => {
    if (p.stock <= 0 || p.price <= 0) return;
    setItems((cur) => {
      const found = cur.find((i) => i.id === p.id);
      if (found) {
        if (p.kind === 'original') return cur;
        return cur.map((i) => (i.id === p.id ? { ...i, stock: p.stock, qty: Math.min(i.qty + 1, p.stock) } : i));
      }
      return [
        ...cur,
        { id: p.id, slug: p.slug, title: p.title, price: p.price, image: p.images[0] ?? null, kind: p.kind, stock: p.stock, qty: 1, w: p.widthCm, h: p.heightCm },
      ];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((id: number, qty: number) => {
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.kind === 'original' ? 1 : i.stock)) } : i)));
  }, []);

  const remove = useCallback((id: number) => setItems((cur) => cur.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<Cart>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + i.qty * i.price, 0),
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      setQty,
      remove,
      clear,
      has: (id: number) => items.some((i) => i.id === id),
    }),
    [items, isOpen, add, setQty, remove, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
