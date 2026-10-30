import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OrderRefresh from '@/components/OrderRefresh';
import { getOrder } from '@/lib/db';
import { rub } from '@/lib/format';
import { syncPayment } from '@/lib/payments';
import { STATUS_LABEL } from '@/lib/types';

export const metadata: Metadata = { title: 'Заказ', robots: { index: false } };
export const dynamic = 'force-dynamic';

const HEADLINE = {
  pending: 'Ждём оплату',
  paid: 'Оплата прошла',
  shipped: 'Заказ отправлен',
  done: 'Заказ получен',
  cancelled: 'Заказ отменён',
} as const;

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = (await syncPayment(id)) ?? getOrder(id);
  if (!order) notFound();

  return (
    <div className="page-top">
      <div className="narrow">
        <h1 className="display h-lg" style={{ marginBottom: '1.4rem' }}>
          {HEADLINE[order.status]}
        </h1>

        {order.status === 'paid' && <p>Спасибо! Подтверждение отправим на {order.customer.email}. Номер отправления пришлём туда же, как только работа поедет к тебе.</p>}
        {order.status === 'pending' && (
          <>
            <p>Заказ создан, но оплата ещё не пришла. Эта страница обновится сама, когда платёж пройдёт.</p>
            {order.paymentUrl && (
              <p>
                <a className="btn" href={order.paymentUrl}>
                  Перейти к оплате
                </a>
              </p>
            )}
            <OrderRefresh />
          </>
        )}
        {order.status === 'cancelled' && <p>Оплата не прошла или время резерва вышло, работы вернулись в каталог. Оформи заказ заново, если они ещё нужны.</p>}

        <div className="box" style={{ marginTop: '1.6rem' }}>
          <p className="box__line">
            <b>Заказ {order.id}</b>
            <span>{STATUS_LABEL[order.status]}</span>
          </p>
          {order.items.map((it) => (
            <p key={it.productId} className="box__line">
              <span>
                {it.title}
                {it.qty > 1 ? ` × ${it.qty}` : ''}
              </span>
              <b>{rub(it.price * it.qty)}</b>
            </p>
          ))}
          <p className="box__line">
            <span>Доставка</span>
            <b>{rub(order.shipping)}</b>
          </p>
          <p className="box__line">
            <b>Итого</b>
            <b>{rub(order.total)}</b>
          </p>
        </div>
      </div>
    </div>
  );
}
