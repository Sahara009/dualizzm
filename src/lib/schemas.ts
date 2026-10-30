import { z } from 'zod';
import { DELIVERY } from './config';

export const orderSchema = z.object({
  items: z
    .array(z.object({ productId: z.number().int().positive(), qty: z.number().int().min(1).max(20) }))
    .min(1, 'Корзина пуста')
    .max(30),
  customer: z.object({
    name: z.string().trim().min(2, 'Напиши имя'),
    email: z.string().trim().email('Проверь адрес почты'),
    phone: z.string().trim().min(6, 'Напиши телефон'),
    city: z.string().trim().max(120).default(''),
    address: z.string().trim().max(300).default(''),
  }),
  delivery: z.enum(DELIVERY.map((d) => d.id) as [string, ...string[]]),
  comment: z.string().trim().max(1000).default(''),
  // две отдельные отметки: с 01.09.2025 согласие на ПДн нельзя совмещать с офертой
  agreeOffer: z.literal(true, { errorMap: () => ({ message: 'Нужно принять условия публичной оферты' }) }),
  agreePd: z.literal(true, { errorMap: () => ({ message: 'Нужно согласие на обработку персональных данных' }) }),
});

export const productSchema = z.object({
  title: z.string().trim().min(1, 'Нужно название').max(160),
  slug: z.string().trim().max(160).optional(),
  year: z.coerce.number().int().min(1900).max(2100),
  medium: z.string().trim().max(200).default(''),
  widthCm: z.coerce.number().min(0).max(1000).default(0),
  heightCm: z.coerce.number().min(0).max(1000).default(0),
  kind: z.enum(['original', 'print']),
  price: z.coerce.number().int().min(0).max(100_000_000),
  stock: z.coerce.number().int().min(0).max(100_000),
  description: z.string().trim().max(5000).default(''),
  images: z.array(z.string().regex(/^\/(uploads|works|hero)\/[\w.-]+$/)).max(12).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

export const settingsSchema = z.object({
  artistName: z.string().trim().max(80),
  heroLine: z.string().trim().max(300),
  statement: z.string().trim().max(600),
  bio: z.string().trim().max(6000),
  worksText: z.string().trim().max(6000),
  processText: z.string().trim().max(3000),
  processSteps: z.string().trim().max(3000),
  bandHome: z.string().trim().max(400),
  bandAbout: z.string().trim().max(400),
  telegram: z.string().trim().max(80).transform((s) => s.replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '').replace(/\/$/, '')),
  instagram: z.string().trim().max(80).transform((s) => s.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')),
  email: z.string().trim().max(120),
  portrait: z.string().trim().max(200),
});

export const statusSchema = z.object({ status: z.enum(['pending', 'paid', 'shipped', 'done', 'cancelled']) });

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Напиши, как к тебе обращаться').max(80),
  contact: z.string().trim().min(3, 'Оставь почту, телеграм или телефон').max(120),
  message: z.string().trim().min(5, 'Напиши пару слов').max(3000),
  website: z.string().max(0).optional(), // ловушка для ботов: люди это поле не видят
  agreePd: z.literal(true, { errorMap: () => ({ message: 'Нужно согласие на обработку персональных данных' }) }),
});

export const postSchema = z.object({
  title: z.string().trim().min(1, 'Нужен заголовок').max(200),
  slug: z.string().trim().max(160).optional(),
  rubric: z.string().trim().max(40).default(''),
  excerpt: z.string().trim().max(500).default(''),
  body: z.string().trim().max(20000).default(''),
  image: z.union([z.literal(''), z.string().regex(/^\/(uploads|works|hero)\/[\w.-]+$/, 'Неверный путь к фото')]).default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата в формате ГГГГ-ММ-ДД'),
  published: z.boolean().default(true),
});
export type PostInput = z.infer<typeof postSchema>;
