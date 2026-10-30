'use client';

import { AnimatePresence, motion } from 'motion/react';
import { rub } from '@/lib/format';
import type { Product } from '@/lib/types';
import { useCart } from './CartProvider';

export default function AddToCart({ product, contact }: { product: Product; contact: { href: string; label: string; via?: string } | null }) {
  const { add, has, open, items } = useCart();
  const inCart = has(product.id);
  const sold = product.stock <= 0;
  const qty = items.find((i) => i.id === product.id)?.qty ?? 0;
  const maxed = inCart && (product.kind === 'original' || qty >= product.stock);

  if (sold) {
    return (
      <button className="btn btn--block" disabled>
        Продана
      </button>
    );
  }
  if (product.price <= 0) {
    return contact ? (
      <a className="btn-spray" href={contact.href} target={contact.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
        <b>{contact.label}</b>
        <small>{contact.via ?? 'напишите мне'}</small>
      </a>
    ) : (
      <button className="btn btn--block" disabled>
        Цена по запросу
      </button>
    );
  }
  if (maxed) {
    return (
      <button className="btn btn--ghost btn--block" onClick={open}>
        В корзине. Открыть корзину
      </button>
    );
  }
  return (
    // кнопка как пятно синей краски из баллончика с подтёками
    <button className="btn-spray" onClick={() => add(product)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.b key={inCart ? 'more' : 'add'} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.15 }}>
          {inCart ? 'Ещё одну' : 'Купить'}
        </motion.b>
      </AnimatePresence>
      <small>{rub(product.price)}</small>
    </button>
  );
}
