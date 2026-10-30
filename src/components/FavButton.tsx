'use client';

import { motion } from 'motion/react';
import { useFavorites } from './FavoritesProvider';
import PixelHeart from './PixelHeart';

type Props = { id: number; title: string; variant?: 'icon' | 'wide' };

export default function FavButton({ id, title, variant = 'icon' }: Props) {
  const { has, toggle } = useFavorites();
  const on = has(id);
  const label = on ? `Убрать «${title}» из избранного` : `Добавить «${title}» в избранное`;

  return (
    <button
      type="button"
      className={variant === 'icon' ? 'fav' : 'btn btn--ghost btn--block fav-wide'}
      aria-pressed={on}
      aria-label={variant === 'icon' ? label : undefined}
      title={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
    >
      <motion.span
        key={on ? 'on' : 'off'}
        className="fav__icon"
        initial={{ scale: on ? 0.4 : 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 600, damping: 14 }}
      >
        <PixelHeart filled={on} />
      </motion.span>
      {variant === 'wide' && <span>{on ? 'В избранном' : 'В избранное'}</span>}
    </button>
  );
}
