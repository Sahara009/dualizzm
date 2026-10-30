'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

// Мягкие засветы, как на старой плёнке: тёплое пятно света вспыхивает и гаснет
// в случайном месте раз в несколько секунд, плюс редкая царапина.

type Leak = { id: number; x: number; y: number; size: number; hue: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const HUES = [14, 22, 30, 8, 38];

export default function FilmFlash({ strength = 1 }: { strength?: number }) {
  const reduced = useReducedMotion();
  const [leak, setLeak] = useState<Leak | null>(null);

  useEffect(() => {
    if (reduced) return;
    let id = 0;
    let t = 0;
    const fire = () => {
      setLeak({ id: ++id, x: rand(8, 92), y: rand(10, 90), size: rand(45, 85), hue: HUES[Math.floor(Math.random() * HUES.length)] });
      t = window.setTimeout(fire, rand(4200, 8500));
    };
    t = window.setTimeout(fire, rand(700, 2400));
    return () => clearTimeout(t);
  }, [reduced]);

  if (reduced) return null;
  const k = strength;

  return (
    <div className="film" aria-hidden>
      <AnimatePresence>
        {leak && (
          <motion.div key={leak.id} className="film__burst" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="film__leak"
              style={{
                left: `${leak.x}%`,
                top: `${leak.y}%`,
                width: `${leak.size}vmax`,
                x: '-50%',
                y: '-50%',
                background: `radial-gradient(circle, hsla(${leak.hue}, 95%, 62%, 0.95) 0%, hsla(${leak.hue + 8}, 90%, 50%, 0.45) 35%, transparent 68%)`,
              }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: [0, 0.7 * k, 0.3 * k, 0.55 * k, 0], scale: [0.85, 1.02, 1, 1.06, 1.12] }}
              transition={{ duration: 2.8, times: [0, 0.18, 0.42, 0.66, 1], ease: 'easeInOut' }}
              onAnimationComplete={() => setLeak((cur) => (cur?.id === leak.id ? null : cur))}
            />
            <motion.div
              className="film__flash"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.16 * k, 0.04 * k, 0.12 * k, 0] }}
              transition={{ duration: 1.6, times: [0, 0.12, 0.3, 0.45, 1], ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="film__scratch" />
    </div>
  );
}
