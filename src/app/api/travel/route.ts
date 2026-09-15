import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();

  const pageRow = db.prepare('SELECT data_en, data_de FROM page_content WHERE page = ?').get('travel') as
    | { data_en: string; data_de: string }
    | undefined;
  if (!pageRow) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const rows = db.prepare('SELECT * FROM travel_destinations ORDER BY sort_order').all() as Array<{
    id: string;
    flag: string;
    image: string;
    image_count: number;
    gallery: string;
    name_en: string;
    name_de: string;
    description_en: string;
    description_de: string;
  }>;

  const toDestinations = (lang: 'en' | 'de') =>
    rows.map((r) => ({
      id: r.id,
      name: lang === 'en' ? r.name_en : r.name_de,
      flag: r.flag,
      description: lang === 'en' ? r.description_en : r.description_de,
      imageCount: r.image_count,
      image: r.image,
      gallery: JSON.parse(r.gallery)
    }));

  const en = JSON.parse(pageRow.data_en);
  const de = JSON.parse(pageRow.data_de);

  en.destinations = toDestinations('en');
  de.destinations = toDestinations('de');

  return NextResponse.json({ en, de });
}
