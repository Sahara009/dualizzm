import type { Metadata } from 'next';
import CheckoutForm from '@/components/CheckoutForm';

export const metadata: Metadata = { title: 'Оформление заказа' };

export default function CheckoutPage() {
  return (
    <div className="page-top">
      <div className="section" style={{ paddingBottom: 0, paddingTop: 0 }}>
        <h1 className="display h-xl" style={{ marginBottom: 'clamp(24px, 4vw, 48px)' }}>
          Заказ
        </h1>
      </div>
      <CheckoutForm />
    </div>
  );
}
