import { NextResponse } from 'next/server';
import { saveProduct } from '@/lib/db';
import { productSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Проверь поля' }, { status: 400 });
  const product = saveProduct(parsed.data);
  return NextResponse.json({ product });
}
