import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();

  const pageRow = db.prepare('SELECT data_en, data_de FROM page_content WHERE page = ?').get('projects') as
    | { data_en: string; data_de: string }
    | undefined;
  if (!pageRow) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const rows = db.prepare('SELECT * FROM projects ORDER BY sort_order').all() as Array<{
    id: string;
    image: string;
    images: string | null;
    status: string;
    year: number | null;
    title_en: string;
    title_de: string;
    description_en: string;
    description_de: string;
    tags_en: string;
    tags_de: string;
    link_label_en: string | null;
    link_label_de: string | null;
    link_url: string | null;
  }>;

  const toProjects = (lang: 'en' | 'de') =>
    rows.map((r) => ({
      id: r.id,
      title: lang === 'en' ? r.title_en : r.title_de,
      description: lang === 'en' ? r.description_en : r.description_de,
      image: r.image,
      images: r.images ? JSON.parse(r.images) : undefined,
      status: r.status,
      year: r.year,
      tags: JSON.parse(lang === 'en' ? r.tags_en : r.tags_de),
      link: r.link_url
        ? { label: lang === 'en' ? r.link_label_en : r.link_label_de, url: r.link_url }
        : undefined
    }));

  const en = JSON.parse(pageRow.data_en);
  const de = JSON.parse(pageRow.data_de);

  en.projects = toProjects('en');
  de.projects = toProjects('de');

  return NextResponse.json({ en, de });
}
