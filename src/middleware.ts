import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// На боевом сайте без своего AUTH_SECRET (32+ символа) вход в админку закрыт:
// иначе подпись сессии делалась бы общеизвестным ключом и её можно было бы подделать.
const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 32) return new TextEncoder().encode(s);
  if (process.env.NODE_ENV !== 'production') return new TextEncoder().encode('dev-only-secret-change-me-dev-only-secret');
  return null;
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const open = pathname === '/admin/login' || pathname === '/api/admin/login';
  if (open) return NextResponse.next();

  const token = req.cookies.get('dz_admin')?.value;
  let ok = false;
  const key = secret();
  if (token && key) {
    try {
      await jwtVerify(token, key);
      ok = true;
    } catch {
      ok = false;
    }
  }
  if (ok) return NextResponse.next();

  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Нужно войти' }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
