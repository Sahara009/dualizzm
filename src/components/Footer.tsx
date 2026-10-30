import Link from 'next/link';
import type { Settings } from '@/lib/types';
import FooterWord from './FooterWord';

export default function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="footer">
      <div className="footer__cols">
        <div>
          <small>Магазин</small>
          <ul>
            <li><Link href="/shop">Каталог</Link></li>
            <li><Link href="/about">Обо мне</Link></li>
            <li><Link href="/journal">Хроника</Link></li>
            <li><Link href="/about#contact">Написать мне</Link></li>
          </ul>
        </div>
        <div>
          <small>Связь</small>
          <ul>
            {settings.instagram && (
              <li>
                <a href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
            )}
            {settings.telegram && (
              <li>
                <a href={`https://t.me/${settings.telegram}`} target="_blank" rel="noopener noreferrer">
                  Телеграм
                </a>
              </li>
            )}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
            )}
          </ul>
        </div>
        <div>
          <small>Документы</small>
          <ul>
            <li><Link href="/legal/offer">Публичная оферта</Link></li>
            <li><Link href="/legal/delivery">Доставка и возврат</Link></li>
            <li><Link href="/legal/privacy">Персональные данные</Link></li>
            <li><Link href="/legal/cookies">Cookie</Link></li>
          </ul>
        </div>
        <div>
          <small>© {new Date().getFullYear()}</small>
          <ul>
            <li>{settings.artistName}, dualizzm</li>
          </ul>
        </div>
      </div>
      {/* надпись из синих осколков на всю ширину, собирается, когда долистали до футера */}
      <FooterWord />
    </footer>
  );
}
