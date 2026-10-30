'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { useMemo, useState } from 'react';
import { inventoryNo, rub, sizeLabel } from '@/lib/format';
import type { Product } from '@/lib/types';
import Art from './Art';
import WorkCard from './WorkCard';

type Filter = 'all' | 'original' | 'print' | 'available';
type View = 'grid' | 'list';

const FILTERS: Array<[Filter, string]> = [
  ['all', 'Все'],
  ['original', 'Оригиналы'],
  ['print', 'Принты'],
  ['available', 'В наличии'],
];

function Segmented<T extends string>({ id, items, value, onChange }: { id: string; items: Array<[T, string]>; value: T; onChange: (v: T) => void }) {
  return (
    <div className="seg" role="group">
      {items.map(([v, label]) => (
        <button key={v} aria-pressed={value === v} onClick={() => onChange(v)}>
          {value === v && <motion.span layoutId={id} className="seg__bg" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default function ShopIndex({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<View>('grid');
  const [hover, setHover] = useState<Product | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 260, damping: 30 });
  const sy = useSpring(my, { stiffness: 260, damping: 30 });

  const shown = useMemo(
    () =>
      products.filter((p) => {
        if (filter === 'original') return p.kind === 'original';
        if (filter === 'print') return p.kind === 'print';
        if (filter === 'available') return p.stock > 0;
        return true;
      }),
    [products, filter],
  );

  return (
    <>
      <div className="toolbar">
        <Segmented id="filter" items={FILTERS} value={filter} onChange={setFilter} />
        <Segmented<View>
          id="view"
          items={[
            ['grid', 'Сетка'],
            ['list', 'Список'],
          ]}
          value={view}
          onChange={setView}
        />
      </div>

      {shown.length === 0 ? (
        <p className="empty">В этом разделе пока пусто. Сними фильтр, чтобы увидеть все работы.</p>
      ) : view === 'grid' ? (
        <ul className="index">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((p) => (
              <motion.li key={p.id} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <WorkCard p={p} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <div
          onMouseMove={(e) => {
            mx.set(e.clientX + 28);
            my.set(e.clientY - 150);
          }}
          onMouseLeave={() => setHover(null)}
        >
          <ul className="rows">
            {shown.map((p) => (
              <li key={p.id}>
                <Link href={`/shop/${p.slug}`} className="row" onMouseEnter={() => setHover(p)} onFocus={() => setHover(p)} onBlur={() => setHover(null)}>
                  <span className="dim">{inventoryNo(p.id)}</span>
                  <span className="t">{p.title}</span>
                  <span className="dim">
                    {p.medium || '—'}, {p.year}
                  </span>
                  <span className="dim">{sizeLabel(p.widthCm, p.heightCm)}</span>
                  <span>{p.stock > 0 ? (p.price > 0 ? rub(p.price) : 'по запросу') : 'продана'}</span>
                </Link>
              </li>
            ))}
          </ul>
          <AnimatePresence>
            {hover && (
              <motion.div className="peek" style={{ x: sx, y: sy }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.15 }} aria-hidden>
                <div className="mat">
                  <Art slug={hover.slug} title={hover.title} src={hover.images[0]} w={hover.widthCm} h={hover.heightCm} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
