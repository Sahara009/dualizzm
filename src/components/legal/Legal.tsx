import Link from 'next/link';
import { LEGAL, isPlaceholder } from '@/lib/legal';

// Подсветка незаполненных реквизитов.
export function F({ v }: { v: string }) {
  return isPlaceholder(v) ? <mark className="fill">{v}</mark> : <>{v}</>;
}

export const DOCS = [
  { href: '/legal/offer', title: 'Публичная оферта' },
  { href: '/legal/delivery', title: 'Доставка, оплата и возврат' },
  { href: '/legal/privacy', title: 'Политика обработки персональных данных' },
  { href: '/legal/consent', title: 'Согласие на обработку персональных данных' },
  { href: '/legal/cookies', title: 'Файлы cookie' },
];

export function Seller() {
  return (
    <ul className="legal__req">
      <li><span>Продавец</span><b><F v={LEGAL.seller} /></b></li>
      <li><span>Статус</span><b><F v={LEGAL.status} /></b></li>
      <li><span>ИНН</span><b><F v={LEGAL.inn} /></b></li>
      {LEGAL.ogrnip && <li><span>ОГРНИП</span><b><F v={LEGAL.ogrnip} /></b></li>}
      <li><span>Адрес для писем</span><b><F v={LEGAL.address} /></b></li>
      <li><span>Почта</span><b><F v={LEGAL.email} /></b></li>
      <li><span>Телефон</span><b><F v={LEGAL.phone} /></b></li>
      <li><span>Сайт</span><b>{LEGAL.site}</b></li>
    </ul>
  );
}

export default function Legal({ title, current, children }: { title: string; current: string; children: React.ReactNode }) {
  return (
    <div className="page-top legal">
      <aside className="legal__nav" aria-label="Документы">
        <ul>
          {DOCS.map((d) => (
            <li key={d.href}>
              <Link href={d.href} aria-current={d.href === current ? 'page' : undefined}>
                {d.title}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <article className="legal__doc">
        <h1 className="display h-lg">{title}</h1>
        <p className="note">Редакция от {LEGAL.updated}</p>
        {children}
      </article>
    </div>
  );
}
