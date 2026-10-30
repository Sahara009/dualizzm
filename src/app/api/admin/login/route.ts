import { NextResponse } from 'next/server';
import { COOKIE, authConfigured, cookieOptions, createSession, passwordMatches, tooManyAttempts } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (tooManyAttempts(ip)) {
    return NextResponse.json({ error: 'Слишком много попыток. Подожди 10 минут.' }, { status: 429 });
  }
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Пароль админа не задан: добавь ADMIN_PASSWORD в .env.local (на Netlify: в переменные окружения)' }, { status: 500 });
  }
  if (!authConfigured()) {
    return NextResponse.json({ error: 'Не задан AUTH_SECRET (длинная случайная строка, 32+ символа) в переменных окружения' }, { status: 500 });
  }
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !passwordMatches(password)) {
    return NextResponse.json({ error: 'Пароль не подошёл' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await createSession(), cookieOptions);
  return res;
}
