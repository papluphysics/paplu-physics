-- ============================================================
--  PAPLU PHYSICS — Migration 004
--  Run this entire file in Supabase SQL Editor → Run
-- ============================================================

-- ── 1. Exam categories table (Standards + Competitive Exams) ─
CREATE TABLE IF NOT EXISTS exam_categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  type       TEXT        NOT NULL CHECK (type IN ('standard','competitive_exam')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, type)
);

ALTER TABLE exam_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exam_cats_public_read"
  ON exam_categories FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "exam_cats_service_all"
  ON exam_categories FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed common defaults
INSERT INTO exam_categories (name, type) VALUES
  ('10',     'standard'),
  ('12',     'standard'),
  ('JEE',    'competitive_exam'),
  ('NEET',   'competitive_exam'),
  ('GUJCET', 'competitive_exam'),
  ('GATE',   'competitive_exam')
ON CONFLICT (name, type) DO NOTHING;

-- Pull class levels from existing categories table
INSERT INTO exam_categories (name, type)
  SELECT DISTINCT class_level, 'standard'
  FROM categories
  WHERE class_level IS NOT NULL AND class_level <> ''
ON CONFLICT (name, type) DO NOTHING;

-- ── 2. Extend papers table ────────────────────────────────────
--    Make category_id nullable so demo papers don't need one
ALTER TABLE papers ALTER COLUMN category_id DROP NOT NULL;

--    Exam category FK (new grouping system)
ALTER TABLE papers ADD COLUMN IF NOT EXISTS exam_category_id UUID
  REFERENCES exam_categories(id) ON DELETE SET NULL;

--    Subject stored directly (free text)
ALTER TABLE papers ADD COLUMN IF NOT EXISTS subject TEXT;

--    PDF URL for demo papers (public direct link)
ALTER TABLE papers ADD COLUMN IF NOT EXISTS pdf_url TEXT;

--    Demo flag
ALTER TABLE papers ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

--    Marking scheme
ALTER TABLE papers ADD COLUMN IF NOT EXISTS marking_scheme TEXT;

-- ── 3. Backfill exam_category_id + subject ────────────────────
UPDATE papers p
SET exam_category_id = ec.id,
    subject          = c.subject
FROM categories c
JOIN exam_categories ec
  ON ec.name = c.class_level AND ec.type = 'standard'
WHERE p.category_id = c.id
  AND p.exam_category_id IS NULL;

-- ── 4. Relax old category column constraints ──────────────────
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_class_level_check;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_subject_check;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_section_check;

-- ── 5. Settings table (idempotent) ────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "settings_select_public" ON settings FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "settings_service_all" ON settings FOR ALL TO service_role USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO settings (key, value) VALUES ('demo_video_url', NULL)
  ON CONFLICT (key) DO NOTHING;
