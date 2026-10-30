import { NextResponse } from 'next/server';
import { deleteProduct, getProductById, saveProduct } from '@/lib/db';
import { productSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const id = Number((await params).id);
  if (!getProductById(id)) return NextResponse.json({ error: 'Работа не найдена' }, { status: 404 });
  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Проверь поля' }, { status: 400 });
  return NextResponse.json({ product: saveProduct(parsed.data, id) });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const id = Number((await params).id);
  deleteProduct(id);
  return NextResponse.json({ ok: true });
}
