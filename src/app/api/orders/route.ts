import { NextResponse } from 'next/server';
import { OrderError, createOrder, setOrderStatus, setPayment } from '@/lib/db';
import { createPayment } from '@/lib/payments';
import { orderSchema } from '@/lib/schemas';
import { deliveryById } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const parsed = orderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Проверь данные' }, { status: 400 });
  }
  const input = parsed.data;
  if (deliveryById(input.delivery)?.needsAddress && (!input.customer.city || !input.customer.address)) {
    return NextResponse.json({ error: 'Для доставки нужны город и адрес' }, { status: 400 });
  }

  let order;
  try {
    order = createOrder(input);
  } catch (e) {
    if (e instanceof OrderError) return NextResponse.json({ error: e.message }, { status: 409 });
    throw e;
  }

  try {
    const { paymentId, url } = await createPayment(order);
    setPayment(order.id, paymentId, url);
    return NextResponse.json({ orderId: order.id, paymentUrl: url });
  } catch (e) {
    console.error('payment create failed', e);
    setOrderStatus(order.id, 'cancelled'); // возвращаем работы в продажу
    return NextResponse.json({ error: 'Не получилось создать оплату. Попробуй ещё раз через минуту.' }, { status: 502 });
  }
}
