import OrderCard from '@/components/admin/OrderCard';
import { listOrders } from '@/lib/db';
import { rub } from '@/lib/format';

export default function AdminOrders() {
  const orders = listOrders();
  const paid = orders.filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'done');
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  return (
    <div className="adm__main">
      <h1>Заказы</h1>
      <p className="note">
        Оплачено заказов: {paid.length}, на сумму {rub(revenue)}. Новые оплаченные заказы раскрыты.
      </p>
      {orders.length === 0 ? (
        <p className="empty">Заказов пока нет. Они появятся здесь, когда кто-нибудь оформит первый.</p>
      ) : (
        orders.map((o) => <OrderCard key={o.id} order={o} />)
      )}
    </div>
  );
}
