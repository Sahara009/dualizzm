'use client';

import { useEffect, useRef, useState } from 'react';
import { FIGURE_COLORS, FIGURE_H, FIGURE_SHARDS, FIGURE_W } from '@/lib/figure';

// Детерминированный рандом, чтобы сервер и браузер разбросали осколки одинаково.
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r = rng(29);
const SCATTER = FIGURE_SHARDS.map(([pts]) => {
  const xy = pts.split(' ').map((p) => p.split(',').map(Number));
  const cy = (xy[0][1] + xy[1][1] + xy[2][1]) / 3;
  return {
    x: Math.round((r() - 0.5) * 900),
    y: Math.round((r() - 0.65) * 700),
    rot: Math.round((r() - 0.5) * 540),
    s: (0.3 + r() * 0.9).toFixed(2),
    // собирается снизу вверх: ноги раньше головы
    delay: Math.round((1 - cy / FIGURE_H) * 900 + r() * 350),
  };
});

// Синяя сидящая девушка из осколков: разбросана, пока футер не на экране, и собирается, когда до него долистали.
export default function FooterFigure() {
  const ref = useRef<SVGSVGElement>(null);
  const [whole, setWhole] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setWhole(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setWhole(e.intersectionRatio > 0.35), { threshold: [0, 0.35, 0.6] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className={`shards ${whole ? 'is-whole' : ''}`}
      viewBox={`-60 -40 ${FIGURE_W + 120} ${FIGURE_H + 60}`}
      role="img"
      aria-label="Сидящая девушка, собранная из синих осколков"
    >
      {FIGURE_SHARDS.map(([pts, c], i) => {
        const s = SCATTER[i];
        return (
          <polygon
            key={i}
            points={pts}
            fill={FIGURE_COLORS[c]}
            style={
              {
                '--x': `${s.x}px`,
                '--y': `${s.y}px`,
                '--r': `${s.rot}deg`,
                '--s': s.s,
                '--d': `${s.delay}ms`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </svg>
  );
}
