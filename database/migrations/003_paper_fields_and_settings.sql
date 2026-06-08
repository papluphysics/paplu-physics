-- ============================================================
--  PAPLU PHYSICS — Migration 003
--  Run this entire file in Supabase SQL Editor → Run
-- ============================================================

-- ── 1. Relax category constraints (idempotent) ───────────────
--    Earlier schema may have had CHECK constraints on these columns.
--    Free-text combobox admin form requires them to accept any value.
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_class_level_check;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_subject_check;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_section_check;

-- ── 2. Add is_demo flag to papers ────────────────────────────
--    Default false — existing papers are NOT demo papers.
--    Admin toggles this per paper to make it visible on /demo.
ALTER TABLE papers ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

-- ── 3. Add marking_scheme to papers ──────────────────────────
--    Nullable free-text. Admin fills in e.g.
--    "30 MCQ × 1 mark, 5 long-answer × 5 marks, total 55 marks"
ALTER TABLE papers ADD COLUMN IF NOT EXISTS marking_scheme TEXT;

-- ── 4. Settings table ─────────────────────────────────────────
--    Key/value store for admin-editable site settings.
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read — customer site needs to fetch video URL etc.
CREATE POLICY "settings_select_public"
  ON settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Service role full access — admin API writes via service_role key
CREATE POLICY "settings_service_all"
  ON settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed known keys (null value — admin fills in from Settings page)
INSERT INTO settings (key, value) VALUES ('demo_video_url', NULL)
  ON CONFLICT (key) DO NOTHING;
