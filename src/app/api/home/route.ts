import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();

  const pageRow = db.prepare('SELECT data_en, data_de FROM page_content WHERE page = ?').get('home') as
    | { data_en: string; data_de: string }
    | undefined;
  if (!pageRow) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const shots = db.prepare('SELECT * FROM home_aerial_shots ORDER BY sort_order').all() as Array<{
    image: string;
    title_en: string;
    title_de: string;
    description_en: string;
    description_de: string;
  }>;

  const videos = db.prepare('SELECT * FROM home_videos ORDER BY sort_order').all() as Array<{
    src: string;
    title_en: string;
    title_de: string;
    description_en: string;
    description_de: string;
  }>;

  const en = JSON.parse(pageRow.data_en);
  const de = JSON.parse(pageRow.data_de);

  en.aerialShots = shots.map((s) => ({ title: s.title_en, image: s.image, description: s.description_en }));
  de.aerialShots = shots.map((s) => ({ title: s.title_de, image: s.image, description: s.description_de }));

  en.videos = videos.map((v) => ({ src: v.src, title: v.title_en, description: v.description_en }));
  de.videos = videos.map((v) => ({ src: v.src, title: v.title_de, description: v.description_de }));

  return NextResponse.json({ en, de });
}
