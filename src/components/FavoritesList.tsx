'use client';

import Link from 'next/link';
import type { Product } from '@/lib/types';
import { useFavorites } from './FavoritesProvider';
import WorkCard from './WorkCard';

// Сервер отдаёт все опубликованные работы, здесь оставляем только избранные:
// так цена и наличие всегда свежие.
export default function FavoritesList({ products }: { products: Product[] }) {
  const { ids, ready } = useFavorites();
  if (!ready) return null;
  const list = ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p);

  if (list.length === 0) {
    return (
      <div className="empty">
        <p style={{ marginTop: 0 }}>Здесь пока пусто. Нажми на сердце у работы в каталоге, и она появится здесь.</p>
        <Link href="/shop" className="btn">
          Открыть каталог
        </Link>
      </div>
    );
  }
  return (
    <ul className="index">
      {list.map((p) => (
        <li key={p.id}>
          <WorkCard p={p} />
        </li>
      ))}
    </ul>
  );
}
