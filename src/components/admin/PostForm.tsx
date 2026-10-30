'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Post } from '@/lib/types';
import ImageUploader from './ImageUploader';

const today = () => new Date().toISOString().slice(0, 10);

export default function PostForm({ post }: { post: Post | null }) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(post?.image ? [post.image] : []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);
    const body = {
      title: f.get('title'),
      rubric: f.get('rubric'),
      date: f.get('date'),
      excerpt: f.get('excerpt'),
      body: f.get('body'),
      image: images[0] ?? '',
      published: f.get('published') === 'on',
    };
    const res = await fetch(post ? `/api/admin/posts/${post.id}` : '/api/admin/posts', {
      method: post ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? 'Не получилось сохранить');
      setBusy(false);
      return;
    }
    router.push('/admin/posts');
    router.refresh();
  }

  async function remove() {
    if (!post || !confirm(`Удалить запись «${post.title}»? Это нельзя отменить.`)) return;
    setBusy(true);
    await fetch(`/api/admin/posts/${post.id}`, { method: 'DELETE' });
    router.push('/admin/posts');
    router.refresh();
  }

  return (
    <form className="adm__form" onSubmit={submit}>
      <label className="field">
        <span>Заголовок</span>
        <input name="title" required defaultValue={post?.title} />
      </label>
      <div className="field-row">
        <label className="field">
          <span>Рубрика (Новости, Город, Мастерская, Выставки, Работы…)</span>
          <input name="rubric" defaultValue={post?.rubric ?? 'Новости'} maxLength={40} />
        </label>
        <label className="field">
          <span>Дата выпуска</span>
          <input name="date" type="date" required defaultValue={post?.date ?? today()} />
        </label>
      </div>
      <label className="field">
        <span>Подводка (1–2 предложения, видна в списке)</span>
        <textarea name="excerpt" rows={3} defaultValue={post?.excerpt} maxLength={500} />
      </label>
      <label className="field">
        <span>Текст (абзацы через пустую строку)</span>
        <textarea name="body" rows={14} defaultValue={post?.body} />
      </label>
      <div className="field">
        <span>Фото (одно, первое)</span>
        <ImageUploader value={images} onChange={(v) => setImages(v.slice(-1))} max={1} />
      </div>
      <label className="check">
        <input name="published" type="checkbox" defaultChecked={post?.published ?? true} /> Опубликована
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="adm__actions">
        <button className="btn" disabled={busy}>
          {busy ? 'Сохраняю…' : 'Сохранить'}
        </button>
        <Link href="/admin/posts" className="btn btn--ghost">
          Отмена
        </Link>
        {post && (
          <button type="button" className="btn btn--danger" onClick={remove} disabled={busy}>
            Удалить
          </button>
        )}
      </div>
    </form>
  );
}
