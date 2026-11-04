import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { seedDatabase } from './seed-data';

// Server-only module: never imported by client components.
// SQLite file lives outside the Next.js build output so it survives rebuilds.
// The content tables are owned by seed-data.ts: whenever the seeded content or
// their schema changes (e.g. after a deploy), they are dropped and reseeded on
// startup, while the API caches and briefings in the same file are kept.

const DB_PATH = path.join(process.cwd(), 'data', 'content.db');

declare global {
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
      hover_video TEXT,
      location TEXT NOT NULL,
      year INTEGER,
      title_en TEXT NOT NULL,
      title_de TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_de TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS home_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sort_order INTEGER NOT NULL,
      src TEXT NOT NULL,
      location TEXT NOT NULL,
      year INTEGER,
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
      year INTEGER,
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
      category TEXT NOT NULL DEFAULT 'Sonstiges',
      category_en TEXT NOT NULL DEFAULT 'Other',
      image TEXT,
      description_en TEXT NOT NULL DEFAULT '',
      description_de TEXT NOT NULL DEFAULT ''
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

    -- Public market quotes (watchlist, ticker band) and the news feed, one row per list.
    CREATE TABLE IF NOT EXISTS market_quote_cache (
      key TEXT PRIMARY KEY,
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

// Tables whose rows come entirely from seed-data.ts.
const SEED_TABLES = [
  'page_content',
  'home_aerial_shots',
  'home_videos',
  'projects',
  'travel_destinations',
  'setup_components',
  'finance_platforms',
  'finance_resources',
  'resume_experience',
  'resume_education',
  'resume_skills',
  'resume_certificates',
  'stock_positions'
] as const;

// Caches derived from seeded rows; stale once those rows change.
const DERIVED_CACHE_TABLES = ['stock_portfolio_cache'] as const;

// Fingerprint of what seeding would produce right now (schema and rows),
// computed against a throwaway in-memory database.
function seedFingerprint(): string {
  const mem = new DatabaseSync(':memory:');
  try {
    createSchema(mem);
    seedDatabase(mem);
    const hash = createHash('sha256');
    for (const table of SEED_TABLES) {
      const { sql } = mem.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = ?").get(table) as {
        sql: string;
      };
      hash.update(sql);
      hash.update(JSON.stringify(mem.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all()));
    }
    return hash.digest('hex');
  } finally {
    mem.close();
  }
}

function openContentDb(dbPath: string): DatabaseSync {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);');
  createSchema(db);

  const fingerprint = seedFingerprint();
  const stored = db.prepare("SELECT value FROM meta WHERE key = 'seed_fingerprint'").get() as
    | { value: string }
    | undefined;

  if (stored?.value !== fingerprint) {
    seedDatabase(db, (tx) => {
      for (const table of SEED_TABLES) tx.exec(`DROP TABLE IF EXISTS ${table};`);
      for (const table of DERIVED_CACHE_TABLES) tx.exec(`DELETE FROM ${table};`);
      createSchema(tx);
      tx.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('seed_fingerprint', ?)").run(fingerprint);
    });
  }

  return db;
}

function getDb(): DatabaseSync {
  if (globalThis.__contentDb) return globalThis.__contentDb;
  globalThis.__contentDb = openContentDb(DB_PATH);
  return globalThis.__contentDb;
}

export { getDb, openContentDb };
