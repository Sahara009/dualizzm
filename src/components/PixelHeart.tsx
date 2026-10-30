// Пиксельное сердце 16×16 в пару к пиксельной сумке корзины.
const FILLED =
  'M3 3h3v1h-3zM10 3h3v1h-3zM2 4h5v1h-5zM9 4h5v1h-5zM1 5h14v1h-14zM1 6h14v1h-14zM1 7h14v1h-14zM2 8h12v1h-12zM3 9h10v1h-10zM4 10h8v1h-8zM5 11h6v1h-6zM6 12h4v1h-4zM7 13h2v1h-2z';
const OUTLINE =
  'M3 3h3v1h-3zM10 3h3v1h-3zM2 4h1v1h-1zM6 4h1v1h-1zM9 4h1v1h-1zM13 4h1v1h-1zM1 5h1v1h-1zM7 5h2v1h-2zM14 5h1v1h-1zM1 6h1v1h-1zM14 6h1v1h-1zM1 7h1v1h-1zM14 7h1v1h-1zM2 8h1v1h-1zM13 8h1v1h-1zM3 9h1v1h-1zM12 9h1v1h-1zM4 10h1v1h-1zM11 10h1v1h-1zM5 11h1v1h-1zM10 11h1v1h-1zM6 12h1v1h-1zM9 12h1v1h-1zM7 13h2v1h-2z';

export default function PixelHeart({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden shapeRendering="crispEdges">
      <path d={filled ? FILLED : OUTLINE} fill="currentColor" />
    </svg>
  );
}
