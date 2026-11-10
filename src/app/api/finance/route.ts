import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();

  const pageRow = db.prepare('SELECT data_en, data_de FROM page_content WHERE page = ?').get('finance') as
    | { data_en: string; data_de: string }
    | undefined;
  if (!pageRow) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const platformRows = db.prepare('SELECT * FROM finance_platforms ORDER BY sort_order').all() as Array<{
    name: string;
    url: string;
    description_en: string;
    description_de: string;
    affiliate_url: string | null;
  }>;

  const resourceRows = db
    .prepare('SELECT name, url, category, category_en, image, description_en, description_de FROM finance_resources ORDER BY sort_order')
    .all() as Array<{
    name: string;
    url: string;
    category: string;
    category_en: string;
    image: string | null;
    description_en: string;
    description_de: string;
  }>;

  const en = JSON.parse(pageRow.data_en);
  const de = JSON.parse(pageRow.data_de);

  en.platforms = platformRows.map((p) => ({ name: p.name, url: p.url, description: p.description_en, affiliateUrl: p.affiliate_url }));
  de.platforms = platformRows.map((p) => ({ name: p.name, url: p.url, description: p.description_de, affiliateUrl: p.affiliate_url }));

  en.resources = resourceRows.map((r) => ({ name: r.name, url: r.url, category: r.category_en, image: r.image, description: r.description_en }));
  de.resources = resourceRows.map((r) => ({ name: r.name, url: r.url, category: r.category, image: r.image, description: r.description_de }));

  return NextResponse.json({ en, de });
}
