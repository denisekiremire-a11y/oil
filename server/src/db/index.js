import Database from 'better-sqlite3'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', '..', 'data')
mkdirSync(dataDir, { recursive: true })

export const db = new Database(join(dataDir, 'upca.sqlite3'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
CREATE TABLE IF NOT EXISTS volumes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  volume_id INTEGER NOT NULL REFERENCES volumes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  notes TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS chapters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  self_assessment_completed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  correct_count INTEGER NOT NULL,
  total_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS certifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  target_date TEXT,
  status TEXT NOT NULL DEFAULT 'not_started',
  notes_markdown TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS checklist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cert_id INTEGER NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS study_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  minutes INTEGER NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  context_type TEXT,
  context_id INTEGER,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS class_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cert_id INTEGER NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
  session_date TEXT NOT NULL,
  attended INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  UNIQUE(cert_id, session_date)
);
`)

const volumeCount = db.prepare('SELECT COUNT(*) AS n FROM volumes').get().n
if (volumeCount === 0) {
  const insert = db.prepare('INSERT INTO volumes (name, sort_order) VALUES (?, ?)')
  const seedVolumes = db.transaction((names) => {
    names.forEach((name, i) => insert.run(name, i))
  })
  seedVolumes([
    'Student Handbook',
    'Course Notes',
    'Resource Library',
    'Career Toolkit',
    'Entrepreneurship Workbook',
  ])
}

const certCount = db.prepare('SELECT COUNT(*) AS n FROM certifications').get().n
if (certCount === 0) {
  const insert = db.prepare('INSERT INTO certifications (name, sort_order) VALUES (?, ?)')
  const seedCerts = db.transaction((names) => {
    names.forEach((name, i) => insert.run(name, i))
  })
  seedCerts(['CAPM', 'Petroleum Products Trading', 'Trade Finance & Incoterms'])
}
