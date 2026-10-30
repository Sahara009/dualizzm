'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// Избранное без регистрации: список id работ хранится в браузере (localStorage).
type Fav = { ids: number[]; count: number; has: (id: number) => boolean; toggle: (id: number) => void; ready: boolean };

const Ctx = createContext<Fav | null>(null);
const KEY = 'dz-fav-v1';

export function useFavorites() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useFavorites вне FavoritesProvider');
  return c;
}

export default function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setIds((JSON.parse(raw) as unknown[]).filter((x): x is number => typeof x === 'number'));
    } catch {
      /* начнём с пустого списка */
    }
    setReady(true);
    // если избранное поменяли в другой вкладке, подтягиваем
    const sync = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      try {
        setIds(e.newValue ? (JSON.parse(e.newValue) as number[]) : []);
      } catch {
        /* игнорируем битые данные */
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      /* приватный режим: избранное живёт до закрытия вкладки */
    }
  }, [ids, ready]);

  const toggle = useCallback((id: number) => {
    setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur]));
  }, []);

  const value = useMemo<Fav>(() => ({ ids, count: ids.length, has: (id) => ids.includes(id), toggle, ready }), [ids, toggle, ready]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
