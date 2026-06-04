-- ============================================================
--  PAPLU PHYSICS — Ads Feature Migration (001)
--  Run this entire file in Supabase SQL Editor → Run
-- ============================================================

-- ── 1. Add location columns to the existing users table ─────
--    Additive only — no existing data or policies are touched.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS state    TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS city     TEXT;

-- ── 2. Ads table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ads (
  id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url       TEXT    NOT NULL,
  title           TEXT,
  link_url        TEXT,
  -- target_state NULL = national ad visible to everyone
  target_state    TEXT,
  target_district TEXT,
  target_city     TEXT,
  -- region is an admin-supplied label (e.g. 'North Gujarat') for
  -- adjacent-district grouping; tier-3 match when student's district
  -- belongs to the same region.
  region          TEXT,
  expiry_date     DATE    NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  priority        INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ      DEFAULT now()
);

-- ── 3. Row Level Security ────────────────────────────────────
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Students and anonymous visitors may only read active, non-expired ads.
CREATE POLICY "ads_select_public"
  ON ads FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND expiry_date >= CURRENT_DATE);

-- The service_role key (used by the admin API) has full write access.
CREATE POLICY "ads_service_insert"
  ON ads FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "ads_service_update"
  ON ads FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "ads_service_delete"
  ON ads FOR DELETE
  TO service_role
  USING (true);

-- ── 4. Performance indexes ───────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ads_active_expiry ON ads(is_active, expiry_date);
CREATE INDEX IF NOT EXISTS idx_ads_state         ON ads(target_state);

-- ── 5. Supabase Storage bucket for ad poster images ─────────
--    Public bucket — anyone can GET images via the public URL.
INSERT INTO storage.buckets (id, name, public)
  VALUES ('ad-posters', 'ad-posters', true)
  ON CONFLICT (id) DO NOTHING;

-- Public read (so Next.js Image and browsers can load ad posters)
CREATE POLICY "ad_posters_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'ad-posters');

-- Only the service_role (admin upload API) may write / overwrite / delete
CREATE POLICY "ad_posters_service_write"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'ad-posters');

CREATE POLICY "ad_posters_service_update"
  ON storage.objects FOR UPDATE
  TO service_role
  USING (bucket_id = 'ad-posters');

CREATE POLICY "ad_posters_service_delete"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'ad-posters');
