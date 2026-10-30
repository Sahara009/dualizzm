'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { dateRu } from '@/lib/format';
import type { Message } from '@/lib/types';

export default function MessageCard({ m }: { m: Message }) {
  const router = useRouter();
  const [read, setRead] = useState(m.read);
  const [busy, setBusy] = useState(false);

  async function toggleRead(next: boolean) {
    setRead(next);
    await fetch(`/api/admin/messages/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: next }),
    });
    router.refresh();
  }

  async function remove() {
    if (!confirm('Удалить сообщение? Это нельзя отменить.')) return;
    setBusy(true);
    await fetch(`/api/admin/messages/${m.id}`, { method: 'DELETE' });
    router.refresh();
  }

  const link = m.contact.includes('@') && !m.contact.startsWith('@') ? `mailto:${m.contact}` : m.contact.startsWith('@') ? `https://t.me/${m.contact.slice(1)}` : null;

  return (
    <details className="order-card" open={!m.read}>
      <summary>
        <span>{m.name}</span>
        <span>{m.contact}</span>
        <span className={`tag ${read ? '' : 'tag--ok'}`}>{read ? 'Прочитано' : 'Новое'}</span>
        <span>{dateRu(m.createdAt)}</span>
      </summary>
      <div className="order-card__body">
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{m.message}</p>
        <div className="adm__actions">
          {link && (
            <a className="btn btn--sm" href={link} target="_blank" rel="noopener noreferrer">
              Ответить
            </a>
          )}
          <button className="btn btn--sm btn--ghost" onClick={() => toggleRead(!read)}>
            {read ? 'Отметить новым' : 'Отметить прочитанным'}
          </button>
          <button className="btn btn--sm btn--danger" onClick={remove} disabled={busy}>
            Удалить
          </button>
        </div>
      </div>
    </details>
  );
}
