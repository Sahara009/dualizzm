import Link from 'next/link';
import { inventoryNo, priceLabel, sizeLabel } from '@/lib/format';
import type { Product } from '@/lib/types';
import Art from './Art';
import FavButton from './FavButton';

// Ссылка растянута на всю ячейку через ::after, а сердце лежит поверх неё:
// так кнопка не оказывается внутри ссылки.
export default function WorkCard({ p }: { p: Product }) {
  const sold = p.stock <= 0;
  return (
    <article className="cell" data-cursor="смотреть">
      <div className="cell__row">
        <span>{inventoryNo(p.id)}</span>
        <b>
          <Link href={`/shop/${p.slug}`} className="cell__link">
            {p.title}
          </Link>
        </b>
      </div>
      <div className="cell__art">
        {sold && <span className="sold">Продана</span>}
        <div className="mat">
          <Art slug={p.slug} title={p.title} src={p.images[0]} w={p.widthCm} h={p.heightCm} />
        </div>
        <div className="cell__fav">
          <FavButton id={p.id} title={p.title} />
        </div>
      </div>
      <div className="cell__row">
        <span>{p.kind === 'original' ? 'Оригинал' : 'Принт'}</span>
        <b>{p.widthCm > 0 && p.heightCm > 0 ? `${p.year}, ${sizeLabel(p.widthCm, p.heightCm)}` : p.year}</b>
      </div>
      <div className="cell__row">
        <span>Цена</span>
        <b>{sold ? 'Нет в наличии' : priceLabel(p.price)}</b>
      </div>
    </article>
  );
}
