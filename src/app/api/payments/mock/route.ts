import { NextResponse } from 'next/server';
import { markPaid } from '@/lib/db';
import { yookassaEnabled } from '@/lib/payments';

export const dynamic = 'force-dynamic';

// Тестовая «оплата». Отключается сама, как только заданы ключи ЮKassa.
export async function POST(req: Request) {
  if (yookassaEnabled()) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { orderId } = (await req.json().catch(() => ({}))) as { orderId?: string };
  if (!orderId) return NextResponse.json({ error: 'Нет номера заказа' }, { status: 400 });
  const order = markPaid(orderId);
  if (!order) return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
  return NextResponse.json({ ok: true, status: order.status });
}
