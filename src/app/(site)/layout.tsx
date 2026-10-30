import CartDrawer from '@/components/CartDrawer';
import CartProvider from '@/components/CartProvider';
import CookieNotice from '@/components/CookieNotice';
import Cursor from '@/components/Cursor';
import FavoritesProvider from '@/components/FavoritesProvider';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Preloader from '@/components/Preloader';
import SmoothScroll from '@/components/SmoothScroll';
import { getSettings, listProducts } from '@/lib/db';
import { rub } from '@/lib/format';
import { INTRO_BOOT_SCRIPT } from '@/lib/intro';

export const dynamic = 'force-dynamic';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();
  // бегущая строка: номер > название — статус
  const ticker = listProducts().map((p, i) => `${i + 1} > ${p.title} — ${p.stock <= 0 ? 'продана' : p.price > 0 ? rub(p.price) : 'цена по запросу'}`);
  ticker.push('LOC: Moscow');
  return (
    <CartProvider>
      <FavoritesProvider>
      {/* до отрисовки решает, показывать ли заставку */}
      <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT_SCRIPT }} />
      <SmoothScroll />
      <Preloader />
      <Cursor />
      <Header ticker={ticker} />
      <main>{children}</main>
      <Footer settings={settings} />
      <CartDrawer />
      <CookieNotice />
      </FavoritesProvider>
    </CartProvider>
  );
}
