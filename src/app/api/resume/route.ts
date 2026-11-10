import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDb();

  const pageRow = db.prepare('SELECT data_en, data_de FROM page_content WHERE page = ?').get('resume') as
    | { data_en: string; data_de: string }
    | undefined;
  if (!pageRow) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const experienceRows = db.prepare('SELECT * FROM resume_experience ORDER BY sort_order').all() as Array<{
    role_en: string;
    role_de: string;
    company: string;
    period_en: string;
    period_de: string;
    description_en: string;
    description_de: string;
  }>;

  const educationRows = db.prepare('SELECT * FROM resume_education ORDER BY sort_order').all() as Array<{
    degree_en: string;
    degree_de: string;
    institution_en: string;
    institution_de: string;
    period_en: string;
    period_de: string;
    note_en: string;
    note_de: string;
    thesis_en: string;
    thesis_de: string;
    proof: string;
  }>;

  const skillRows = db.prepare('SELECT name FROM resume_skills ORDER BY sort_order').all() as Array<{ name: string }>;

  const certRows = db.prepare('SELECT name_en, name_de, proof, proof_pages FROM resume_certificates ORDER BY sort_order').all() as Array<{
    name_en: string;
    name_de: string;
    proof: string;
    proof_pages: number;
  }>;

  const en = JSON.parse(pageRow.data_en);
  const de = JSON.parse(pageRow.data_de);

  en.experience = experienceRows.map((r) => ({ role: r.role_en, company: r.company, period: r.period_en, description: r.description_en }));
  de.experience = experienceRows.map((r) => ({ role: r.role_de, company: r.company, period: r.period_de, description: r.description_de }));

  // Nachweise liegen als PDF plus WebP-Vorschau in public/certificates/.
  // Seite 1 heißt <proof>.webp, weitere Seiten <proof>-2.webp, <proof>-3.webp usw.
  const certProof = (proof: string, pages = 1) =>
    proof
      ? {
          pdf: `/certificates/${proof}.pdf`,
          images: Array.from({ length: pages }, (_, i) => `/certificates/${proof}${i === 0 ? '' : `-${i + 1}`}.webp`)
        }
      : null;

  en.education = educationRows.map((r) => ({
    degree: r.degree_en,
    institution: r.institution_en,
    period: r.period_en,
    note: r.note_en,
    thesis: r.thesis_en,
    proof: certProof(r.proof)
  }));
  de.education = educationRows.map((r) => ({
    degree: r.degree_de,
    institution: r.institution_de,
    period: r.period_de,
    note: r.note_de,
    thesis: r.thesis_de,
    proof: certProof(r.proof)
  }));

  en.certificates = certRows.map((r) => ({ name: r.name_en, proof: certProof(r.proof, r.proof_pages) }));
  de.certificates = certRows.map((r) => ({ name: r.name_de, proof: certProof(r.proof, r.proof_pages) }));

  const skills = skillRows.map((r) => r.name);

  return NextResponse.json({ en, de, skills });
}
