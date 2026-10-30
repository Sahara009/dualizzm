import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCart from '@/components/AddToCart';
import FavButton from '@/components/FavButton';
import ProductGallery from '@/components/ProductGallery';
import WorkCard from '@/components/WorkCard';
import { getProductBySlug, getSettings, listProducts } from '@/lib/db';
import { inventoryNo, priceLabel, sizeLabel } from '@/lib/format';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProductBySlug((await params).slug);
  if (!p) return {};
  return {
    title: p.title,
    description: `${p.title}, ${p.year}. ${p.medium}. ${sizeLabel(p.widthCm, p.heightCm)}.`,
    openGraph: p.images[0] ? { images: [p.images[0]] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const p = getProductBySlug((await params).slug);
  if (!p || !p.published) notFound();
  const more = listProducts().filter((x) => x.id !== p.id).slice(0, 3);
  const sold = p.stock <= 0;
  const s = getSettings();
  const contact = s.instagram
    ? { href: `https://instagram.com/${s.instagram}`, label: 'Узнать цену', via: 'в Instagram' }
    : s.email
      ? { href: `mailto:${s.email}?subject=${encodeURIComponent(p.title)}`, label: 'Узнать цену', via: 'по почте' }
      : null;

  return (
    <>
      <div className="page-top work">
        <ProductGallery slug={p.slug} title={p.title} images={p.images} w={p.widthCm} h={p.heightCm} />
        <div>
          <Link href="/shop" className="back">
            Назад в каталог
          </Link>
          <h1 className="display h-lg">{p.title}</h1>

          <dl className="facts">
            <div><dt>Номер</dt><dd>{inventoryNo(p.id)}</dd></div>
            <div><dt>Год</dt><dd>{p.year}</dd></div>
            <div><dt>Техника</dt><dd>{p.medium || '—'}</dd></div>
            <div><dt>Размер</dt><dd>{sizeLabel(p.widthCm, p.heightCm)}</dd></div>
            <div>
              <dt>Экземпляры</dt>
              <dd>{p.kind === 'original' ? 'Оригинал, единственный' : sold ? 'Тираж разошёлся' : `Принт, осталось ${p.stock}`}</dd>
            </div>
          </dl>

          <p className="price">{sold ? 'Продана' : priceLabel(p.price)}</p>
          <AddToCart product={p} contact={contact} />
          <div style={{ marginTop: '0.6rem' }}>
            <FavButton id={p.id} title={p.title} variant="wide" />
          </div>

          {p.description && (
            <div className="prose" style={{ marginTop: '2rem' }}>
              {p.description.split(/\n{2,}/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {more.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section__head">
            <h2 className="display h-lg">Ещё работы</h2>
          </div>
          <ul className="index">
            {more.map((x) => (
              <li key={x.id}>
                <WorkCard p={x} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
