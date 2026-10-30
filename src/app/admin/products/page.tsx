import Link from 'next/link';
import Art from '@/components/Art';
import { listProducts } from '@/lib/db';
import { inventoryNo, priceLabel } from '@/lib/format';

export default function AdminProducts() {
  const products = listProducts({ all: true });
  return (
    <div className="adm__main">
      <div className="adm__actions" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>Работы</h1>
        <Link href="/admin/products/new" className="btn">
          Добавить работу
        </Link>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Номер</th>
              <th>Название</th>
              <th>Тип</th>
              <th>Цена</th>
              <th>В наличии</th>
              <th>Видимость</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="thumb">
                    <div className="mat">
                      <Art slug={p.slug} title={p.title} src={p.images[0]} w={p.widthCm} h={p.heightCm} />
                    </div>
                  </div>
                </td>
                <td>{inventoryNo(p.id)}</td>
                <td>
                  <Link href={`/admin/products/${p.id}`} style={{ fontWeight: 700, textDecoration: 'underline' }}>
                    {p.title}
                  </Link>
                </td>
                <td>{p.kind === 'original' ? 'Оригинал' : 'Принт'}</td>
                <td>{priceLabel(p.price)}</td>
                <td>{p.stock > 0 ? p.stock : <span className="tag tag--bad">0</span>}</td>
                <td>
                  {p.published ? <span className="tag tag--ok">Опубликована</span> : <span className="tag">Скрыта</span>}
                  {p.featured && <span className="tag" style={{ marginLeft: 6 }}>Главная</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && <p className="empty">Работ пока нет. Добавь первую.</p>}
    </div>
  );
}
