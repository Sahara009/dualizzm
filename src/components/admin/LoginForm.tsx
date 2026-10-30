'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const password = String(new FormData(e.currentTarget).get('password') ?? '');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? 'Не получилось войти');
      setBusy(false);
      return;
    }
    router.push('/admin/orders');
    router.refresh();
  }

  return (
    <form className="login" onSubmit={submit}>
      <h1 className="display h-lg">Вход</h1>
      <label className="field">
        <span>Пароль</span>
        <input name="password" type="password" required autoFocus autoComplete="current-password" />
      </label>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn--block" disabled={busy}>
        {busy ? 'Входим…' : 'Войти'}
      </button>
    </form>
  );
}
