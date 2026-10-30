const nf = new Intl.NumberFormat('ru-RU');

export const rub = (n: number) => `${nf.format(n)} ₽`;

export const priceLabel = (price: number) => (price > 0 ? rub(price) : 'Цена по запросу');

export const sizeLabel = (w: number, h: number) =>
  w > 0 && h > 0 ? `${stripZero(w)} × ${stripZero(h)} см` : '—';

const stripZero = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ','));

export const inventoryNo = (id: number) => `dz-${String(id).padStart(3, '0')}`;

const MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l',
  м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch',
  ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

export function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .split('')
    .map((c) => (c in MAP ? MAP[c] : c))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'work';
}

export const dateRu = (iso: string) => {
  // SQLite хранит UTC без зоны: "YYYY-MM-DD HH:MM:SS"
  const d = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z');
  return d.toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
};

// "2026-10-28" → "28 октября 2026"
export const dayRu = (ymd: string) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).replace(' г.', '');
};
