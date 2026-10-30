'use client';

import Link from 'next/link';
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// «Собери работу»: картина разлетается на фрагменты разного размера (как панели в работах Лизы),
// их нужно перетащить на место. Рядом с местом фрагмент примагничивается.

type Cell = { id: number; x: number; y: number; w: number; h: number }; // в % от доски
type Scatter = { x: number; y: number; r: number } | null;

// неровные разрезы: куски разного размера
const XS = [0, 22, 47, 71, 100];
const YS = [0, 38, 67, 100];

function makeCells(): Cell[] {
  const out: Cell[] = [];
  let id = 0;
  for (let r = 0; r < YS.length - 1; r++)
    for (let c = 0; c < XS.length - 1; c++) out.push({ id: id++, x: XS[c], y: YS[r], w: XS[c + 1] - XS[c], h: YS[r + 1] - YS[r] });
  return out;
}

type PieceProps = {
  cell: Cell;
  src: string;
  scatter: Scatter;
  placed: boolean;
  generation: number;
  stage: React.RefObject<HTMLDivElement | null>;
  board: React.RefObject<HTMLDivElement | null>;
  onPlaced: (id: number) => void;
};

function Piece({ cell, src, scatter, placed, generation, stage, board, onPlaced }: PieceProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);

  useEffect(() => {
    const t = scatter ?? { x: 0, y: 0, r: 0 };
    const opts = { type: 'spring' as const, stiffness: 80, damping: 15, delay: scatter ? Math.random() * 0.25 : 0 };
    const a = animate(x, t.x, opts);
    const b = animate(y, t.y, opts);
    const c = animate(rotate, t.r, opts);
    return () => {
      a.stop();
      b.stop();
      c.stop();
    };
  }, [scatter, generation, x, y, rotate]);

  const bgX = cell.w >= 100 ? 0 : (cell.x / (100 - cell.w)) * 100;
  const bgY = cell.h >= 100 ? 0 : (cell.y / (100 - cell.h)) * 100;

  return (
    <motion.div
      className="puzzle__piece"
      data-placed={placed || undefined}
      data-cursor={placed ? undefined : 'тяни'}
      drag={!placed}
      dragMomentum={false}
      dragConstraints={stage as unknown as React.RefObject<Element>}
      dragElastic={0.08}
      whileDrag={{ scale: 1.04, zIndex: 30 }}
      onDragStart={() => {
        animate(rotate, 0, { duration: 0.2 });
      }}
      onDragEnd={() => {
        const w = board.current?.getBoundingClientRect().width ?? 600;
        if (Math.hypot(x.get(), y.get()) < Math.max(22, w * 0.06)) onPlaced(cell.id);
      }}
      style={{
        x,
        y,
        rotate,
        left: `${cell.x}%`,
        top: `${cell.y}%`,
        width: `${cell.w}%`,
        height: `${cell.h}%`,
        backgroundImage: `url(${src})`,
        backgroundSize: `${10000 / cell.w}% ${10000 / cell.h}%`,
        backgroundPosition: `${bgX}% ${bgY}%`,
      }}
    />
  );
}

export default function AssemblePuzzle({ src, title, href, ratio }: { src: string; title: string; href: string; ratio: number }) {
  const reduced = useReducedMotion();
  const cells = useMemo(makeCells, []);
  const stage = useRef<HTMLDivElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const [scatters, setScatters] = useState<Scatter[]>(() => cells.map(() => null));
  const [placed, setPlaced] = useState<boolean[]>(() => cells.map(() => true));
  const [generation, setGeneration] = useState(0);
  const [played, setPlayed] = useState(false);
  const autoDone = useRef(false);

  const explode = useCallback(() => {
    const b = board.current?.getBoundingClientRect();
    const s = stage.current?.getBoundingClientRect();
    if (!b || !s) return;
    const roomX = Math.max(30, (s.width - b.width) / 2 + b.width * 0.22);
    const roomY = Math.max(30, (s.height - b.height) / 2 + b.height * 0.18);
    setScatters(cells.map(() => ({ x: (Math.random() * 2 - 1) * roomX, y: (Math.random() * 2 - 1) * roomY, r: (Math.random() * 2 - 1) * 16 })));
    setPlaced(cells.map(() => false));
    setGeneration((g) => g + 1);
    setPlayed(true);
  }, [cells]);

  const assemble = () => {
    setScatters(cells.map(() => null));
    setPlaced(cells.map(() => true));
    setGeneration((g) => g + 1);
  };

  const onPlaced = useCallback((id: number) => {
    setScatters((cur) => cur.map((v, i) => (i === id ? null : v)));
    setPlaced((cur) => cur.map((v, i) => (i === id ? true : v)));
  }, []);

  // сама рассыпается, когда блок впервые появляется на экране
  useEffect(() => {
    if (reduced) return;
    const el = stage.current;
    if (!el) return;
    let t = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !autoDone.current) {
          autoDone.current = true;
          t = window.setTimeout(explode, 700);
          io.disconnect();
        }
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [explode, reduced]);

  const count = placed.filter(Boolean).length;
  const done = count === cells.length;

  return (
    <section className="puzzle">
      <div className="puzzle__head">
        <h2 className="display h-lg">Собери работу</h2>
        <p>
          Я пишу картины кусками и собираю их обратно. Попробуй сама: перетащи фрагменты «{title}» на свои места.
        </p>
      </div>
      <div ref={stage} className="puzzle__stage">
        <div ref={board} className="puzzle__board" style={{ aspectRatio: String(ratio) }}>
          <div className="puzzle__ghost" style={{ backgroundImage: `url(${src})` }} aria-hidden />
          {cells.map((c) => (
            <span
              key={`slot-${c.id}`}
              className="puzzle__slot"
              style={{ left: `${c.x}%`, top: `${c.y}%`, width: `${c.w}%`, height: `${c.h}%` }}
              aria-hidden
            />
          ))}
          {cells.map((c) => (
            <Piece
              key={c.id}
              cell={c}
              src={src}
              scatter={scatters[c.id]}
              placed={placed[c.id]}
              generation={generation}
              stage={stage}
              board={board}
              onPlaced={onPlaced}
            />
          ))}
        </div>
      </div>
      <div className="puzzle__bar" aria-live="polite">
        {played && done ? (
          <p>
            Собрано. Так я и работаю, кусок за куском. <Link href={href}>Посмотреть «{title}»</Link>
          </p>
        ) : (
          <p>{played ? `На месте ${count} из ${cells.length}` : 'Сейчас она рассыплется'}</p>
        )}
        <div className="adm__actions">
          {!done && played && (
            <button className="btn btn--ghost btn--sm" onClick={assemble}>
              Собрать за меня
            </button>
          )}
          <button className="btn btn--sm" onClick={explode}>
            {played ? 'Рассыпать снова' : 'Рассыпать'}
          </button>
        </div>
      </div>
    </section>
  );
}
