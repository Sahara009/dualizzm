'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { INTRO_EVENT, introIsDone } from '@/lib/intro';

const KEY = 'dz-cookie-ok';

// Уведомление о cookie в виде окна «хакерского» терминала.
// Подача шуточная, но текст честный: что именно хранится и зачем.
const LINES = [
  '> подключение к dualizzm.com ... ok',
  '> сканирование браузера ...',
  '> НАЙДЕНО: файлы cookie и локальное хранилище',
];

export default function CookieNotice() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(false);
  const [typed, setTyped] = useState(0); // сколько символов уже «напечатано»

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {
      /* без хранилища просто покажем окно */
    }
    // появляемся после заставки, чтобы не перекрывать её
    let t = 0;
    const open = () => {
      t = window.setTimeout(() => setShow(true), 900);
    };
    if (introIsDone()) open();
    else window.addEventListener(INTRO_EVENT, open, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener(INTRO_EVENT, open);
    };
  }, []);

  const total = LINES.join('\n').length;
  useEffect(() => {
    if (!show) return;
    if (reduced) {
      setTyped(total);
      return;
    }
    const id = window.setInterval(() => {
      setTyped((n) => {
        if (n >= total) {
          clearInterval(id);
          return n;
        }
        return n + 2;
      });
    }, 22);
    return () => clearInterval(id);
  }, [show, reduced, total]);

  const accept = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {
      /* ничего */
    }
    setShow(false);
  };

  const text = LINES.join('\n').slice(0, typed);
  const done = typed >= total;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="hack"
          role="dialog"
          aria-labelledby="hack-title"
          aria-describedby="hack-body"
          initial={{ opacity: 0, y: 24, clipPath: 'inset(0 0 100% 0)' }}
          animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
          exit={{ opacity: 0, clipPath: 'inset(50% 0 50% 0)' }}
          transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="hack__bar">
            <span>root@dualizzm: ~</span>
            <button className="hack__x" onClick={accept} aria-label="Закрыть уведомление">
              [ x ]
            </button>
          </div>
          <div className="hack__screen">
            <p id="hack-title" className="hack__alert" data-text="! ВНИМАНИЕ">
              ! ВНИМАНИЕ
            </p>
            <pre className="hack__log" aria-hidden>
              {text}
              {!done && <span className="hack__caret">█</span>}
            </pre>
            <AnimatePresence>
              {done && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <p id="hack-body" className="hack__body">
                    Шучу, никто тебя не взламывает. Сайт хранит в браузере только нужное: корзину, избранное, выбор музыки и
                    отметку, что ты видел(а) это окно. Рекламы и слежки нет.
                  </p>
                  <div className="hack__actions">
                    <button className="hack__btn hack__btn--main" onClick={accept}>
                      [ принять ]
                    </button>
                    <Link className="hack__btn" href="/legal/cookies" onClick={accept}>
                      [ подробнее ]
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
