import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { RESERVE_MINUTES, deliveryById } from './config';
import { slugify } from './format';
import type { PostInput } from './schemas';
import type { Customer, Message, Order, OrderItem, OrderStatus, Post, Product, ProductKind, Settings } from './types';


// Встроенный SQLite из Node (node:sqlite). Нативных модулей нет, ничего не компилируется.
// Берём через getBuiltinModule, чтобы сборщик не пытался его упаковывать.
type Stmt = {
  run(...a: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
  get(...a: unknown[]): unknown;
  all(...a: unknown[]): unknown[];
};
type Raw = { exec(sql: string): void; prepare(sql: string): Stmt };

function openRaw(file: string): Raw {
  const mod = (process as unknown as { getBuiltinModule?: (n: string) => unknown }).getBuiltinModule?.('node:sqlite') as
    | { DatabaseSync: new (p: string) => Raw }
    | undefined;
  if (!mod) throw new Error('Встроенный SQLite недоступен. Запускай сайт через npm run dev / npm start (они включают его сами) или обнови Node до 22.13+.');
  return new mod.DatabaseSync(file);
}

class Db {
  private depth = 0;
  constructor(private raw: Raw) {}
  exec(sql: string) {
    this.raw.exec(sql);
  }
  prepare(sql: string) {
    return this.raw.prepare(sql);
  }
  // Вложенные вызовы превращаются в SAVEPOINT.
  transaction<T>(fn: () => T): () => T {
    return () => {
      const outer = this.depth === 0;
      const sp = `sp${this.depth}`;
      this.raw.exec(outer ? 'BEGIN IMMEDIATE' : `SAVEPOINT ${sp}`);
      this.depth++;
      try {
        const r = fn();
        this.depth--;
        this.raw.exec(outer ? 'COMMIT' : `RELEASE ${sp}`);
        return r;
      } catch (e) {
        this.depth--;
        this.raw.exec(outer ? 'ROLLBACK' : `ROLLBACK TO ${sp}; RELEASE ${sp}`);
        throw e;
      }
    };
  }
}

// Где лежат база и загруженные фото.
// На своём сервере это папка data в проекте. На серверлесс-хостинге (Netlify) папка проекта
// только для чтения, поэтому данные уходят во временную папку и живут, пока жив экземпляр функции.
function pickDataDir(): { dir: string; ephemeral: boolean } {
  const tmp = path.join(os.tmpdir(), 'dualizzm');
  const serverless = !!(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
  if (process.env.DATA_DIR || !serverless) {
    const wanted = process.env.DATA_DIR || path.join(process.cwd(), 'data');
    try {
      fs.mkdirSync(path.join(wanted, 'uploads'), { recursive: true });
      fs.accessSync(wanted, fs.constants.W_OK);
      return { dir: wanted, ephemeral: false };
    } catch {
      /* папка только для чтения: падаем на временную */
    }
  }
  fs.mkdirSync(path.join(tmp, 'uploads'), { recursive: true });
  return { dir: tmp, ephemeral: true };
}

const picked = pickDataDir();
export const DATA_DIR = picked.dir;
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
// true — данные временные (демо-режим на Netlify): заказы и правки в админке со временем сбросятся
export const DATA_IS_EPHEMERAL = picked.ephemeral;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  year INTEGER NOT NULL,
  medium TEXT NOT NULL DEFAULT '',
  width_cm REAL NOT NULL DEFAULT 0,
  height_cm REAL NOT NULL DEFAULT 0,
  kind TEXT NOT NULL DEFAULT 'original',
  price INTEGER NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 1,
  description TEXT NOT NULL DEFAULT '',
  images TEXT NOT NULL DEFAULT '[]',
  featured INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  items TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  shipping INTEGER NOT NULL,
  total INTEGER NOT NULL,
  customer TEXT NOT NULL,
  delivery TEXT NOT NULL,
  comment TEXT NOT NULL DEFAULT '',
  payment_id TEXT,
  payment_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  rubric TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  published INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  message TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

// Тексты написаны от лица Лизы как черновик. Она поправит их в админке → «Настройки».
// Почта и телеграм пока моковые.
const DEFAULT_SETTINGS: Settings = {
  artistName: 'Лиза',
  heroLine: 'Я Лиза. Пишу город кусками: метро, старые дома, стекло и бетон. Каждая работа здесь существует в одном экземпляре.',
  statement:
    'Я не вижу город целиком. Я помню его обрывками: свет в вагоне, чужой рукав, угол дома, который скоро снесут. Поэтому и пишу так же, по кускам, а потом собираю их обратно.',
  bio: 'Привет, я Лиза. Я художница и пишу город таким, каким он остаётся в памяти: не цельной картинкой, а фрагментами.\n\nМне интересны места, мимо которых все проходят каждый день и перестают их замечать. Вагон метро, подъезд, пустой офис, дом, который вот-вот снесут.\n\nВсе работы в этом магазине мои и существуют в одном экземпляре. Если какая-то откликается, напиши мне: расскажу, как она появилась.',
  worksText:
    'Мои картины не помещаются в прямоугольник. Я режу основу на фрагменты разной формы и пишу каждый отдельно, как отдельное воспоминание. Потом складываю их вместе, и у работы появляется рваный, живой край.\n\nЧасто я снимаю готовые работы прямо там, откуда они пришли: в метро, на стройке, в лесу. Так картина ненадолго возвращается на своё место.',
  processText: 'Каждая работа начинается с места. Я много хожу, фотографирую и делаю наброски, а потом собираю картину в мастерской по частям.',
  processSteps:
    'Нахожу место и снимаю его с разных точек\nДелаю эскиз и решаю, как разрезать основу\nВырезаю фрагменты и пишу каждый отдельно\nСобираю куски в одну работу и смотрю, как они звучат вместе',
  bandHome: 'Я ищу не красивые места, а те, что скоро исчезнут. Пока они стоят, я успеваю их записать, кусок за куском.',
  bandAbout: 'Город для меня не картинка, а память, порезанная на фрагменты. Я просто складываю её обратно.',
  instagram: 'dualizzm',
  telegram: 'dualizzm',
  email: 'hello@dualizzm.com',
  portrait: '/works/liza.jpg',
};

// Работы вставляются от старых к новым: в каталоге выше всех окажется последняя.
// Цены пока не заданы: 0 значит «цена по запросу», такую работу купить нельзя. Размеры и технику Лиза допишет сама.
const work = (slug: string, title: string, price: number, images: string[], featured = true): Omit<Product, 'id' | 'createdAt'> => ({
  slug, title, year: 2026, medium: '', widthCm: 0, heightCm: 0, kind: 'original', price, stock: 1, description: '', images, featured, published: true,
});

const SEED: Array<Omit<Product, 'id' | 'createdAt'>> = [
  work('ofis', 'Офис', 35000, ['/works/liza.jpg']),
  work('les', 'Лес', 42000, ['/works/les.jpg']),
  work('atrium', 'Атриум', 38000, ['/works/atrium.jpg']),
  work('dom', 'Дом', 0, ['/works/dom.jpg', '/works/process.jpg']),
  work('metro', 'Метро', 0, ['/works/metro.jpg', '/works/expo.jpg']),
];

// Первые записи «Хроники»: черновики от лица Лизы, она перепишет их в админке → «Хроника».
const POST_SEED = [
  {
    slug: 'magazin-otkryt',
    title: 'Магазин открыт: оригиналы теперь можно забрать домой',
    rubric: 'Новости',
    excerpt: 'Пять работ, у каждой один экземпляр. Рассказываю, как всё устроено и почему цены у некоторых по запросу.',
    body: 'Долго собиралась и наконец открыла свой магазин. Здесь только оригиналы: у каждой работы один экземпляр, и когда её покупают, она уходит из каталога.\n\nУ некоторых работ цена по запросу. Это те, с которыми я ещё не решила, готова ли расстаться. Напишите мне, и мы поговорим.\n\nУпаковываю сама, отправляю СДЭКом по России. Если вы в Москве, можно забрать из мастерской и заодно посмотреть, где всё это появляется.',
    image: '/hero/poster.jpg',
    date: '2026-10-28',
  },
  {
    slug: 'metro-vernulas-v-metro',
    title: '«Метро» на пару минут вернулась в метро',
    rubric: 'Город',
    excerpt: 'Отвезла работу туда, где она началась, и сняла её на фоне поездов. Никто из пассажиров даже не обернулся.',
    body: 'Мне нравится снимать работы там, откуда они пришли. «Метро» я писала по наброскам со станции, поэтому повезла её обратно.\n\nПоезда шли каждые две минуты, работа дрожала от ветра, а люди проходили мимо, не поднимая глаз. Кажется, это и есть лучший комплимент: картина выглядела частью станции.\n\nВидео с той съёмки теперь на главной странице.',
    image: '/hero/insitu-poster.jpg',
    date: '2026-10-21',
  },
  {
    slug: 'kak-ya-rezhu-gorod',
    title: 'Как я режу город на фрагменты',
    rubric: 'Мастерская',
    excerpt: 'Сначала рисую, потом режу, потом собираю заново. Показываю процесс на «Доме» от первого наброска до сборки.',
    body: 'Почти все мои работы собраны из кусков. Я пишу фрагменты отдельно, вырезаю их и потом собираю, как пазл, у которого нет картинки на коробке.\n\nТак город и выглядит, когда идёшь по нему: окно, кусок фасада, вывеска, чужая тень. Целиком его никто не видит.\n\n«Дом» собирался три недели. Самое сложное было остановиться и не добавлять ещё один кусок.',
    image: '/works/process.jpg',
    date: '2026-10-12',
  },
  {
    slug: 'pervaya-vystavka',
    title: 'Первая выставка: что я поняла, пока стояла рядом со своими работами',
    rubric: 'Выставки',
    excerpt: 'Люди подходят ближе, чем я думала, и смотрят дольше на то, что мне казалось неудачным.',
    body: 'На первой выставке я весь вечер стояла рядом с работами и слушала, что о них говорят.\n\nОказалось, что люди подходят очень близко и разглядывают стыки между фрагментами. А дольше всего смотрели на угол, который я хотела переписать.\n\nС тех пор я меньше исправляю и больше оставляю как есть.',
    image: '/works/expo.jpg',
    date: '2026-09-30',
  },
  {
    slug: 'les-posredi-betona',
    title: '«Лес» посреди бетона',
    rubric: 'Работы',
    excerpt: 'Единственная работа без зданий. Или почти без них: если присмотреться, они там есть.',
    body: '«Лес» я начинала как перерыв от города. Хотелось написать что-то, где нет ни одного окна.\n\nНо рука всё равно рисовала прямые углы, и деревья постепенно стали похожи на колонны. Так получился лес, который помнит, что вокруг него бетон.',
    image: '/works/les.jpg',
    date: '2026-09-14',
  },
  {
    slug: 'atrium-steklo',
    title: 'Атриум: стекло, которое ничего не отражает',
    rubric: 'Работы',
    excerpt: 'Писала большой торговый атриум и поняла, что стекло интереснее всего, когда в нём пусто.',
    body: 'Я долго ходила по одному атриуму с блокнотом. Там всё из стекла, и всё время что-то отражается: люди, вывески, небо.\n\nВ работе я убрала отражения совсем. Осталась только конструкция, и она стала похожа на скелет здания.',
    image: '/works/atrium.jpg',
    date: '2026-08-27',
  },
];

type Row = Record<string, unknown>;

function init(): Db {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const d = new Db(openRaw(path.join(DATA_DIR, 'dualizzm.db')));
  d.exec('PRAGMA journal_mode = WAL');
  d.exec(SCHEMA);
  // Первые демо-карточки заменяем настоящими работами.
  d.exec("DELETE FROM products WHERE slug LIKE 'obrazets-%'");
  const count = (d.prepare('SELECT COUNT(*) AS n FROM products').get() as { n: number }).n;
  if (count === 0) {
    const ins = d.prepare(
      `INSERT INTO products (slug,title,year,medium,width_cm,height_cm,kind,price,stock,description,images,featured,published)
       VALUES (@slug,@title,@year,@medium,@widthCm,@heightCm,@kind,@price,@stock,@description,@images,@featured,@published)`,
    );
    d.transaction(() => {
      for (const p of SEED) ins.run({ ...p, images: JSON.stringify(p.images), featured: +p.featured, published: +p.published });
    })();
  }
  // Один раз ставим тестовые цены трём работам в уже созданной базе (если там всё ещё 0).
  if (!d.prepare("SELECT 1 FROM settings WHERE key = 'migr_prices_v1'").get()) {
    const setPrice = d.prepare('UPDATE products SET price = ? WHERE slug = ? AND price = 0');
    d.transaction(() => {
      setPrice.run(35000, 'ofis');
      setPrice.run(42000, 'les');
      setPrice.run(38000, 'atrium');
      d.prepare("INSERT INTO settings (key, value) VALUES ('migr_prices_v1', '1')").run();
    })();
  }
  // Черновики «Хроники» от лица Лизы, один раз в новой (или старой без записей) базе.
  if (!d.prepare("SELECT 1 FROM settings WHERE key = 'migr_posts_v1'").get()) {
    const ins = d.prepare(
      'INSERT OR IGNORE INTO posts (slug,title,rubric,excerpt,body,image,date) VALUES (@slug,@title,@rubric,@excerpt,@body,@image,@date)',
    );
    d.transaction(() => {
      for (const p of POST_SEED) ins.run(p);
      d.prepare("INSERT INTO settings (key, value) VALUES ('migr_posts_v1', '1')").run();
    })();
  }
  return d;
}

const g = globalThis as unknown as { __dzdb?: Db };
export const db: Db = g.__dzdb ?? (g.__dzdb = init());

// ───────── товары ─────────

const toProduct = (r: Row): Product => ({
  id: r.id as number,
  slug: r.slug as string,
  title: r.title as string,
  year: r.year as number,
  medium: r.medium as string,
  widthCm: r.width_cm as number,
  heightCm: r.height_cm as number,
  kind: r.kind as ProductKind,
  price: r.price as number,
  stock: r.stock as number,
  description: r.description as string,
  images: JSON.parse(r.images as string) as string[],
  featured: !!r.featured,
  published: !!r.published,
  createdAt: r.created_at as string,
});

export function listProducts(opts: { all?: boolean; featured?: boolean; limit?: number } = {}): Product[] {
  sweepExpired();
  const where: string[] = [];
  if (!opts.all) where.push('published = 1');
  if (opts.featured) where.push('featured = 1');
  const sql = `SELECT * FROM products ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC ${opts.limit ? 'LIMIT ' + Number(opts.limit) : ''}`;
  return (db.prepare(sql).all() as Row[]).map(toProduct);
}

export function getProductBySlug(slug: string): Product | null {
  sweepExpired();
  const r = db.prepare('SELECT * FROM products WHERE slug = ?').get(slug) as Row | undefined;
  return r ? toProduct(r) : null;
}

export function getProductById(id: number): Product | null {
  const r = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Row | undefined;
  return r ? toProduct(r) : null;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'slug'> & { slug?: string };

function uniqueSlug(base: string, exceptId?: number): string {
  let slug = base;
  let i = 2;
  for (;;) {
    const hit = db.prepare('SELECT id FROM products WHERE slug = ?').get(slug) as { id: number } | undefined;
    if (!hit || hit.id === exceptId) return slug;
    slug = `${base}-${i++}`;
  }
}

export function saveProduct(input: ProductInput, id?: number): Product {
  const slug = uniqueSlug(slugify(input.slug?.trim() || input.title), id);
  const params = {
    slug,
    title: input.title,
    year: input.year,
    medium: input.medium,
    widthCm: input.widthCm,
    heightCm: input.heightCm,
    kind: input.kind,
    price: input.price,
    stock: input.stock,
    description: input.description,
    images: JSON.stringify(input.images),
    featured: +input.featured,
    published: +input.published,
  };
  if (id) {
    db.prepare(
      `UPDATE products SET slug=@slug,title=@title,year=@year,medium=@medium,width_cm=@widthCm,height_cm=@heightCm,
       kind=@kind,price=@price,stock=@stock,description=@description,images=@images,featured=@featured,published=@published WHERE id=@id`,
    ).run({ ...params, id });
    return getProductById(id)!;
  }
  const res = db
    .prepare(
      `INSERT INTO products (slug,title,year,medium,width_cm,height_cm,kind,price,stock,description,images,featured,published)
       VALUES (@slug,@title,@year,@medium,@widthCm,@heightCm,@kind,@price,@stock,@description,@images,@featured,@published)`,
    )
    .run(params);
  return getProductById(Number(res.lastInsertRowid))!;
}

export function deleteProduct(id: number) {
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
}

// ───────── заказы ─────────

const toOrder = (r: Row): Order => ({
  id: r.id as string,
  status: r.status as OrderStatus,
  items: JSON.parse(r.items as string) as OrderItem[],
  subtotal: r.subtotal as number,
  shipping: r.shipping as number,
  total: r.total as number,
  customer: JSON.parse(r.customer as string) as Customer,
  delivery: r.delivery as string,
  comment: r.comment as string,
  paymentId: (r.payment_id as string) ?? null,
  paymentUrl: (r.payment_url as string) ?? null,
  createdAt: r.created_at as string,
  paidAt: (r.paid_at as string) ?? null,
});

export class OrderError extends Error {}

const ID_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
const newOrderId = () => {
  const bytes = crypto.randomBytes(8);
  return 'dz-' + Array.from(bytes, (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join('');
};

export function createOrder(input: {
  items: Array<{ productId: number; qty: number }>;
  customer: Customer;
  delivery: string;
  comment: string;
}): Order {
  const delivery = deliveryById(input.delivery);
  if (!delivery) throw new OrderError('Выбери способ доставки');

  const run = db.transaction(() => {
    sweepExpired();
    const lines: OrderItem[] = [];
    for (const it of input.items) {
      const p = getProductById(it.productId);
      if (!p || !p.published) throw new OrderError('Одной из работ уже нет в каталоге');
      if (p.price <= 0) throw new OrderError(`У «${p.title}» пока нет цены. Напиши Лизе, она назовёт стоимость`);
      const qty = Math.max(1, Math.floor(it.qty));
      if (p.stock < qty) throw new OrderError(p.stock === 0 ? `«${p.title}» уже продана` : `«${p.title}»: в наличии только ${p.stock} шт.`);
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(qty, p.id);
      lines.push({ productId: p.id, slug: p.slug, title: p.title, price: p.price, qty, image: p.images[0] ?? null });
    }
    if (lines.length === 0) throw new OrderError('Корзина пуста');
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const shipping = delivery.price;
    const id = newOrderId();
    db.prepare(
      `INSERT INTO orders (id,status,items,subtotal,shipping,total,customer,delivery,comment)
       VALUES (?,?,?,?,?,?,?,?,?)`,
    ).run(id, 'pending', JSON.stringify(lines), subtotal, shipping, subtotal + shipping, JSON.stringify(input.customer), delivery.id, input.comment);
    return getOrder(id)!;
  });
  return run();
}

export function getOrder(id: string): Order | null {
  const r = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as Row | undefined;
  return r ? toOrder(r) : null;
}

export function listOrders(): Order[] {
  sweepExpired();
  return (db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as Row[]).map(toOrder);
}

export function setPayment(id: string, paymentId: string, url: string) {
  db.prepare('UPDATE orders SET payment_id = ?, payment_url = ? WHERE id = ?').run(paymentId, url, id);
}

function restock(order: Order) {
  const upd = db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?');
  for (const it of order.items) upd.run(it.qty, it.productId);
}

export function setOrderStatus(id: string, status: OrderStatus): Order | null {
  return db.transaction(() => {
    const order = getOrder(id);
    if (!order || order.status === status) return order;
    if (status === 'cancelled' && order.status !== 'cancelled') restock(order);
    if (order.status === 'cancelled' && status !== 'cancelled') {
      // возвращаем из отмены: снова резервируем, если работы ещё есть
      for (const it of order.items) {
        const p = getProductById(it.productId);
        if (!p || p.stock < it.qty) throw new OrderError(`Нельзя вернуть заказ: «${it.title}» уже недоступна`);
      }
      const upd = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
      for (const it of order.items) upd.run(it.qty, it.productId);
    }
    db.prepare('UPDATE orders SET status = ?, paid_at = CASE WHEN ? = \'paid\' AND paid_at IS NULL THEN datetime(\'now\') ELSE paid_at END WHERE id = ?').run(status, status, id);
    return getOrder(id);
  })();
}

export function markPaid(id: string) {
  const order = getOrder(id);
  if (order && order.status === 'pending') setOrderStatus(id, 'paid');
  return getOrder(id);
}

// Освобождает работы из неоплаченных заказов старше RESERVE_MINUTES.
export function sweepExpired() {
  const rows = db
    .prepare(`SELECT id FROM orders WHERE status = 'pending' AND created_at < datetime('now', ?)`)
    .all(`-${RESERVE_MINUTES} minutes`) as Array<{ id: string }>;
  for (const r of rows) setOrderStatus(r.id, 'cancelled');
}

// ───────── настройки ─────────

export function getSettings(): Settings {
  const rows = db.prepare('SELECT key, value FROM settings').all() as Array<{ key: string; value: string }>;
  const s: Settings = { ...DEFAULT_SETTINGS };
  for (const r of rows) if (r.key in s) (s as Record<string, string>)[r.key] = r.value;
  return s;
}

export function saveSettings(input: Partial<Settings>) {
  const up = db.prepare('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  db.transaction(() => {
    for (const k of Object.keys(DEFAULT_SETTINGS) as Array<keyof Settings>) {
      if (typeof input[k] === 'string') up.run(k, input[k]);
    }
  })();
}

// ───────── сообщения из формы связи ─────────

const toMessage = (r: Row): Message => ({
  id: r.id as number,
  name: r.name as string,
  contact: r.contact as string,
  message: r.message as string,
  read: !!r.read,
  createdAt: r.created_at as string,
});

export function saveMessage(input: { name: string; contact: string; message: string }) {
  db.prepare('INSERT INTO messages (name, contact, message) VALUES (?, ?, ?)').run(input.name, input.contact, input.message);
}

export function listMessages(): Message[] {
  return (db.prepare('SELECT * FROM messages ORDER BY id DESC').all() as Row[]).map(toMessage);
}

export const unreadCount = () => (db.prepare('SELECT COUNT(*) AS n FROM messages WHERE read = 0').get() as { n: number }).n;

export function setMessageRead(id: number, read: boolean) {
  db.prepare('UPDATE messages SET read = ? WHERE id = ?').run(read ? 1 : 0, id);
}

export function deleteMessage(id: number) {
  db.prepare('DELETE FROM messages WHERE id = ?').run(id);
}

// ───────── «Хроника» (блог) ─────────

const toPost = (r: Row): Post => ({
  id: r.id as number,
  slug: r.slug as string,
  title: r.title as string,
  rubric: r.rubric as string,
  excerpt: r.excerpt as string,
  body: r.body as string,
  image: r.image as string,
  date: r.date as string,
  published: !!r.published,
});

export function listPosts(opts: { all?: boolean; limit?: number } = {}): Post[] {
  const sql = `SELECT * FROM posts ${opts.all ? '' : 'WHERE published = 1'} ORDER BY date DESC, id DESC ${opts.limit ? 'LIMIT ' + Number(opts.limit) : ''}`;
  return (db.prepare(sql).all() as Row[]).map(toPost);
}

export function getPostBySlug(slug: string): Post | null {
  const r = db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug) as Row | undefined;
  return r ? toPost(r) : null;
}

export function getPostById(id: number): Post | null {
  const r = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as Row | undefined;
  return r ? toPost(r) : null;
}

export function savePost(input: PostInput, id?: number): Post {
  const base = slugify(input.slug?.trim() || input.title) || 'zapis';
  let slug = base;
  for (let i = 2; ; i++) {
    const hit = db.prepare('SELECT id FROM posts WHERE slug = ?').get(slug) as { id: number } | undefined;
    if (!hit || hit.id === id) break;
    slug = `${base}-${i}`;
  }
  const params = { slug, title: input.title, rubric: input.rubric, excerpt: input.excerpt, body: input.body, image: input.image, date: input.date, published: +input.published };
  if (id) {
    db.prepare('UPDATE posts SET slug=@slug,title=@title,rubric=@rubric,excerpt=@excerpt,body=@body,image=@image,date=@date,published=@published WHERE id=@id').run({ ...params, id });
    return getPostById(id)!;
  }
  const res = db.prepare('INSERT INTO posts (slug,title,rubric,excerpt,body,image,date,published) VALUES (@slug,@title,@rubric,@excerpt,@body,@image,@date,@published)').run(params);
  return getPostById(Number(res.lastInsertRowid))!;
}

export function deletePost(id: number) {
  db.prepare('DELETE FROM posts WHERE id = ?').run(id);
}
