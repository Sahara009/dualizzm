'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';

type Opts = ConstructorParameters<typeof Lenis>[0];

// Плавная прокрутка. Если в системе включено «уменьшить движение», остаётся обычная.
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.95, anchors: true } as unknown as Opts);
    const w = window as unknown as { __lenis?: Lenis };
    w.__lenis = lenis;
    // если прокрутку уже заблокировали (заставка, корзина), Lenis тоже стоит
    if (document.documentElement.classList.contains('dz-locked')) lenis.stop();

    let id = requestAnimationFrame(function raf(t) {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      if (w.__lenis === lenis) delete w.__lenis;
    };
  }, []);
  return null;
}
