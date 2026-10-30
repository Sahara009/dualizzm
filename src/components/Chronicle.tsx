import Link from 'next/link';
import { dayRu } from '@/lib/format';
import type { Post } from '@/lib/types';

// «Хроника»: блог Лизы, свёрстанный как газетная полоса.
export function Masthead({ count, date, as: H = 'h2' }: { count: number; date: string; as?: 'h1' | 'h2' }) {
  return (
    <header className="news__mast">
      <div className="news__meta">
        <span>Выпуск № {String(count).padStart(3, '0')}</span>
        <span>{date ? dayRu(date) : ''}</span>
        <span>Москва</span>
        <span>Цена: бесплатно</span>
      </div>
      <H className="news__title">Хроника</H>
      <p className="news__sub">
        <span>Новости мастерской dualizzm</span>
        <span>город · работы · выставки · процесс</span>
      </p>
    </header>
  );
}

export function PostLead({ p }: { p: Post }) {
  return (
    <article className="news__lead" data-cursor="читать">
      {p.image && (
        <div className="news__img">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image} alt="" loading="lazy" />
        </div>
      )}
      <div>
        <span className="news__rubric">{p.rubric || 'Хроника'}</span>
        <h3 className="news__h news__h--lead">
          <Link href={`/journal/${p.slug}`} className="cell__link">
            {p.title}
          </Link>
        </h3>
        <p className="news__ex">{p.excerpt}</p>
        <span className="news__date">{dayRu(p.date)}</span>
      </div>
    </article>
  );
}

export function PostItem({ p, img = false }: { p: Post; img?: boolean }) {
  return (
    <article className="news__item" data-cursor="читать">
      {img && p.image && (
        <div className="news__img news__img--sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image} alt="" loading="lazy" />
        </div>
      )}
      <span className="news__rubric">{p.rubric || 'Хроника'}</span>
      <h3 className="news__h">
        <Link href={`/journal/${p.slug}`} className="cell__link">
          {p.title}
        </Link>
      </h3>
      <p className="news__ex">{p.excerpt}</p>
      <span className="news__date">{dayRu(p.date)}</span>
    </article>
  );
}

// Секция на главной: шапка газеты, главная новость, колонка с двумя заметками и чёрная полоса «смотреть всё».
export default function Chronicle({ posts, total }: { posts: Post[]; total: number }) {
  if (!posts.length) return null;
  const [lead, ...rest] = posts;
  return (
    <section className="news">
      <Masthead count={total} date={lead.date} />
      <div className="news__grid">
        <PostLead p={lead} />
        <div className="news__col">
          {rest.slice(0, 2).map((p) => (
            <PostItem key={p.id} p={p} img />
          ))}
        </div>
        <div className="news__col news__col--brief">
          <span className="news__label">Коротко</span>
          {rest.slice(2, 5).map((p) => (
            <PostItem key={p.id} p={p} />
          ))}
        </div>
      </div>
      <Link href="/journal" className="news__all">
        <span>Смотреть все записи</span>
        <span aria-hidden>→</span>
      </Link>
    </section>
  );
}
