import { NextResponse } from 'next/server';
import { savePost } from '@/lib/db';
import { postSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Проверь поля' }, { status: 400 });
  return NextResponse.json({ post: savePost(parsed.data) });
}
