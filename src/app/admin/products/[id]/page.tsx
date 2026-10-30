import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { getProductById } from '@/lib/db';

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === 'new') {
    return (
      <div className="adm__main">
        <h1>Новая работа</h1>
        <ProductForm product={null} />
      </div>
    );
  }
  const product = getProductById(Number(id));
  if (!product) notFound();
  return (
    <div className="adm__main">
      <h1>{product.title}</h1>
      <ProductForm product={product} />
    </div>
  );
}
