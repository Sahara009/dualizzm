import type { Metadata } from 'next';
import AdminNav from '@/components/admin/AdminNav';
import { isAdmin } from '@/lib/auth';
import { DATA_IS_EPHEMERAL } from '@/lib/db';

export const metadata: Metadata = { title: 'Админка', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin();
  return (
    <div className="adm">
      {authed && <AdminNav />}
      {authed && DATA_IS_EPHEMERAL && (
        <p className="error" style={{ margin: '1rem var(--pad) 0' }}>
          Демо-режим: сайт работает на хостинге без постоянного диска. Заказы, сообщения, правки и загруженные фото
          сохраняются ненадолго и сбросятся при перезапуске. Для настоящего магазина нужен свой сервер (см. deploy/VPS.md).
        </p>
      )}
      {children}
    </div>
  );
}
