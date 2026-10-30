import Link from 'next/link';
import AsciiPortrait from '@/components/AsciiPortrait';
import BrushBand from '@/components/BrushBand';
import Chronicle from '@/components/Chronicle';
import Hero from '@/components/Hero';
import InSitu from '@/components/InSitu';
import ScrollText from '@/components/ScrollText';
import Stack from '@/components/Stack';
import ScratchReveal from '@/components/ScratchReveal';
import TearReveal from '@/components/TearReveal';
import WorkCard from '@/components/WorkCard';
import { getSettings, listPosts, listProducts } from '@/lib/db';

export default function Home() {
  const all = listProducts();
  const s = getSettings();
  const featured = all.filter((p) => p.featured);
  const shelf = (featured.length ? featured : all).slice(0, 3);
  const firstPara = s.bio.split(/\n{2,}/)[0];
  const posts = listPosts();

  return (
    <Stack>
      <div className="stack__p">
        <Hero video={{ src: '/hero/hero.mp4', poster: '/hero/poster.jpg' }} line={s.heroLine} year={new Date().getFullYear()} />
      </div>

      <div className="stack__p">
        <div className="statement-wrap">
          <ScrollText text={s.statement} />
        </div>
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="section__head">
            <h2 className="display h-lg">Свежие работы</h2>
            <Link href="/shop" className="link-arrow">
              Весь каталог
            </Link>
          </div>
          <ul className="index">
            {shelf.map((p) => (
              <li key={p.id}>
                <WorkCard p={p} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="stack__p">
        <InSitu
          src="/hero/insitu.mp4"
          poster="/hero/insitu-poster.jpg"
          year={new Date().getFullYear()}
          href="/shop/metro"
          text="Я снимаю работы там, откуда они пришли. «Метро» на пару минут вернулась в метро, пока мимо шли поезда."
        />
      </div>

      <div className="stack__p">
        <BrushBand src="/textures/strokes-ink.jpg" text={s.bandHome} link={{ href: '/about', label: 'обо мне' }} />
      </div>

      <div className="stack__p">
        <section className="split">
          <div className="split__head">
            <h2 className="display h-lg">Процесс и результат</h2>
            <p>Слева я только начинаю дом, справа он уже собран. Веди курсор или палец, чтобы сдвинуть границу.</p>
          </div>
          <TearReveal
            back={{ src: '/works/process.jpg', alt: 'Лиза пишет работу «Дом» на вырезанных фрагментах', label: 'Процесс' }}
            front={{ src: '/works/dom.jpg', alt: 'Готовая работа «Дом»', label: 'Результат' }}
          />
        </section>
      </div>

      <div className="stack__p">
        <ScratchReveal image="/works/les.jpg" layer="/textures/strokes-ink.jpg" title="Лес" href="/shop/les" />
      </div>

      {posts.length > 0 && (
        <div className="stack__p">
          <Chronicle posts={posts.slice(0, 6)} total={posts.length} />
        </div>
      )}

      <div className="stack__p">
        <section className="teaser">
          <AsciiPortrait src={s.portrait || '/works/liza.jpg'} alt={`${s.artistName} с работой`} />
          <div className="teaser__text">
            <h2 className="display h-lg">Привет, я {s.artistName}</h2>
            <p className="prose">{firstPara}</p>
            <div className="adm__actions">
              <Link href="/about" className="btn">
                Обо мне и о процессе
              </Link>
              <Link href="/about#contact" className="btn btn--ghost">
                Написать мне
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Stack>
  );
}
