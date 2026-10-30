import crypto from 'node:crypto';
import { siteUrl } from './config';
import { getOrder, markPaid, setOrderStatus } from './db';
import type { Order } from './types';

const SHOP_ID = () => process.env.YOOKASSA_SHOP_ID;
const SECRET = () => process.env.YOOKASSA_SECRET_KEY;

export const yookassaEnabled = () => !!(SHOP_ID() && SECRET());

const authHeader = () => 'Basic ' + Buffer.from(`${SHOP_ID()}:${SECRET()}`).toString('base64');

type YkPayment = {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  confirmation?: { confirmation_url?: string };
  metadata?: { orderId?: string };
};

// Создаёт платёж и возвращает ссылку, куда отправить покупателя.
export async function createPayment(order: Order): Promise<{ paymentId: string; url: string }> {
  if (!yookassaEnabled()) {
    // Тестовый режим: страница-заглушка, пока не подключена ЮKassa.
    return { paymentId: `mock-${order.id}`, url: `${siteUrl()}/pay/mock/${order.id}` };
  }
  const res = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
      'Idempotence-Key': crypto.randomUUID(),
    },
    body: JSON.stringify({
      amount: { value: order.total.toFixed(2), currency: 'RUB' },
      capture: true,
      confirmation: { type: 'redirect', return_url: `${siteUrl()}/order/${order.id}` },
      description: `Заказ ${order.id} в dualizzm`,
      metadata: { orderId: order.id },
      ...(process.env.YOOKASSA_RECEIPTS === '1' ? { receipt: {
        customer: { email: order.customer.email, phone: order.customer.phone.replace(/[^\d+]/g, '') },
        items: [
          ...order.items.map((it) => ({
            description: it.title.slice(0, 128),
            quantity: String(it.qty),
            amount: { value: it.price.toFixed(2), currency: 'RUB' },
            vat_code: 1,
            payment_mode: 'full_payment',
            payment_subject: 'commodity',
          })),
          ...(order.shipping > 0
            ? [
                {
                  description: 'Доставка',
                  quantity: '1',
                  amount: { value: order.shipping.toFixed(2), currency: 'RUB' },
                  vat_code: 1,
                  payment_mode: 'full_payment',
                  payment_subject: 'service',
                },
              ]
            : []),
        ],
      } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`YooKassa ${res.status}: ${await res.text()}`);
  const p = (await res.json()) as YkPayment;
  const url = p.confirmation?.confirmation_url;
  if (!url) throw new Error('YooKassa не вернула ссылку на оплату');
  return { paymentId: p.id, url };
}

// Спрашиваем статус платежа у ЮKassa напрямую: так не нужно доверять входящему вебхуку.
export async function syncPayment(orderId: string): Promise<Order | null> {
  const order = getOrder(orderId);
  if (!order || order.status !== 'pending' || !order.paymentId || order.paymentId.startsWith('mock-')) return order;
  if (!yookassaEnabled()) return order;
  const res = await fetch(`https://api.yookassa.ru/v3/payments/${order.paymentId}`, {
    headers: { Authorization: authHeader() },
    cache: 'no-store',
  });
  if (!res.ok) return order;
  const p = (await res.json()) as YkPayment;
  if (p.metadata?.orderId !== order.id) return order;
  if (p.status === 'succeeded') return markPaid(order.id);
  if (p.status === 'canceled') return setOrderStatus(order.id, 'cancelled');
  return order;
}
