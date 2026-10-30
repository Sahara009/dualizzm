'use client';

import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

type Side = { src: string; alt: string; label: string };

// Рваный край из первой версии главной. Слева процесс, справа результат,
// граница идёт за курсором или пальцем. С клавиатуры двигается стрелками.

const JAG = [0, -4, 3, -7, 2, 6, -3, 4, -6, 1, 7, -2, 3, -5, 2, -6, 4, -1];
const SPREAD = 0.7;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function tearPolygon(x: number) {
  const n = JAG.length;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const px = clamp(x + JAG[i] * SPREAD, 0, 100).toFixed(2);
    pts.push(`${px}% ${((i / n) * 100).toFixed(2)}%`, `${px}% ${(((i + 1) / n) * 100).toFixed(2)}%`);
  }
  return `polygon(${pts.join(',')},100% 100%,100% 0%)`;
}

export default function TearReveal({ back, front }: { back: Side; front: Side }) {
  const reduced = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const tear = useMotionValue(100);
  const spring = useSpring(tear, { stiffness: 120, damping: 22, mass: 0.6 });
  const clip = useTransform(spring, tearPolygon);
  const [value, setValue] = useState(50);
  const dragging = useRef(false);

  // граница отъезжает в середину, когда блок впервые появляется на экране
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      tear.set(50);
      spring.jump(50);
      return;
    }
    const ctl = animate(tear, 50, { duration: 1.4, ease: [0.76, 0, 0.24, 1] });
    return () => ctl.stop();
  }, [inView, reduced, tear, spring]);

  const setFromPointer = (clientX: number) => {
    const r = stage.current?.getBoundingClientRect();
    if (!r) return;
    const v = clamp(((clientX - r.left) / r.width) * 100, 4, 96);
    tear.set(v);
    setValue(Math.round(v));
  };

  return (
    <div
      ref={stage}
      className="split__stage"
      onPointerDown={(e) => {
        if (e.pointerType === 'touch') dragging.current = true;
        setFromPointer(e.clientX);
      }}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      onPointerMove={(e) => {
        if (e.pointerType === 'touch' && !dragging.current) return;
        setFromPointer(e.clientX);
      }}
    >
      <div className="split__layer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={back.src} alt={back.alt} loading="lazy" />
        <span className="split__tag split__tag--l">{back.label}</span>
      </div>
      <motion.div className="split__layer" style={{ clipPath: clip, WebkitClipPath: clip }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={front.src} alt={front.alt} loading="lazy" />
        <span className="split__tag split__tag--r">{front.label}</span>
      </motion.div>
      <input
        className="sr"
        type="range"
        min={4}
        max={96}
        value={value}
        aria-label={`Граница между «${back.label}» и «${front.label}»`}
        onChange={(e) => {
          const v = Number(e.target.value);
          setValue(v);
          tear.set(v);
        }}
      />
    </div>
  );
}
