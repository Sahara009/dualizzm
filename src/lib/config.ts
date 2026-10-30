// Способы доставки. Меняй цены и названия здесь.
export const DELIVERY = [
  { id: 'pickup', label: 'Самовывоз', note: 'Договоримся о встрече после оплаты', price: 0, needsAddress: false },
  { id: 'russia', label: 'По России', note: 'Почта России или СДЭК, работу упакуем надёжно', price: 500, needsAddress: true },
] as const;

export type DeliveryId = (typeof DELIVERY)[number]['id'];

export const deliveryById = (id: string) => DELIVERY.find((d) => d.id === id);

// Сколько минут держим работу за покупателем, пока он не оплатил заказ.
export const RESERVE_MINUTES = 30;

export const SITE_NAME = 'dualizzm';

export const siteUrl = () => (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

// Фоновая музыка. Чтобы собрать плейлист, положи mp3 в public/music и добавь строки сюда:
// треки играют по очереди, после последнего снова первый.
export const MUSIC: Array<{ title: string; src: string }> = [
  { title: 'Архив (временный трек)', src: '/music/archive-loop.mp3' },
];
