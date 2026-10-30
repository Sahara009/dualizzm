'use client';

import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { finishIntro } from '@/lib/intro';
import { lockScroll } from '@/lib/scroll';

// Заставка в три такта:
// 1) «зависание»: по чёрному экрану на сетке вылезают и дёргаются брутальные вставки
//    (синие плиты, белые рамки и блоки, штрихкоды, счётчик, застывший на 037%);
// 2) экран чистый, логотип появляется по одной букве с синей вспышкой;
// 3) по экрану бегут трещины, он раскалывается на осколки, они разлетаются, и открывается сайт.
// Показывается один раз за вкладку.

type Phase = 'hang' | 'logo' | 'crack' | 'shatter' | 'gone';
const WORD = 'dualizzm'.split('');
const LETTER_MS = 110;

// детерминированный «случай»: одинаковый на сервере и в браузере
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Вставки «зависания» в духе модерн + брутализм: сетка, жёсткие синие плиты, белые рамки
// с моно-текстом, сплошные белые блоки, штрихкоды, застывшие плоские «следы». Всё по сетке,
// без мягких теней и фото. Координаты в процентах экрана, t — когда вылезает (мс).
type Kind = 'slab' | 'box' | 'block' | 'code' | 'trail' | 'cross' | 'count';
type Insert = { kind: Kind; x: number; y: number; w: number; h: number; t: number; text?: string };

const INSERTS: Insert[] = [
  { kind: 'slab', x: 0, y: 8.33, w: 41.66, h: 16.66, t: 80, text: 'SYS // 01' },
  { kind: 'box', x: 50, y: 8.33, w: 25, h: 8.33, t: 180, text: '[ LOADING ]' },
  { kind: 'code', x: 75, y: 8.33, w: 16.66, h: 8.33, t: 260 },
  { kind: 'block', x: 58.33, y: 25, w: 33.33, h: 16.66, t: 360, text: 'NO SIGNAL' },
  { kind: 'cross', x: 45, y: 30, w: 4, h: 6, t: 420 },
  { kind: 'trail', x: 8.33, y: 33.33, w: 25, h: 12.5, t: 520, text: 'ERR_TIMEOUT' },
  { kind: 'box', x: 66.66, y: 50, w: 16.66, h: 8.33, t: 610, text: '01/05' },
  { kind: 'slab', x: 83.33, y: 50, w: 16.67, h: 33.33, t: 700, text: '0x2F' },
  { kind: 'code', x: 0, y: 58.33, w: 33.33, h: 4.16, t: 780 },
  { kind: 'block', x: 33.33, y: 50, w: 25, h: 8.33, t: 860, text: 'МОСКВА' },
  { kind: 'box', x: 50, y: 87.5, w: 33.33, h: 8.33, t: 950, text: 'FRAGMENT 03 — NOT FOUND' },
  { kind: 'cross', x: 90, y: 88, w: 4, h: 6, t: 1010 },
  { kind: 'trail', x: 58.33, y: 70.83, w: 16.66, h: 8.33, t: 1080, text: 'RETRY' },
  { kind: 'count', x: 0, y: 75, w: 66, h: 25, t: 140, text: '037%' },
];

// Осколки: лучи из точки удара и кольца вокруг неё. Вершины общие у соседей, поэтому осколки
// складываются в экран без щелей. Координаты в процентах экрана.
const CX = 52;
const CY = 47;
const ANGLES = [0, 38, 79, 117, 158, 203, 241, 283, 321].map((a) => (a * Math.PI) / 180);
const RINGS = [0, 13, 33, 170];
const JIT = mulberry32(5);
const VERT = ANGLES.map((a) => RINGS.map((rad, k) => {
  const rr = k === 0 || k === RINGS.length - 1 ? rad : rad * (0.8 + JIT() * 0.45);
  const aa = k === 0 ? a : a + (JIT() - 0.5) * 0.12;
  return [CX + Math.cos(aa) * rr, CY + Math.sin(aa) * rr] as [number, number];
}));
const fmt = (p: [number, number]) => `${p[0].toFixed(2)}% ${p[1].toFixed(2)}%`;

type Shard = { clip: string; ring: number; mid: number; spin: number };
const SHARDS: Shard[] = (() => {
  const out: Shard[] = [];
  const n = ANGLES.length;
  const r = mulberry32(11);
  for (let k = 0; k < RINGS.length - 1; k++) {
    for (let j = 0; j < n; j++) {
      const j2 = (j + 1) % n;
      const a0 = ANGLES[j];
      const a1 = j2 === 0 ? ANGLES[0] + Math.PI * 2 : ANGLES[j2];
      const pts = k === 0 ? [VERT[j][0], VERT[j][1], VERT[j2][1]] : [VERT[j][k], VERT[j][k + 1], VERT[j2][k + 1], VERT[j2][k]];
      out.push({ clip: `polygon(${pts.map(fmt).join(',')})`, ring: k, mid: (a0 + a1) / 2, spin: (r() - 0.5) * 70 });
    }
  }
  return out;
})();

