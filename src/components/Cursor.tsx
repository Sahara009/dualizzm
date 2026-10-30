'use client';

import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useState } from 'react';

// Курсор-мишень: кольцо с перекрестием. Центр идёт за мышью без задержки,
// кольцо догоняет с пружиной. Над ссылками кольцо сжимается и поворачивается,
// как будто цель захвачена. Над работами появляется круг с подсказкой.
export default function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 420, damping: 32, mass: 0.4 });
  const ry = useSpring(y, { stiffness: 420, damping: 32, mass: 0.4 });
  const [fine, setFine] = useState(false);
  const [link, setLink] = useState(false);
  const [down, setDown] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    setFine(true);
    document.documentElement.classList.add('has-cursor');
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const lab = t?.closest<HTMLElement>('[data-cursor]');
      const isLink = !!t?.closest('a,button,select,label,summary,[role=button],input[type=range]');
      // над кнопкой внутри карточки (сердце) показываем прицел, а не подпись
      setLabel(lab && !t?.closest('button') ? lab.dataset.cursor || null : null);
      setLink(isLink);
    };
    const press = () => setDown(true);
    const release = () => setDown(false);
    const leave = () => {
      x.set(-100);
      y.set(-100);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerover', over);
    window.addEventListener('pointerdown', press);
    window.addEventListener('pointerup', release);
    document.addEventListener('pointerleave', leave);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      document.removeEventListener('pointerleave', leave);
    };
  }, [x, y]);

  if (!fine) return null;
  return (
    <>
      {/* кольцо с рисками: догоняет курсор */}
      <motion.div className="cursor" style={{ x: rx, y: ry }} aria-hidden>
        <motion.svg
          className="cursor__ring"
          viewBox="0 0 48 48"
          animate={{ scale: label ? 0 : down ? 0.55 : link ? 0.7 : 1, rotate: link ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 26 }}
        >
          <circle cx="24" cy="24" r="15" fill="none" stroke="#fff" strokeWidth="1.5" />
          <path d="M24 2v9M24 37v9M2 24h9M37 24h9" stroke="#fff" strokeWidth="1.5" />
        </motion.svg>
      </motion.div>
      {/* подпись над работами: без смешивания цветов, чтобы акцент оставался акцентом */}
      <motion.div className="cursor cursor--label" style={{ x: rx, y: ry }} aria-hidden>
        <AnimatePresence>
          {label && (
            <motion.div
              className="cursor__label"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            >
              {label}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* точка прицела: ровно в позиции мыши */}
      <motion.div className="cursor cursor--dot" style={{ x, y }} aria-hidden>
        <motion.span className="cursor__dot" animate={{ scale: label ? 0 : link ? 1.6 : 1 }} transition={{ duration: 0.15 }} />
      </motion.div>
    </>
  );
}
