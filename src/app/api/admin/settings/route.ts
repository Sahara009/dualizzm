import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/db';
import { settingsSchema } from '@/lib/schemas';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  const parsed = settingsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Проверь поля' }, { status: 400 });
  saveSettings(parsed.data);
  return NextResponse.json({ settings: getSettings() });
}