// линии трещин: лучи и куски колец
const CRACKS: string[] = (() => {
  const lines: string[] = [];
  const n = ANGLES.length;
  for (let j = 0; j < n; j++) lines.push(`M ${VERT[j].map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ')}`);
  for (let k = 1; k < RINGS.length - 1; k++)
    for (let j = 0; j < n; j++) {
      const a = VERT[j][k];
      const b = VERT[(j + 1) % n][k];
      lines.push(`M ${a[0].toFixed(2)} ${a[1].toFixed(2)} L ${b[0].toFixed(2)} ${b[1].toFixed(2)}`);
    }
  return lines;
})();

function Letters({ animated }: { animated: boolean }) {
  return (
    <div className="pl__letters">
      {WORD.map((ch, i) =>
        animated ? (
          <motion.span
            key={i}
            style={{ '--d': `${i * LETTER_MS}ms` } as React.CSSProperties}
            initial={{ opacity: 0, scale: 1.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.16, delay: (i * LETTER_MS) / 1000, ease: [0.2, 0.9, 0.2, 1] }}
          >
            {ch}
          </motion.span>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </div>
  );
}

export default function Preloader() {
  const [phase, setPhase] = useState<Phase>('hang');
  const timers = useRef<number[]>([]);

  const go = (p: Phase, ms: number) => timers.current.push(window.setTimeout(() => setPhase((cur) => (cur === 'gone' || cur === 'shatter' ? cur : p)), ms));

  useEffect(() => {
    if (document.documentElement.classList.contains('dz-seen')) {
      setPhase('gone');
      return;
    }
    try {
      sessionStorage.setItem('dz-intro', '1');
    } catch {
      /* покажем ещё раз — не страшно */
    }
    lockScroll(true);
    const logoAt = 1550;
    const crackAt = logoAt + WORD.length * LETTER_MS + 450;
    go('logo', logoAt);
    go('crack', crackAt);
    go('shatter', crackAt + 330);
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== 'shatter') return;
    finishIntro();
    lockScroll(false);
    const t = window.setTimeout(() => setPhase('gone'), 1300);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'gone') return null;
  const shattering = phase === 'shatter';

  return (
    <motion.div
      className="preloader"
      aria-hidden
      onClick={() => setPhase((p) => (p === 'shatter' ? p : 'shatter'))}
      animate={phase === 'crack' ? { x: [0, -10, 8, -5, 3, 0], y: [0, 4, -6, 3, -1, 0] } : { x: 0, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!shattering && <div className="pl__bg" />}

      {phase === 'hang' && <div className="pl__grid" />}
      {phase === 'hang' &&
        INSERTS.map((it, i) => (
          <div
            key={i}
            className={`pl__insert pl__insert--${it.kind}`}
            style={{
              left: `${it.x}%`,
              top: `${it.y}%`,
              width: `${it.w}%`,
              height: `${it.h}%`,
              animationDelay: `${it.t}ms, ${it.t}ms`,
            }}
          >
            {it.kind === 'slab' && <small>{it.text}</small>}
            {(it.kind === 'box' || it.kind === 'block' || it.kind === 'trail' || it.kind === 'count') && it.text}
          </div>
        ))}

      {(phase === 'logo' || phase === 'crack') && (
        <div className="pl__word">
          <Letters animated />
        </div>
      )}

      {phase === 'crack' && (
        <svg className="pl__cracks" viewBox="0 0 100 100" preserveAspectRatio="none">
          {CRACKS.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              fill="none"
              stroke="#fff"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.22, delay: i < ANGLES.length ? 0 : 0.08, ease: 'easeOut' }}
            />
          ))}
        </svg>
      )}

      {shattering &&
        SHARDS.map((s, i) => {
          const dist = 380 + s.ring * 260;
          return (
            <motion.div
              key={i}
              className="pl__shard"
              style={{ clipPath: s.clip, WebkitClipPath: s.clip }}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={{ x: Math.cos(s.mid) * dist, y: Math.sin(s.mid) * dist + 260, rotate: s.spin, opacity: 0 }}
              transition={{ duration: 1.05, delay: s.ring * 0.06, ease: [0.55, 0, 0.85, 0.35] }}
            >
              <div className="pl__shard-word">
                <Letters animated={false} />
              </div>
            </motion.div>
          );
        })}
    </motion.div>
  );
}
