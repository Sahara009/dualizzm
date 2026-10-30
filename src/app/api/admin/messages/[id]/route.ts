import { NextResponse } from 'next/server';
import { deleteMessage, setMessageRead } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const id = Number((await params).id);
  const { read } = (await req.json().catch(() => ({}))) as { read?: boolean };
  if (!Number.isInteger(id) || typeof read !== 'boolean') return NextResponse.json({ error: 'Неверный запрос' }, { status: 400 });
  setMessageRead(id, read);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'Неверный запрос' }, { status: 400 });
  deleteMessage(id);
  return NextResponse.json({ ok: true });
}
