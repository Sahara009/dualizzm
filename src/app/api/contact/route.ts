import { NextResponse } from 'next/server';
import { saveMessage } from '@/lib/db';
import { clientIp, limited } from '@/lib/ratelimit';
import { contactSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (limited(`contact:${clientIp(req)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Слишком много сообщений подряд. Попробуй через 10 минут.' }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  // бот заполнил скрытое поле: делаем вид, что всё хорошо, и ничего не сохраняем
  if (body && typeof body.website === 'string' && body.website.length > 0) return NextResponse.json({ ok: true });
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Проверь поля' }, { status: 400 });
  }
  saveMessage(parsed.data);
  return NextResponse.json({ ok: true });
}
