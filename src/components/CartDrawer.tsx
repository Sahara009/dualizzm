'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';
import { rub } from '@/lib/format';
import { lockScroll } from '@/lib/scroll';
import Art from './Art';
import { useCart } from './CartProvider';

const COLS = 10;
const ROWS = 18;
const SPREAD = 0.42; // за сколько секунд рассыпаются все пиксели

// Чёрные пиксели закрывают шторку и гаснут в случайном порядке: корзина «проявляется».
// При закрытии наоборот: пиксели набегают, и шторка исчезает.
function Pixels() {
  const delays = useMemo(() => Array.from({ length: COLS * ROWS }, () => Math.random() * SPREAD), []);
  return (
    <div className="drawer__pixels" aria-hidden style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
      {delays.map((d, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, transition: { duration: 0, delay: d } }}
          exit={{ opacity: 1, transition: { duration: 0, delay: SPREAD - d } }}
        />
      ))}
    </div>
  );
}

export default function CartDrawer() {
  const { items, total, isOpen, close, setQty, remove } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    lockScroll(true);
    return () => {
      window.removeEventListener('keydown', onKey);
      lockScroll(false);
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div key="cart" className="drawer-wrap" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
          <motion.div
            className="drawer-bg"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: SPREAD * 0.6, duration: 0.25 } }}
          />
          <aside className="drawer" role="dialog" aria-modal="true" aria-label="Корзина">
            <div className="drawer__head">
              <h2>Корзина</h2>
              <button ref={closeRef} className="link-btn" onClick={close}>
                Закрыть
              </button>
            </div>

            {items.length === 0 ? (
              <div className="drawer__empty">
                <p>В корзине пусто. Загляни в каталог: там есть что забрать домой.</p>
                <Link href="/shop" className="btn" onClick={close}>
                  Открыть каталог
                </Link>
              </div>
            ) : (
              <>
                <ul className="drawer__list" data-lenis-prevent>
                  {items.map((it) => (
                    <li key={it.id} className="drawer__item">
                      <Link href={`/shop/${it.slug}`} className="drawer__thumb" onClick={close} aria-label={it.title}>
                        <div className="mat">
                          <Art slug={it.slug} title={it.title} src={it.image} w={it.w} h={it.h} />
                        </div>
                      </Link>
                      <div>
                        <b>{it.title}</b>
                        <small>{it.kind === 'original' ? 'Оригинал, один экземпляр' : 'Принт'}</small>
                        {it.kind === 'print' && (
                          <div className="qty">
                            <button onClick={() => setQty(it.id, it.qty - 1)} disabled={it.qty <= 1} aria-label="Меньше">
                              −
                            </button>
                            <span>{it.qty}</span>
                            <button onClick={() => setQty(it.id, it.qty + 1)} disabled={it.qty >= it.stock} aria-label="Больше">
                              +
                            </button>
                          </div>
                        )}
                        <div style={{ marginTop: '0.5rem' }}>
                          <button className="link-btn" onClick={() => remove(it.id)}>
                            Убрать
                          </button>
                        </div>
                      </div>
                      <b>{rub(it.price * it.qty)}</b>
                    </li>
                  ))}
                </ul>
                <div className="drawer__foot">
                  <div className="sum">
                    <span>Итого</span>
                    <span>{rub(total)}</span>
                  </div>
                  <small>Доставку выберешь на следующем шаге.</small>
                  <Link href="/checkout" className="btn btn--block" onClick={close}>
                    Оформить заказ
                  </Link>
                </div>
              </>
            )}
            <Pixels />
          </aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
