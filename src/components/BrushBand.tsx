'use client';

import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

type Props = { src: string; text: string; link?: { href: string; label: string } };

// Широкая полоса мазков краской, текст только внизу. Мазки чуть сдвигаются при прокрутке.
export default function BrushBand({ src, text, link }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref as unknown as React.RefObject<HTMLElement>, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-7%', '7%']);

  return (
    <section ref={ref} className="band">
      <motion.div className="band__img" style={{ y, backgroundImage: `url(${src})` }} aria-hidden />
      <div className="band__text">
        <p>{text}</p>
        {link && (
          <Link className="band__link" href={link.href}>
            {link.label}
          </Link>
        )}
      </div>
    </section>
  );
}
