'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Settings } from '@/lib/types';
import ImageUploader from './ImageUploader';

export default function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [portrait, setPortrait] = useState<string[]>(settings.portrait ? [settings.portrait] : []);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const f = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artistName: f.get('artistName'),
        heroLine: f.get('heroLine'),
        statement: f.get('statement'),
        bio: f.get('bio'),
        worksText: f.get('worksText'),
        processText: f.get('processText'),
        processSteps: f.get('processSteps'),
        bandHome: f.get('bandHome'),
        bandAbout: f.get('bandAbout'),
        instagram: f.get('instagram'),
        telegram: f.get('telegram'),
        email: f.get('email'),
        portrait: portrait[0] ?? '',
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setMsg({ ok: false, text: 'Не получилось сохранить. Проверь поля.' });
      return;
    }
    setMsg({ ok: true, text: 'Сохранено' });
    router.refresh();
  }

  return (
    <form className="adm__form" onSubmit={submit}>
      <label className="field">
        <span>Имя художницы</span>
        <input name="artistName" required defaultValue={settings.artistName} />
      </label>
      <p className="note" style={{ margin: 0 }}>Все тексты пишутся от первого лица. Пустая строка между абзацами делит текст на абзацы.</p>
      <label className="field">
        <span>Первый экран: пара строк о себе</span>
        <textarea name="heroLine" defaultValue={settings.heroLine} />
      </label>
      <label className="field">
        <span>Фраза на главной</span>
        <textarea name="statement" defaultValue={settings.statement} />
        <small>Большой текст, который проявляется при прокрутке. Лучше 20–40 слов.</small>
      </label>
      <label className="field">
        <span>Обо мне</span>
        <textarea name="bio" style={{ minHeight: '12rem' }} defaultValue={settings.bio} />
        <small>Первый абзац показывается ещё и на главной.</small>
      </label>
      <label className="field">
        <span>О работах</span>
        <textarea name="worksText" style={{ minHeight: '10rem' }} defaultValue={settings.worksText} />
      </label>
      <label className="field">
        <span>Процесс: вступление</span>
        <textarea name="processText" defaultValue={settings.processText} />
      </label>
      <label className="field">
        <span>Процесс: шаги</span>
        <textarea name="processSteps" defaultValue={settings.processSteps} />
        <small>Каждый шаг с новой строки.</small>
      </label>
      <div className="field-row">
        <label className="field">
          <span>Полоса мазков на главной</span>
          <textarea name="bandHome" defaultValue={settings.bandHome} />
        </label>
        <label className="field">
          <span>Полоса мазков в «Обо мне»</span>
          <textarea name="bandAbout" defaultValue={settings.bandAbout} />
        </label>
      </div>
      <div className="field-row field-row--3">
        <label className="field">
          <span>Instagram</span>
          <input name="instagram" placeholder="ник без @" defaultValue={settings.instagram} />
        </label>
        <label className="field">
          <span>Телеграм</span>
          <input name="telegram" placeholder="ник без @" defaultValue={settings.telegram} />
        </label>
        <label className="field">
          <span>Почта для связи</span>
          <input name="email" type="email" defaultValue={settings.email} />
        </label>
      </div>
      <div className="field">
        <span>Портрет или фото из мастерской</span>
        <ImageUploader value={portrait} onChange={(v) => setPortrait(v.slice(-1))} max={2} />
      </div>
      {msg && (
        <p className={msg.ok ? 'tag tag--ok' : 'error'} role="status">
          {msg.text}
        </p>
      )}
      <div className="adm__actions">
        <button className="btn" disabled={busy}>
          {busy ? 'Сохраняем…' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
}
