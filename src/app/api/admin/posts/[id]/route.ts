import { NextResponse } from 'next/server';
import { deletePost, getPostById, savePost } from '@/lib/db';
import { postSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const id = Number((await params).id);
  if (!getPostById(id)) return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 });
  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Проверь поля' }, { status: 400 });
  return NextResponse.json({ post: savePost(parsed.data, id) });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  deletePost(Number((await params).id));
  return NextResponse.json({ ok: true });
}
