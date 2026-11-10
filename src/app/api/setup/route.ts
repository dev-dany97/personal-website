import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();

  const pageRow = db.prepare('SELECT data_en, data_de FROM page_content WHERE page = ?').get('setup') as
    | { data_en: string; data_de: string }
    | undefined;
  if (!pageRow) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const rows = db.prepare('SELECT * FROM setup_components ORDER BY build, sort_order').all() as Array<{
    build: string;
    label: string;
    value_en: string;
    value_de: string;
    image: string | null;
  }>;

  const primary = rows.filter((r) => r.build === 'primary');
  const second = rows.filter((r) => r.build === 'second');
  const server = rows.filter((r) => r.build === 'server');

  const primaryComponents = primary.map((r) => ({ label: r.label, value: r.value_en, image: r.image ?? undefined }));

  const en = JSON.parse(pageRow.data_en);
  const de = JSON.parse(pageRow.data_de);

  en.pc2Components = second.map((r) => ({ label: r.label, value: r.value_en }));
  de.pc2Components = second.map((r) => ({ label: r.label, value: r.value_de }));
  en.serverComponents = server.map((r) => ({ label: r.label, value: r.value_en, image: r.image ?? undefined }));
  de.serverComponents = server.map((r) => ({ label: r.label, value: r.value_de, image: r.image ?? undefined }));

  return NextResponse.json({ primaryComponents, en, de });
}
