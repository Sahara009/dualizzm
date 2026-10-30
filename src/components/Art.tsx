// Показывает работу. Пока у товара нет фото, рисует заглушку-абстракцию, чтобы витрина не пустовала.

type Props = {
  slug: string;
  title: string;
  src?: string | null;
  w?: number;
  h?: number;
  cover?: boolean;
};

function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const PALETTES = [
  ['#e9e2d4', '#1a1a1a', '#2b2bff', '#c8452d'],
  ['#1a1a1a', '#e9e2d4', '#8da2cc', '#d9a49c'],
  ['#c9d3c2', '#26332b', '#e0b43c', '#f1ede2'],
  ['#d8b9b0', '#2a1c24', '#2b2bff', '#efe6d6'],
];

function Placeholder({ slug, title, w, h, cover }: { slug: string; title: string; w: number; h: number; cover: boolean }) {
  const r = rng(slug);
  const pal = PALETTES[Math.floor(r() * PALETTES.length)];
  const W = 400;
  const H = Math.round((W * h) / w);
  const blobs = Array.from({ length: 4 + Math.floor(r() * 3) }, () => ({
    cx: r() * W,
    cy: r() * H,
    rx: 40 + r() * 140,
    ry: 40 + r() * 140,
    rot: r() * 180,
    fill: pal[1 + Math.floor(r() * 3)],
    op: 0.55 + r() * 0.4,
  }));
  const strokes = Array.from({ length: 3 }, () => ({
    d: `M ${r() * W} ${r() * H} C ${r() * W} ${r() * H}, ${r() * W} ${r() * H}, ${r() * W} ${r() * H}`,
    sw: 8 + r() * 34,
    stroke: pal[1 + Math.floor(r() * 3)],
  }));
  const sizeProps = cover
    ? { width: '100%', height: '100%', preserveAspectRatio: 'xMidYMid slice' as const }
    : { width: W * 4, height: H * 4 };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} {...sizeProps}>
      <rect width={W} height={H} fill={pal[0]} />
      {blobs.map((b, i) => (
        <ellipse key={i} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill={b.fill} opacity={b.op} transform={`rotate(${b.rot} ${b.cx} ${b.cy})`} />
      ))}
      {strokes.map((s, i) => (
        <path key={i} d={s.d} fill="none" stroke={s.stroke} strokeWidth={s.sw} strokeLinecap="round" opacity={0.9} />
      ))}
    </svg>
  );
}

export default function Art({ slug, title, src, w = 3, h = 4, cover = false }: Props) {
  const ww = w > 0 ? w : 3;
  const hh = h > 0 ? h : 4;
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={title} loading={cover ? 'eager' : 'lazy'} decoding="async" />;
  }
  return <Placeholder slug={slug} title={title} w={ww} h={hh} cover={cover} />;
}
