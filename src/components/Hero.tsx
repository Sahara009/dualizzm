'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { INTRO_EVENT, introIsDone } from '@/lib/intro';

type Props = { video: { src: string; poster: string }; line: string; year: number };

// Первый экран в духе архива: видео, синие плашки с заголовком и текстом, кнопки в скобках,
// внизу чёрная строка «FILE: 01/05 // ARCHIVE». Плашки выезжают, когда заканчивается заставка.
export default function Hero({ video, line, year }: Props) {
  const reduced = useReducedMotion();
  const [go, setGo] = useState(false);

  useEffect(() => {
    if (introIsDone()) {
      setGo(true);
      return;
    }
    const on = () => setGo(true);
    window.addEventListener(INTRO_EVENT, on);
    return () => window.removeEventListener(INTRO_EVENT, on);
  }, []);

  const step = (i: number) => ({
    initial: { clipPath: 'inset(0 100% 0 0)' },
    animate: go ? { clipPath: 'inset(0 0% 0 0)' } : undefined,
    transition: { duration: 0.55, delay: 0.25 + i * 0.18, ease: [0.76, 0, 0.24, 1] as [number, number, number, number] },
  });

  return (
    <section className="hero">
      <div className="hero__media">
        {reduced ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.poster} alt="" />
        ) : (
          <video src={video.src} poster={video.poster} autoPlay muted loop playsInline preload="auto" aria-hidden />
        )}
      </div>
      <div className="hero__shade" />

      <div className="hero__content">
        <motion.h1 className="tagbox" {...step(0)}>
          dualizzm // {year}
        </motion.h1>
        <motion.p className="textbox" {...step(1)}>
          {line}
        </motion.p>
        <motion.div className="hero__ctas" {...step(2)}>
          <Link href="/shop" className="btn">
            Смотреть работы
          </Link>
          <Link href="/about" className="btn btn--on-dark">
            Обо мне
          </Link>
        </motion.div>
      </div>

      <div className="filebar">
        <span>LOC: Moscow, metro</span>
        <span>File: 01/05 // Archive</span>
      </div>
      <noscript>
        <style>{'.hero .tagbox,.hero .textbox,.hero__ctas{clip-path:none!important}'}</style>
      </noscript>
    </section>
  );
}
