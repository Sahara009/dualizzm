'use client';

import { useRef, useState } from 'react';

type Props = { value: string[]; onChange: (v: string[]) => void; max?: number };

export default function ImageUploader({ value, onChange, max = 12 }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(files: FileList | File[]) {
    setBusy(true);
    setError('');
    let next = [...value];
    for (const file of Array.from(files)) {
      if (next.length >= max) break;
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const d = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !d.url) {
        setError(`${file.name}: ${d.error ?? 'не загрузилось'}`);
        continue;
      }
      next = [...next, d.url];
      onChange(next);
    }
    setBusy(false);
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="uploader">
      <div
        className="uploader__drop"
        data-over={over}
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          void upload(e.dataTransfer.files);
        }}
      >
        {busy ? 'Загружаем…' : 'Перетащи фото сюда или нажми, чтобы выбрать'}
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => e.target.files && void upload(e.target.files)} />
      </div>
      {error && <p className="error">{error}</p>}
      {value.length > 0 && (
        <>
          <div className="uploader__list">
            {value.map((src, i) => (
              <div key={src} className="uploader__item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Фото ${i + 1}`} />
                <div>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Сдвинуть влево">←</button>
                  <button type="button" onClick={() => onChange(value.filter((s) => s !== src))} aria-label="Удалить фото">×</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Сдвинуть вправо">→</button>
                </div>
              </div>
            ))}
          </div>
          <small>Первое фото показывается в каталоге и на главной.</small>
        </>
      )}
    </div>
  );
}
