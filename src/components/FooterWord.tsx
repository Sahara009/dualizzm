'use client';

import { useEffect, useRef, useState } from 'react';
import { WORD_COLORS, WORD_H, WORD_SHARDS, WORD_W } from '@/lib/wordmark';

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
const SCATTER = WORD_SHARDS.map(([pts]) => {
  const xs = pts.split(' ').map((p) => Number(p.split(',')[0]));
  const cx = (xs[0] + xs[1] + xs[2]) / 3;
  return {
    x: Math.round((r() - 0.5) * 520),
    y: Math.round(-60 - r() * 420),
    rot: Math.round((r() - 0.5) * 540),
    s: (0.3 + r() * 0.9).toFixed(2),
    // собирается слева направо, буква за буквой, с небольшим разбросом
    delay: Math.round((cx / WORD_W) * 900 + r() * 380),
  };
});

// Надпись dualizzm в футере: разбросана осколками, пока футер не на экране,
// и собирается из них, когда до него долистали. Растянута ровно на ширину экрана.
export default function FooterWord() {
  const ref = useRef<SVGSVGElement>(null);
  const [whole, setWhole] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setWhole(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setWhole(e.isIntersecting && e.intersectionRatio > 0.5), { threshold: [0, 0.5, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg ref={ref} className={`footer__word shards ${whole ? 'is-whole' : ''}`} viewBox={`0 0 ${WORD_W} ${WORD_H}`} role="img" aria-label="dualizzm">
      {WORD_SHARDS.map(([pts, c], i) => {
        const s = SCATTER[i];
        return (
          <polygon
            key={i}
            points={pts}
            fill={WORD_COLORS[c]}
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
