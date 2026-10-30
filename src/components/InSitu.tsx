'use client';

import Link from 'next/link';
import { useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';

type Props = { src: string; poster: string; text: string; href: string; year: number };

// «В среде»: работа на своём месте, в метро. Оформлено как запись архива по референсу.
// Видео играет только пока секция на экране, чтобы не грузить телефон.
export default function InSitu({ src, poster, text, href, year }: Props) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) void v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <section className="insitu" aria-label="Работа в среде">
      {reduced ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" />
      ) : (
        <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" aria-hidden />
      )}
      <div className="insitu__shade" />
      <p className="liveline">
        <em>LIVE</em> 2 &gt; Метро — работа в среде \ LOC: Moscow, metro
      </p>
      <div className="hero__content">
        <h2 className="tagbox">В среде // {year}</h2>
        <p className="textbox">{text}</p>
        <Link href={href} className="btn">
          Смотреть работу
        </Link>
      </div>
      <div className="filebar">
        <span>Метро, работа на месте</span>
        <span>File: 02/05 // Archive</span>
      </div>
    </section>
  );
}
