import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { seedDatabase } from './seed-data';

// Server-only module: never imported by client components.
// SQLite file lives outside the Next.js build output so it survives rebuilds;
// it is regenerated from seed-data.ts automatically if missing or empty.

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'content.db');

declare global {
  // eslint-disable-next-line no-var
  var __contentDb: DatabaseSync | undefined;
}

function createSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS page_content (
      page TEXT PRIMARY KEY,
      data_en TEXT NOT NULL,
      data_de TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS home_aerial_shots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sort_order INTEGER NOT NULL,
      image TEXT NOT NULL,
      title_en TEXT NOT NULL,
      title_de TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_de TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS home_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sort_order INTEGER NOT NULL,
      src TEXT NOT NULL,
      title_en TEXT NOT NULL,
      title_de TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_de TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      sort_order INTEGER NOT NULL,
      image TEXT NOT NULL,
      images TEXT,
      status TEXT NOT NULL,
      title_en TEXT NOT NULL,
      title_de TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_de TEXT NOT NULL,
      tags_en TEXT NOT NULL,
      tags_de TEXT NOT NULL,
      link_label_en TEXT,
      link_label_de TEXT,
      link_url TEXT
    );

    CREATE TABLE IF NOT EXISTS travel_destinations (
      id TEXT PRIMARY KEY,
      sort_order INTEGER NOT NULL,
      flag TEXT NOT NULL,
      image TEXT NOT NULL,
      image_count INTEGER NOT NULL,
      gallery TEXT NOT NULL,
      name_en TEXT NOT NULL,
      name_de TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_de TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS setup_components (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      build TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      label TEXT NOT NULL,
      value_en TEXT NOT NULL,
      value_de TEXT NOT NULL,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS finance_platforms (
      id TEXT PRIMARY KEY,
      sort_order INTEGER NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_de TEXT NOT NULL,
      affiliate_url TEXT
    );

    CREATE TABLE IF NOT EXISTS finance_resources (
      id TEXT PRIMARY KEY,
      sort_order INTEGER NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Sonstiges'
    );

    CREATE TABLE IF NOT EXISTS resume_experience (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sort_order INTEGER NOT NULL,
      role_en TEXT NOT NULL,
      role_de TEXT NOT NULL,
      company TEXT NOT NULL,
      period_en TEXT NOT NULL,
      period_de TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_de TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resume_education (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sort_order INTEGER NOT NULL,
      degree_en TEXT NOT NULL,
      degree_de TEXT NOT NULL,
      institution_en TEXT NOT NULL,
      institution_de TEXT NOT NULL,
      period_en TEXT NOT NULL,
      period_de TEXT NOT NULL,
      note_en TEXT NOT NULL,
      note_de TEXT NOT NULL,
      thesis_en TEXT NOT NULL,
      thesis_de TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resume_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sort_order INTEGER NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS resume_certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sort_order INTEGER NOT NULL,
      name_en TEXT NOT NULL,
      name_de TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS finance_briefings (
      briefing_date TEXT NOT NULL,
      lang TEXT NOT NULL,
      content TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      PRIMARY KEY (briefing_date, lang)
    );

    -- Single-row cache: only ever stores asset symbols + percentages, never
    -- absolute balances or values (see /api/binance-portfolio).
    CREATE TABLE IF NOT EXISTS binance_portfolio_cache (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Manually entered stock positions (no public Trade Republic API).
    -- Quantity/buy_price stay server-side only, used to compute % allocation
    -- and % gain — never exposed directly (see /api/stock-portfolio).
    CREATE TABLE IF NOT EXISTS stock_positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity REAL NOT NULL,
      buy_price REAL NOT NULL,
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stock_portfolio_cache (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Daily index series (% of a cost-basis proxy), never absolute values.
    CREATE TABLE IF NOT EXISTS portfolio_history_cache (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS valorant_profile_cache (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

function getDb(): DatabaseSync {
  if (globalThis.__contentDb) return globalThis.__contentDb;

  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL;');
  createSchema(db);

  const row = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
  if (row.count === 0) {
    seedDatabase(db);
  }

  globalThis.__contentDb = db;
  return db;
}

export { getDb };
