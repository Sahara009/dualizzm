import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div>
        <h1 className="display h-xl">Здесь пусто</h1>
        <p style={{ margin: '1rem 0 1.6rem' }}>Такой страницы нет или работа уже убрана из каталога.</p>
        <Link href="/shop" className="btn">
          Открыть каталог
        </Link>
      </div>
    </div>
  );
}
