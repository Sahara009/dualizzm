'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

export default function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.get('name'),
          contact: f.get('contact'),
          message: f.get('message'),
          website: f.get('website') ?? '',
          agreePd: f.get('agreePd') === 'on',
        }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(d.error ?? 'Не получилось отправить. Попробуй ещё раз.');
        setBusy(false);
        return;
      }
      setSent(true);
    } catch {
      setError('Нет связи с сервером. Проверь интернет и попробуй ещё раз.');
      setBusy(false);
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <motion.div key="ok" className="contact__ok" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} role="status">
          <p className="display h-lg">Сообщение у меня</p>
          <p>Спасибо! Я прочитаю и отвечу на контакт, который ты оставил(а).</p>
        </motion.div>
      ) : (
        <motion.form key="form" className="form" onSubmit={submit} exit={{ opacity: 0, y: -12 }}>
          <div className="field-row">
            <label className="field">
              <span>Как тебя зовут</span>
              <input name="name" required autoComplete="name" />
            </label>
            <label className="field">
              <span>Почта, телеграм или телефон</span>
              <input name="contact" required />
            </label>
          </div>
          <label className="field">
            <span>Сообщение</span>
            <textarea name="message" required placeholder="Например: хочу узнать про работу «Метро»" />
          </label>
          {/* ловушка для ботов, человек это поле не видит */}
          <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden />
          <label className="check">
            <input type="checkbox" name="agreePd" required />
            <span>
              Даю <Link href="/legal/consent" target="_blank">согласие на обработку персональных данных</Link>, чтобы получить ответ
            </span>
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="btn" disabled={busy}>
            {busy ? 'Отправляю…' : 'Отправить сообщение'}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
