'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import Art from './Art';

type Props = { slug: string; title: string; images: string[]; w: number; h: number };

// Большой кадр с лупой: при наведении картина увеличивается вокруг курсора.
export default function ProductGallery({ slug, title, images, w, h }: Props) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const src = images[i];

  return (
    <div className="gal">
      <div
        className="gal__stage"
        data-cursor={src ? (zoom ? 'двигай' : 'приблизить') : undefined}
        onMouseEnter={() => src && setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={i} className="gal__frame" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={title} style={{ transformOrigin: `${pos.x}% ${pos.y}%`, transform: zoom ? 'scale(2.2)' : 'none' }} />
            ) : (
              <div className="mat">
                <Art slug={slug} title={title} w={w} h={h} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="gal__thumbs">
          {images.map((s, idx) => (
            <button key={s} onClick={() => setI(idx)} aria-current={idx === i} aria-label={`Фото ${idx + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
