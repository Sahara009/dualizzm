import { NextResponse } from 'next/server';
import { OrderError, setOrderStatus } from '@/lib/db';
import { statusSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = statusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Неизвестный статус' }, { status: 400 });
  try {
    const order = setOrderStatus(id, parsed.data.status);
    if (!order) return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    return NextResponse.json({ order });
  } catch (e) {
    if (e instanceof OrderError) return NextResponse.json({ error: e.message }, { status: 409 });
    throw e;
  }
}
