'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DELIVERY } from '@/lib/config';
import { dateRu, rub } from '@/lib/format';
import { STATUS_LABEL, type Order, type OrderStatus } from '@/lib/types';

export default function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const delivery = DELIVERY.find((d) => d.id === order.delivery)?.label ?? order.delivery;
  const c = order.customer;

  async function change(next: OrderStatus) {
    if (next === 'cancelled' && !confirm('Отменить заказ? Работы вернутся в каталог.')) return;
    setBusy(true);
    setError('');
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? 'Не получилось сменить статус');
    } else {
      setStatus(next);
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <details className="order-card" open={status === 'paid'}>
      <summary>
        <span>{order.id}</span>
        <span>{c.name}</span>
        <span>{rub(order.total)}</span>
        <span className={`tag ${status === 'paid' ? 'tag--ok' : status === 'cancelled' ? 'tag--bad' : ''}`}>{STATUS_LABEL[status]}</span>
        <span>{dateRu(order.createdAt)}</span>
      </summary>
      <div className="order-card__body">
        <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
          {order.items.map((it) => (
            <li key={it.productId}>
              {it.title}
              {it.qty > 1 ? ` × ${it.qty}` : ''}, {rub(it.price * it.qty)}
            </li>
          ))}
          <li>
            Доставка ({delivery}), {rub(order.shipping)}
          </li>
        </ul>
        <div>
          <b>{c.name}</b>, <a href={`tel:${c.phone}`}>{c.phone}</a>, <a href={`mailto:${c.email}`}>{c.email}</a>
          {(c.city || c.address) && (
            <div>
              {c.city}, {c.address}
            </div>
          )}
          {order.comment && <div className="note">Комментарий: {order.comment}</div>}
        </div>
        <div className="adm__actions">
          <label className="field" style={{ minWidth: '14rem' }}>
            <span>Статус заказа</span>
            <select value={status} disabled={busy} onChange={(e) => change(e.target.value as OrderStatus)}>
              {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && <p className="error">{error}</p>}
      </div>
    </details>
  );
}
