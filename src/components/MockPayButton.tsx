'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function MockPayButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function pay() {
    setBusy(true);
    setError('');
    const res = await fetch('/api/payments/mock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? 'Не получилось провести оплату');
      setBusy(false);
      return;
    }
    router.push(`/order/${orderId}`);
  }

  return (
    <>
      <button className="btn btn--block" onClick={pay} disabled={busy}>
        {busy ? 'Проводим…' : 'Оплатить (тест)'}
      </button>
      {error && <p className="error">{error}</p>}
    </>
  );
}
