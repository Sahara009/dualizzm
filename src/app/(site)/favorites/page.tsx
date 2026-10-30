import type { Metadata } from 'next';
import FavoritesList from '@/components/FavoritesList';
import { listProducts } from '@/lib/db';

export const metadata: Metadata = { title: 'Избранное', robots: { index: false } };

export default function FavoritesPage() {
  const products = listProducts();
  return (
    <div className="page-top section" >
      <div className="section__head">
        <h1 className="display h-xl">Избранное</h1>
        <p className="note" style={{ margin: 0, maxWidth: '24rem' }}>
          Список хранится только в этом браузере. Регистрация не нужна.
        </p>
      </div>
      <FavoritesList products={products} />
    </div>
  );
}
