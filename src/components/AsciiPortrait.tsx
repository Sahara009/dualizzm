'use client';

import { useEffect, useRef } from 'react';

// Фото, нарисованное символами. Под курсором (или пальцем) открывается настоящее фото,
// а отдельные символы иногда «дрожат», как старый терминал.

const RAMP = ' .,:;-=+*#%@';

type Props = { src: string; alt: string; cell?: number; className?: string };

export default function AsciiPortrait({ src, alt, cell = 9, className = '' }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const styles = getComputedStyle(document.documentElement);
    const paper = styles.getPropertyValue('--paper').trim() || '#cfcfc8';
    const ink = styles.getPropertyValue('--ink').trim() || '#000';
    const accent = styles.getPropertyValue('--accent').trim() || '#e8541a';

    const img = new Image();
    img.decoding = 'async';
    img.src = src;

    let W = 0, H = 0, cols = 0, rows = 0, dpr = 1;
    let lum: Float32Array | null = null;
    let crop: [number, number, number, number] = [0, 0, 0, 0];
    const glitch = new Map<number, string>();
    const lens = { x: 0, y: 0, r: 0, target: 0 };
    let raf = 0;
    let visible = false;
    let lastTick = 0;
    const rowH = cell * 1.3;

    const computeCrop = () => {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const s = Math.max(W / iw, H / ih);
      const sw = W / s, sh = H / s;
      crop = [(iw - sw) / 2, (ih - sh) / 2, sw, sh];
    };

    const sample = () => {
      if (!img.naturalWidth || !cols || !rows) return;
      computeCrop();
      const off = document.createElement('canvas');
      off.width = cols;
      off.height = rows;
      const o = off.getContext('2d', { willReadFrequently: true });
      if (!o) return;
      o.drawImage(img, crop[0], crop[1], crop[2], crop[3], 0, 0, cols, rows);
      const data = o.getImageData(0, 0, cols, rows).data;
      const out = new Float32Array(cols * rows);
      let min = 1, max = 0;
      for (let i = 0; i < out.length; i++) {
        const v = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
        out[i] = v;
        if (v < min) min = v;
        if (v > max) max = v;
      }
      // выравнивание гистограммы: на светлых серых фото символы иначе сливаются в одну плотность
      const span = Math.max(0.05, max - min);
      const order = Array.from(out.keys()).sort((a, b) => out[a] - out[b]);
      const eq = new Float32Array(out.length);
      order.forEach((k, r) => {
        eq[k] = r / Math.max(1, out.length - 1);
      });
      for (let i = 0; i < out.length; i++) out[i] = 0.7 * eq[i] + 0.3 * ((out[i] - min) / span);
      lum = out;
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, W, H);
      if (!lum) return;
      ctx.fillStyle = ink;
      ctx.font = `${Math.round(cell * 1.2)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx.textBaseline = 'top';
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const level = Math.round((1 - lum[i]) * (RAMP.length - 1));
          const ch = glitch.get(i) ?? RAMP[level];
          if (ch !== ' ') ctx.fillText(ch, x * cell, y * rowH);
        }
      }
      if (lens.r > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, crop[0], crop[1], crop[2], crop[3], 0, 0, W, H);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2);
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    const loop = (t: number) => {
      raf = 0;
      let again = false;
      const dr = lens.target - lens.r;
      if (Math.abs(dr) > 0.5) {
        lens.r += dr * 0.2;
        again = true;
      } else lens.r = lens.target;
      if (!reduced && visible && lum && t - lastTick > 120) {
        lastTick = t;
        glitch.clear();
        const n = Math.ceil(cols * rows * 0.008);
        for (let k = 0; k < n; k++) glitch.set(Math.floor(Math.random() * cols * rows), RAMP[1 + Math.floor(Math.random() * (RAMP.length - 1))]);
      }
      draw();
      if (again || (!reduced && visible)) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const layout = () => {
      const r = el.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      cols = Math.max(8, Math.floor(W / cell));
      rows = Math.max(8, Math.floor(H / rowH));
      sample();
      kick();
    };

    img.onload = layout;
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(el);

    const point = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      lens.x = e.clientX - r.left;
      lens.y = e.clientY - r.top;
      lens.target = Math.min(W, H) * 0.3;
      kick();
    };
    const leave = () => {
      lens.target = 0;
      kick();
    };
    el.addEventListener('pointermove', point);
    el.addEventListener('pointerdown', point);
    el.addEventListener('pointerleave', leave);
    const up = (e: PointerEvent) => {
      if (e.pointerType === 'touch') leave();
    };
    el.addEventListener('pointerup', up);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener('pointermove', point);
      el.removeEventListener('pointerdown', point);
      el.removeEventListener('pointerleave', leave);
      el.removeEventListener('pointerup', up);
    };
  }, [src, cell]);

  return (
    <div ref={wrap} className={`ascii ${className}`} data-cursor="смотреть">
      <canvas ref={canvasRef} role="img" aria-label={alt} />
      <span className="ascii__hint" aria-hidden>
        Наведи, чтобы увидеть фото
      </span>
    </div>
  );
}
