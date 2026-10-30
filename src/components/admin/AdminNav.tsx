'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const LINKS = [
  ['/admin/products', 'Работы'],
  ['/admin/orders', 'Заказы'],
  ['/admin/posts', 'Хроника'],
  ['/admin/messages', 'Сообщения'],
  ['/admin/settings', 'Настройки'],
] as const;

export default function AdminNav() {
  const path = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="adm__bar">
      <nav aria-label="Админ-панель">
        <b>dualizzm</b>
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} aria-current={path.startsWith(href) ? 'page' : undefined}>
            {label}
          </Link>
        ))}
      </nav>
      <nav>
        <Link href="/">На сайт</Link>
        <button onClick={logout}>Выйти</button>
      </nav>
    </div>
  );
}
