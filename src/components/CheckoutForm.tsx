'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DELIVERY } from '@/lib/config';
import { rub } from '@/lib/format';
import { useCart } from './CartProvider';

export default function CheckoutForm() {
  const { items, total, clear } = useCart();
  const [delivery, setDelivery] = useState<string>(DELIVERY[0].id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const method = DELIVERY.find((d) => d.id === delivery)!;
  const shipping = method.price;

  if (items.length === 0) {
    return (
      <div className="narrow">
        <p>В корзине пока ничего нет.</p>
        <Link href="/shop" className="btn">
          Открыть каталог
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? '');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, qty: i.qty })),
          customer: { name: get('name'), email: get('email'), phone: get('phone'), city: get('city'), address: get('address') },
          delivery,
          comment: get('comment'),
          agreeOffer: f.get('agreeOffer') === 'on',
          agreePd: f.get('agreePd') === 'on',
        }),
      });
      const data = (await res.json()) as { error?: string; paymentUrl?: string };
      if (!res.ok || !data.paymentUrl) {
        setError(data.error ?? 'Не получилось оформить заказ. Попробуй ещё раз.');
        setBusy(false);
        return;
      }
      clear(); // работы уже зарезервированы за заказом
      window.location.href = data.paymentUrl;
    } catch {
      setError('Нет связи с сервером. Проверь интернет и попробуй ещё раз.');
      setBusy(false);
    }
  }

  return (
    <div className="checkout">
      <form className="form" onSubmit={submit}>
        <div className="field-row">
          <label className="field">
            <span>Имя</span>
            <input name="name" required autoComplete="name" />
          </label>
          <label className="field">
            <span>Телефон</span>
            <input name="phone" type="tel" required autoComplete="tel" />
          </label>
        </div>
        <label className="field">
          <span>Почта</span>
          <input name="email" type="email" required autoComplete="email" />
          <small>Сюда придёт чек и номер отправления.</small>
        </label>

        <fieldset className="ship" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="ui" style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.35rem', padding: 0 }}>
            Доставка
          </legend>
          {DELIVERY.map((d) => (
            <label key={d.id}>
              <input type="radio" name="delivery" value={d.id} checked={delivery === d.id} onChange={() => setDelivery(d.id)} />
              <span>
                <b>{d.label}</b>
                <small>{d.note}</small>
              </span>
              <b>{d.price ? rub(d.price) : 'бесплатно'}</b>
            </label>
          ))}
        </fieldset>

        {method.needsAddress && (
          <div className="field-row">
            <label className="field">
              <span>Город</span>
              <input name="city" required autoComplete="address-level2" />
            </label>
            <label className="field">
              <span>Адрес и индекс</span>
              <input name="address" required autoComplete="street-address" />
            </label>
          </div>
        )}

        <label className="field">
          <span>Комментарий к заказу</span>
          <textarea name="comment" placeholder="Например, удобное время для связи" />
        </label>

        <div className="agree">
          <label className="check">
            <input type="checkbox" name="agreeOffer" required />
            <span>
              Я принимаю условия <Link href="/legal/offer" target="_blank">публичной оферты</Link> и{' '}
              <Link href="/legal/delivery" target="_blank">доставки и возврата</Link>
            </span>
          </label>
          <label className="check">
            <input type="checkbox" name="agreePd" required />
            <span>
              Даю <Link href="/legal/consent" target="_blank">согласие на обработку персональных данных</Link> на условиях{' '}
              <Link href="/legal/privacy" target="_blank">политики</Link>
            </span>
          </label>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="btn btn--block" disabled={busy}>
          {busy ? 'Создаём заказ…' : `Перейти к оплате, ${rub(total + shipping)}`}
        </button>
        <small className="note">После оплаты работа закрепляется за тобой. Пока ты на странице оплаты, мы держим её 30 минут.</small>
      </form>

      <aside className="summary" aria-label="Состав заказа">
        <h2>Заказ</h2>
        <ul>
          {items.map((i) => (
            <li key={i.id}>
              <span>
                {i.title}
                {i.qty > 1 ? ` × ${i.qty}` : ''}
              </span>
              <b>{rub(i.price * i.qty)}</b>
            </li>
          ))}
          <li>
            <span>Доставка</span>
            <b>{shipping ? rub(shipping) : '0 ₽'}</b>
          </li>
          <li className="total">
            <span>Итого</span>
            <span>{rub(total + shipping)}</span>
          </li>
        </ul>
      </aside>
    </div>
  );
}
