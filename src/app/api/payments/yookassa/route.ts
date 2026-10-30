import { NextResponse } from 'next/server';
import { syncPayment } from '@/lib/payments';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Вебхук ЮKassa: в личном кабинете укажи адрес https://ТВОЙ-САЙТ/api/payments/yookassa
// и события payment.succeeded, payment.canceled.
// Данные из тела запроса не используем: только находим заказ и сами спрашиваем статус у ЮKassa.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { object?: { id?: string } } | null;
  const paymentId = body?.object?.id;
  if (!paymentId) return NextResponse.json({ ok: true });
  const row = db.prepare('SELECT id FROM orders WHERE payment_id = ?').get(paymentId) as { id: string } | undefined;
  if (row) await syncPayment(row.id);
  return NextResponse.json({ ok: true });
}
