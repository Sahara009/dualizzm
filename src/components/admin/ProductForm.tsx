'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import ImageUploader from './ImageUploader';

export default function ProductForm({ product }: { product: Product | null }) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [kind, setKind] = useState<'original' | 'print'>(product?.kind ?? 'original');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);
    const body = {
      title: f.get('title'),
      year: f.get('year'),
      medium: f.get('medium'),
      widthCm: f.get('widthCm'),
      heightCm: f.get('heightCm'),
      kind,
      price: f.get('price'),
      stock: kind === 'original' ? f.get('stockOriginal') : f.get('stock'),
      description: f.get('description'),
      images,
      featured: f.get('featured') === 'on',
      published: f.get('published') === 'on',
    };
    const res = await fetch(product ? `/api/admin/products/${product.id}` : '/api/admin/products', {
      method: product ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? 'Не получилось сохранить');
      setBusy(false);
      return;
    }
    router.push('/admin/products');
    router.refresh();
  }

  async function remove() {
    if (!product || !confirm(`Удалить «${product.title}»? Это нельзя отменить.`)) return;
    setBusy(true);
    await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
    router.push('/admin/products');
    router.refresh();
  }

  return (
    <form className="adm__form" onSubmit={submit}>
      <label className="field">
        <span>Название</span>
        <input name="title" required defaultValue={product?.title} />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Тип</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as 'original' | 'print')}>
            <option value="original">Оригинал (один экземпляр)</option>
            <option value="print">Принт (тираж)</option>
          </select>
        </label>
        {kind === 'original' ? (
          <label className="field">
            <span>Статус</span>
            <select name="stockOriginal" defaultValue={product ? String(Math.min(product.stock, 1)) : '1'}>
              <option value="1">В продаже</option>
              <option value="0">Продана</option>
            </select>
          </label>
        ) : (
          <label className="field">
            <span>Осталось в тираже</span>
            <input name="stock" type="number" min={0} defaultValue={product?.stock ?? 10} />
          </label>
        )}
      </div>

      <div className="field-row field-row--3">
        <label className="field">
          <span>Цена, ₽</span>
          <input name="price" type="number" min={0} step={1} required defaultValue={product?.price ?? ''} />
          <small>0 значит «цена по запросу»: работу видно, но купить нельзя.</small>
        </label>
        <label className="field">
          <span>Год</span>
          <input name="year" type="number" required defaultValue={product?.year ?? new Date().getFullYear()} />
        </label>
        <label className="field">
          <span>Техника</span>
          <input name="medium" placeholder="Холст, масло" defaultValue={product?.medium} />
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>Ширина, см</span>
          <input name="widthCm" type="number" min={0} step="0.1" defaultValue={product?.widthCm ?? ''} />
        </label>
        <label className="field">
          <span>Высота, см</span>
          <input name="heightCm" type="number" min={0} step="0.1" defaultValue={product?.heightCm ?? ''} />
        </label>
      </div>

      <label className="field">
        <span>Описание</span>
        <textarea name="description" defaultValue={product?.description} />
        <small>Пустая строка между абзацами делит текст на абзацы.</small>
      </label>

      <div className="field">
        <span>Фото</span>
        <ImageUploader value={images} onChange={setImages} />
      </div>

      <label className="check">
        <input name="featured" type="checkbox" defaultChecked={product?.featured ?? false} /> Показывать на главной
      </label>
      <label className="check">
        <input name="published" type="checkbox" defaultChecked={product?.published ?? true} /> Опубликована в каталоге
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="adm__actions">
        <button className="btn" disabled={busy}>
          {busy ? 'Сохраняем…' : 'Сохранить'}
        </button>
        <Link href="/admin/products" className="btn btn--ghost">
          Отмена
        </Link>
        {product && (
          <button type="button" className="btn btn--danger" onClick={remove} disabled={busy}>
            Удалить работу
          </button>
        )}
      </div>
    </form>
  );
}
