export type ProductKind = 'original' | 'print';

export type Product = {
  id: number;
  slug: string;
  title: string;
  year: number;
  medium: string;
  widthCm: number;
  heightCm: number;
  kind: ProductKind;
  price: number; // в рублях, целое
  stock: number;
  description: string;
  images: string[];
  featured: boolean;
  published: boolean;
  createdAt: string;
};

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'done' | 'cancelled';

export type OrderItem = {
  productId: number;
  slug: string;
  title: string;
  price: number;
  qty: number;
  image: string | null;
};

export type Customer = {
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
};

export type Order = {
  id: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  customer: Customer;
  delivery: string;
  comment: string;
  paymentId: string | null;
  paymentUrl: string | null;
  createdAt: string;
  paidAt: string | null;
};

export type Settings = {
  artistName: string;
  heroLine: string;
  statement: string;
  bio: string;
  worksText: string;
  processText: string;
  processSteps: string; // по шагу на строку
  bandHome: string; // текст на полосе мазков на главной
  bandAbout: string; // и на странице «Обо мне»
  instagram: string;
  telegram: string;
  email: string;
  portrait: string;
};

export type Message = {
  id: number;
  name: string;
  contact: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Ждёт оплаты',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  done: 'Получен',
  cancelled: 'Отменён',
};

export type Post = {
  id: number;
  slug: string;
  title: string;
  rubric: string; // рубрика: Мастерская, Город, Выставки…
  excerpt: string;
  body: string; // абзацы через пустую строку
  image: string;
  date: string; // YYYY-MM-DD, дата выпуска
  published: boolean;
};
