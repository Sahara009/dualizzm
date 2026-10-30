'use client';

import { useEffect, useRef } from 'react';

// Секции «стопкой» (каждая обёрнута в <div className="stack__p">): каждая прилипает, когда её низ дошёл до низа экрана (короткие — к верху),
// а следующая наезжает сверху. Накрываемая секция плавно темнеет и чуть уменьшается (--o от 0 до 1).
export default function Stack({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const ps = Array.from(root.children) as HTMLElement[];
    let vh = window.innerHeight;

    const measure = () => {
      vh = window.innerHeight;
      ps.forEach((p) => p.style.setProperty('--stick', `${Math.min(0, vh - p.offsetHeight)}px`));
    };
    let raf = 0;
    const tick = () => {
      raf = 0;
      for (let i = 0; i < ps.length - 1; i++) {
        const cover = ps[i].getBoundingClientRect().bottom - ps[i + 1].getBoundingClientRect().top;
        const o = Math.min(1, Math.max(0, cover / vh));
        ps[i].style.setProperty('--o', o.toFixed(3));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ps.forEach((p) => ro.observe(p));
    window.addEventListener('resize', measure);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) window.addEventListener('scroll', onScroll, { passive: true });
    measure();
    tick();

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="stack">
      {children}
    </div>
  );
}
