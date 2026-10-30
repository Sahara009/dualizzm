import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostItem } from '@/components/Chronicle';
import { getPostBySlug, listPosts } from '@/lib/db';
import { dayRu } from '@/lib/format';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getPostBySlug((await params).slug);
  return p ? { title: p.title, description: p.excerpt } : {};
}

export default async function PostPage({ params }: Props) {
  const p = getPostBySlug((await params).slug);
  if (!p || !p.published) notFound();
  const more = listPosts().filter((x) => x.id !== p.id).slice(0, 3);
  const paras = p.body.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean);

  return (
    <div className="page-top news news--page">
      <article className="post">
        <Link href="/journal" className="back">
          Хроника
        </Link>
        <span className="news__rubric">{p.rubric || 'Хроника'}</span>
        <h1 className="post__title">{p.title}</h1>
        {p.excerpt && <p className="post__lede">{p.excerpt}</p>}
        <p className="news__date">
          {dayRu(p.date)} · текст: Лиза
        </p>
        {p.image && (
          <figure className="post__img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt="" />
          </figure>
        )}
        <div className="post__body">
          {paras.map((t, i) => (
            <p key={i}>{t}</p>
          ))}
        </div>
      </article>
      {more.length > 0 && (
        <section className="post__more">
          <h2 className="news__label">Ещё в выпуске</h2>
          <div className="news__list">
            {more.map((x) => (
              <PostItem key={x.id} p={x} img />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
