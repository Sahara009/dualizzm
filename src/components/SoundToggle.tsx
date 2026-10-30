'use client';

import { useEffect, useRef, useState } from 'react';
import { MUSIC } from '@/lib/config';

const KEY = 'dz-sound';
const VOLUME = 0.45;

// Кнопка фоновой музыки. Браузеры не дают играть звук до первого действия человека,
// поэтому музыка включается по нажатию. Выбор запоминается: если звук был включён,
// он продолжит играть после первого клика или нажатия клавиши на сайте.
export default function SoundToggle() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const track = useRef(0);
  const fadeRaf = useRef(0);
  const [on, setOn] = useState(false);

  const ensure = () => {
    if (audio.current) return audio.current;
    const a = new Audio(MUSIC[0].src);
    a.preload = 'auto';
    a.volume = 0;
    a.loop = MUSIC.length === 1;
    a.addEventListener('ended', () => {
      track.current = (track.current + 1) % MUSIC.length;
      a.src = MUSIC[track.current].src;
      void a.play().catch(() => setOn(false));
    });
    audio.current = a;
    return a;
  };

  const fade = (a: HTMLAudioElement, to: number, ms: number, done?: () => void) => {
    cancelAnimationFrame(fadeRaf.current);
    const from = a.volume;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      a.volume = from + (to - from) * k;
      if (k < 1) fadeRaf.current = requestAnimationFrame(step);
      else done?.();
    };
    fadeRaf.current = requestAnimationFrame(step);
  };

  const start = async () => {
    const a = ensure();
    try {
      await a.play();
      setOn(true);
      fade(a, VOLUME, 1600);
    } catch {
      setOn(false);
    }
  };

  const stop = () => {
    const a = audio.current;
    setOn(false);
    if (a) fade(a, 0, 600, () => a.pause());
  };

  useEffect(() => {
    let wanted = false;
    try {
      wanted = localStorage.getItem(KEY) === 'on';
    } catch {
      /* без памяти просто начнём с выключенного */
    }
    if (!wanted) return;
    const resume = () => {
      void start();
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
    window.addEventListener('pointerdown', resume);
    window.addEventListener('keydown', resume);
    return () => {
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
      audio.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = () => {
    const next = !on;
    try {
      localStorage.setItem(KEY, next ? 'on' : 'off');
    } catch {
      /* ничего */
    }
    if (next) void start();
    else stop();
  };

  return (
    <button
      className="sound"
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      aria-pressed={on}
      aria-label={on ? 'Выключить музыку' : 'Включить музыку'}
      title={on ? `Играет: ${MUSIC[track.current]?.title ?? ''}` : 'Включить музыку'}
    >
      <i />
      <i />
      <i />
      <i />
    </button>
  );
}
