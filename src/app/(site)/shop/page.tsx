import type { Metadata } from 'next';
import ShopIndex from '@/components/ShopIndex';
import { listProducts } from '@/lib/db';

export const metadata: Metadata = { title: 'Каталог' };

export default function ShopPage() {
  const products = listProducts();
  return (
    <div className="page-top section" >
      <div className="section__head">
        <h1 className="display h-xl">Каталог</h1>
        <p className="note" style={{ margin: 0 }}>
          Работ в каталоге: {products.length}
        </p>
      </div>
      <ShopIndex products={products} />
    </div>
  );
}
