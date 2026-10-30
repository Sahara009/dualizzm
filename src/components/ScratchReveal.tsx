'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

// «Сотри слой»: работа закрашена тёмной краской, курсор (или палец) стирает её.
// Когда стёрто больше половины, слой исчезает сам.

type Props = { image: string; layer: string; title: string; href: string };

const GX = 48; // сетка для подсчёта, сколько уже стёрто
const GY = 30;
const DONE_AT = 0.55;

export default function ScratchReveal({ image, layer, title, href }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [cleared, setCleared] = useState(false);
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const el = wrap.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!el || !canvas || !ctx) return;

    let W = 0, H = 0, dpr = 1;
    const grid = new Uint8Array(GX * GY);
    let erased = 0;
    let last: { x: number; y: number } | null = null;
    let pressed = false;
    let raf = 0;
    let finished = false;

    const tex = new Image();
    tex.src = layer;

    const paint = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#141821';
      ctx.fillRect(0, 0, W, H);
      if (tex.complete && tex.naturalWidth) {
        const s = Math.max(W / tex.naturalWidth, H / tex.naturalHeight);
        const sw = W / s, sh = H / s;
        ctx.drawImage(tex, (tex.naturalWidth - sw) / 2, (tex.naturalHeight - sh) / 2, sw, sh, 0, 0, W, H);
      }
      grid.fill(0);
      erased = 0;
    };

    const layout = (force = false) => {
      const r = el.getBoundingClientRect();
      // на телефоне высота окна прыгает при прокрутке: перерисовываем только при смене ширины
      if (!force && Math.abs(r.width - W) < 1) return;
      W = r.width;
      H = r.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      paint();
    };

    const report = () => {
      raf = 0;
      const p = erased / (GX * GY);
      setProgress(p);
      if (p >= DONE_AT && !finished) {
        finished = true;
        setCleared(true);
      }
    };

    const dab = (x: number, y: number) => {
      const R = Math.max(26, W * 0.055);
      ctx.globalCompositeOperation = 'destination-out';
      const g = ctx.createRadialGradient(x, y, 0, x, y, R);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(0.6, 'rgba(0,0,0,0.85)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fill();
      // отмечаем стёртые клетки сетки
      const cw = W / GX, ch = H / GY, rr = (R * 0.75) ** 2;
      const x0 = Math.max(0, Math.floor((x - R) / cw)), x1 = Math.min(GX - 1, Math.floor((x + R) / cw));
      const y0 = Math.max(0, Math.floor((y - R) / ch)), y1 = Math.min(GY - 1, Math.floor((y + R) / ch));
      for (let gy = y0; gy <= y1; gy++)
        for (let gx = x0; gx <= x1; gx++) {
          const i = gy * GX + gx;
          if (grid[i]) continue;
          const dx = (gx + 0.5) * cw - x, dy = (gy + 0.5) * ch - y;
          if (dx * dx + dy * dy < rr) {
            grid[i] = 1;
            erased++;
          }
        }
    };

    const scratch = (x: number, y: number) => {
      if (last) {
        const dx = x - last.x, dy = y - last.y, d = Math.hypot(dx, dy);
        const step = Math.max(4, W * 0.015);
        for (let t = step; t < d; t += step) dab(last.x + (dx * t) / d, last.y + (dy * t) / d);
      }
      dab(x, y);
      last = { x, y };
      setStarted(true);
      if (!raf) raf = requestAnimationFrame(report);
    };

    const pos = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const move = (e: PointerEvent) => {
      // мышью стираем просто ведя курсором, пальцем и стилусом — когда прижаты
      if (e.pointerType !== 'mouse' && !pressed) return;
      const p = pos(e);
      scratch(p.x, p.y);
    };
    const down = (e: PointerEvent) => {
      pressed = true;
      last = null;
      const p = pos(e);
      scratch(p.x, p.y);
    };
    const up = () => {
      pressed = false;
      last = null;
    };

    tex.onload = () => layout(true);
    layout(true);
    const ro = new ResizeObserver(() => layout());
    ro.observe(el);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    el.addEventListener('pointerleave', up);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      el.removeEventListener('pointerleave', up);
    };
  }, [layer, round]);

  const reset = () => {
    setCleared(false);
    setStarted(false);
    setProgress(0);
    setRound((r) => r + 1);
  };

  return (
    <section className="scratch">
      <div className="puzzle__head">
        <h2 className="display h-lg">Сотри слой</h2>
        <p>Под тёмной краской спрятана одна из моих работ. Веди курсором (на телефоне — пальцем), чтобы её открыть.</p>
      </div>
      <div ref={wrap} className="scratch__stage" data-cleared={cleared || undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={`Работа «${title}»`} loading="lazy" />
        <canvas ref={canvasRef} aria-hidden key={round} />
        {!started && (
          <p className="scratch__hint" aria-hidden>
            сотри меня
          </p>
        )}
        <div className="scratch__meter" aria-hidden>
          <span style={{ width: `${Math.min(100, Math.round((progress / DONE_AT) * 100))}%` }} />
        </div>
      </div>
      <div className="puzzle__bar" aria-live="polite">
        <p>
          {cleared ? (
            <>
              Под слоем — «{title}». <Link href={href}>Посмотреть работу</Link>
            </>
          ) : started ? (
            'Ещё немного'
          ) : (
            'Слой ещё целый'
          )}
        </p>
        {cleared && (
          <button className="btn btn--sm" onClick={reset}>
            Закрасить снова
          </button>
        )}
      </div>
    </section>
  );
}
