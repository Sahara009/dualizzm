import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import MockPayButton from '@/components/MockPayButton';
import { getOrder } from '@/lib/db';
import { rub } from '@/lib/format';
import { yookassaEnabled } from '@/lib/payments';

export const metadata: Metadata = { title: 'Тестовая оплата', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function MockPayPage({ params }: { params: Promise<{ id: string }> }) {
  if (yookassaEnabled()) notFound();
  const order = getOrder((await params).id);
  if (!order) notFound();
  if (order.status !== 'pending') redirect(`/order/${order.id}`);

  return (
    <div className="page-top">
      <div className="narrow">
        <h1 className="display h-lg" style={{ marginBottom: '1.2rem' }}>
          Тестовая оплата
        </h1>
        <p>Ключи ЮKassa ещё не подключены, поэтому деньги не списываются. Нажми кнопку, чтобы посмотреть, как выглядит успешный заказ.</p>
        <div className="box" style={{ margin: '1.4rem 0' }}>
          <p className="box__line">
            <span>Заказ {order.id}</span>
            <b>{rub(order.total)}</b>
          </p>
        </div>
        <MockPayButton orderId={order.id} />
      </div>
    </div>
  );
}
