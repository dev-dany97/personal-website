import { afterEach, describe, expect, it } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openContentDb } from './db';

const dirs: string[] = [];

function tempDbPath(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'content-db-'));
  dirs.push(dir);
  return path.join(dir, 'content.db');
}

afterEach(() => {
  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

function homeContent(db: DatabaseSync) {
  const row = db.prepare("SELECT data_en FROM page_content WHERE page = 'home'").get() as { data_en: string };
  return JSON.parse(row.data_en);
}

describe('openContentDb', () => {
  it('seeds a new database', () => {
    const db = openContentDb(tempDbPath());
    expect(homeContent(db).aboutIntro).toBeInstanceOf(Array);
    db.close();
  });

  it('reseeds stale content left by an older version but keeps caches', () => {
    const dbPath = tempDbPath();
    const old = new DatabaseSync(dbPath);
    old.exec(`
      CREATE TABLE page_content (page TEXT PRIMARY KEY, data_en TEXT NOT NULL, data_de TEXT NOT NULL);
      INSERT INTO page_content VALUES ('home', '{"heroTitle1":"old"}', '{"heroTitle1":"alt"}');
      CREATE TABLE projects (id TEXT PRIMARY KEY, sort_order INTEGER NOT NULL, image TEXT NOT NULL);
      INSERT INTO projects VALUES ('old-project', 0, 'old.png');
      CREATE TABLE valorant_profile_cache (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL, updated_at TEXT NOT NULL);
      INSERT INTO valorant_profile_cache VALUES (1, '{"cached":true}', '2026-11-01');
    `);
    old.close();

    const db = openContentDb(dbPath);
    expect(homeContent(db).aboutIntro).toBeInstanceOf(Array);
    const columns = (db.prepare('PRAGMA table_info(projects)').all() as { name: string }[]).map((c) => c.name);
    expect(columns).toContain('images');
    expect(db.prepare("SELECT COUNT(*) AS n FROM projects WHERE id = 'old-project'").get()).toEqual({ n: 0 });
    expect(db.prepare('SELECT data FROM valorant_profile_cache').get()).toEqual({ data: '{"cached":true}' });
    db.close();
  });

  it('does not reseed when the content is unchanged', () => {
    const dbPath = tempDbPath();
    openContentDb(dbPath).close();

    const edit = new DatabaseSync(dbPath);
    edit.exec("UPDATE projects SET sort_order = 999 WHERE rowid = (SELECT MIN(rowid) FROM projects)");
    edit.close();

    const db = openContentDb(dbPath);
    expect(db.prepare('SELECT COUNT(*) AS n FROM projects WHERE sort_order = 999').get()).toEqual({ n: 1 });
    db.close();
  });
});
