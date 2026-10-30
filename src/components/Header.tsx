'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { lockScroll } from '@/lib/scroll';
import { useCart } from './CartProvider';
import { useFavorites } from './FavoritesProvider';
import PixelHeart from './PixelHeart';
import SoundToggle from './SoundToggle';

// Пиксельная сумка 16×16, дырки под ручки вырезаны через evenodd.
function PixelBag() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden shapeRendering="crispEdges">
      <rect x="5" y="1" width="6" height="1" fill="currentColor" />
      <rect x="4" y="2" width="1" height="4" fill="currentColor" />
      <rect x="11" y="2" width="1" height="4" fill="currentColor" />
      <path fillRule="evenodd" fill="currentColor" d="M2 5h12v10H2z M4 7h1v1H4z M11 7h1v1h-1z" />
    </svg>
  );
}

const NAV = [
  { href: '/shop', label: 'Каталог' },
  { href: '/about', label: 'Обо мне' },
  { href: '/journal', label: 'Хроника' },
  { href: '/about#contact', label: 'Связаться' },
];

const MENU = [{ href: '/', label: 'Главная' }, ...NAV, { href: '/favorites', label: 'Избранное' }];

// Чёрная полоса меню (пункты через «\») и под ней синяя бегущая строка LIVE со списком работ.
export default function Header({ ticker }: { ticker: string[] }) {
  const path = usePathname();
  const { count, open } = useCart();
  const fav = useFavorites();
  const cur = (href: string) => (!href.includes('#') && (path === href || (href !== '/' && path.startsWith(href))) ? 'page' : undefined);
  const line = ticker.join('  \\  ');
  const [menu, setMenu] = useState(false);

  // меню закрывается при переходе на другую страницу и по Esc
  useEffect(() => setMenu(false), [path]);
  useEffect(() => {
    if (!menu) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false);
    window.addEventListener('keydown', onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  return (
    <header className="header">
      <div className="header__bar">
        <Link href="/" className="header__logo" aria-label="dualizzm, на главную">
          <b>dualizzm</b>
        </Link>
        <nav className="header__nav" aria-label="Основное меню">
          {NAV.map((n, i) => (
            <Fragment key={n.href}>
              {i > 0 && (
                <span className="header__sep header__wide" aria-hidden>
                  \
                </span>
              )}
              <Link href={n.href} aria-current={cur(n.href)} className="header__wide">
                {n.label}
              </Link>
            </Fragment>
          ))}
          <SoundToggle />
          <Link href="/favorites" className="cart-btn" aria-label={`Избранное, работ: ${fav.count}`} aria-current={cur('/favorites')}>
            <PixelHeart filled={fav.count > 0} />
            {fav.count > 0 && <span className="cart-btn__n">{fav.count}</span>}
          </Link>
          <button className="cart-btn" onClick={open} aria-label={`Корзина, товаров: ${count}`}>
            <PixelBag />
            {count > 0 && <span className="cart-btn__n">{count}</span>}
          </button>
          <button className="burger" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-controls="mobile-menu" aria-label={menu ? 'Закрыть меню' : 'Открыть меню'}>
            <i aria-hidden />
            <i aria-hidden />
            <i aria-hidden />
          </button>
        </nav>
      </div>
      <AnimatePresence>
        {menu && (
          <motion.nav
            id="mobile-menu"
            className="menu"
            data-lenis-prevent
            aria-label="Меню"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.45, ease: [0.7, 0, 0.2, 1] }}
          >
            <ul>
              {MENU.map((n, i) => (
                <motion.li
                  key={n.href}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.35, ease: [0.2, 0.9, 0.2, 1] }}
                >
                  <Link href={n.href} aria-current={n.href === '/' ? (path === '/' ? 'page' : undefined) : cur(n.href)} onClick={() => setMenu(false)}>
                    <small>{String(i + 1).padStart(2, '0')} \</small>
                    {n.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="menu__foot">
              <span>LOC: Moscow</span>
              <span>dualizzm // {new Date().getFullYear()}</span>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
      <div className="ticker" aria-label="Работы в архиве">
        <span className="ticker__live">
          <i aria-hidden /> LIVE
        </span>
        <div className="ticker__track" aria-hidden>
          <span>{line}</span>
          <span>{line}</span>
        </div>
        <span className="sr">{line}</span>
      </div>
    </header>
  );
}
