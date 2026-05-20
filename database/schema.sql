-- ============================================================
--  PAPLU PHYSICS — Complete Database Schema
--  Paste this into Supabase SQL Editor > Run
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT,
  mobile          TEXT UNIQUE,
  email           TEXT UNIQUE,
  referral_code   TEXT UNIQUE NOT NULL DEFAULT upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  referred_by     UUID REFERENCES users(id),
  wallet_balance  NUMERIC(10,2) DEFAULT 0.00,
  is_blocked      BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── DEVICES (max 2 per user) ──────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_fingerprint  TEXT NOT NULL,
  browser_info        TEXT,
  ip_address          TEXT,
  last_login          TIMESTAMPTZ DEFAULT now(),
  created_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, device_fingerprint)
);

-- ── CATEGORIES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_level TEXT NOT NULL CHECK (class_level IN ('10','12')),
  subject     TEXT NOT NULL CHECK (subject IN ('general','math','physics')),
  section     TEXT NOT NULL CHECK (section IN ('pass','75','90','jee','neet','gujcet','board')),
  label_en    TEXT NOT NULL,
  label_gu    TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── PAPERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS papers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en        TEXT NOT NULL,
  title_gu        TEXT NOT NULL,
  description_en  TEXT,
  description_gu  TEXT,
  category_id     UUID REFERENCES categories(id),
  pdf_key         TEXT,      -- Cloudflare R2 object key
  price           NUMERIC(8,2) NOT NULL DEFAULT 25.00,
  paper_count     INT DEFAULT 1,
  is_popular      BOOLEAN DEFAULT false,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── PURCHASES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchases (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id),
  paper_id        UUID NOT NULL REFERENCES papers(id),
  payment_id      TEXT,       -- Razorpay payment ID
  order_id        TEXT,       -- Razorpay order ID
  amount_paid     NUMERIC(8,2) NOT NULL,
  purchase_date   TIMESTAMPTZ DEFAULT now(),
  expiry_date     TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '6 months'),
  UNIQUE (user_id, paper_id)
);

-- ── WALLET TRANSACTIONS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id),
  amount      NUMERIC(8,2) NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('credit','debit')),
  reason      TEXT,  -- 'referral_commission', 'purchase', 'withdrawal', 'refund'
  reference   TEXT,  -- payment_id or withdrawal_id
  status      TEXT DEFAULT 'completed' CHECK (status IN ('pending','completed','failed')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── REFERRALS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id       UUID NOT NULL REFERENCES users(id),
  buyer_id          UUID NOT NULL REFERENCES users(id),
  purchase_id       UUID REFERENCES purchases(id),
  commission_amount NUMERIC(8,2),
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ── WITHDRAWALS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS withdrawals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id),
  amount      NUMERIC(8,2) NOT NULL,
  upi_id      TEXT NOT NULL,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_note  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- ── COUPONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT UNIQUE NOT NULL,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percentage','flat')),
  discount_value  NUMERIC(6,2) NOT NULL,
  max_uses        INT DEFAULT 999,
  uses_count      INT DEFAULT 0,
  expiry_date     DATE,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── DOWNLOAD LOGS (for leak tracking) ────────────────────
CREATE TABLE IF NOT EXISTS download_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id),
  paper_id    UUID NOT NULL REFERENCES papers(id),
  ip_address  TEXT,
  user_agent  TEXT,
  watermark_id TEXT,  -- e.g., UID-X82K9P — shown in watermarked PDF
  downloaded_at TIMESTAMPTZ DEFAULT now()
);

-- ── NOTIFICATIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id),  -- NULL = broadcast to all
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases           ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals         ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs       ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "users_own" ON users         FOR ALL USING (auth.uid() = id);
CREATE POLICY "purchases_own" ON purchases FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "wallet_own" ON wallet_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "withdrawals_own" ON withdrawals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "downloads_own" ON download_logs FOR ALL USING (auth.uid() = user_id);

-- Papers & categories are publicly readable
CREATE POLICY "papers_public"     ON papers     FOR SELECT USING (is_active = true);
CREATE POLICY "categories_public" ON categories FOR SELECT USING (true);
CREATE POLICY "coupons_public"    ON coupons    FOR SELECT USING (is_active = true);

-- ── INDEXES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_purchases_user    ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_paper   ON purchases(paper_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_wallet_user       ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_user      ON devices(user_id);

-- ── SEED CATEGORIES ───────────────────────────────────────
INSERT INTO categories (class_level, subject, section, label_en, label_gu) VALUES
  ('10', 'general', 'pass',   'To Get Pass',  'પાસ થવા માટે'),
  ('10', 'general', '75',     'Above 75%',    '૭૫% થી વધુ'),
  ('10', 'general', '90',     'Above 90%',    '૯૦% થી વધુ'),
  ('12', 'math',    'jee',    'JEE Maths',    'JEE ગણિત'),
  ('12', 'math',    'gujcet', 'GUJCET Maths', 'GUJCET ગણિત'),
  ('12', 'math',    'pass',   'Board Maths Pass', 'બોર્ડ ગણિત પાસ'),
  ('12', 'math',    '75',     'Board Maths 75+',  'બોર્ડ ગણિત ૭૫+'),
  ('12', 'math',    '90',     'Board Maths 90+',  'બોર્ડ ગણિત ૯૦+'),
  ('12', 'physics', 'jee',    'JEE Physics',   'JEE ભૌતિક'),
  ('12', 'physics', 'neet',   'NEET Physics',  'NEET ભૌતિક'),
  ('12', 'physics', 'gujcet', 'GUJCET Physics','GUJCET ભૌતિક'),
  ('12', 'physics', 'pass',   'Board Physics Pass', 'બોર્ડ ભૌતિક પાસ'),
  ('12', 'physics', '75',     'Board Physics 75+',  'બોર્ડ ભૌતિક ૭૫+'),
  ('12', 'physics', '90',     'Board Physics 90+',  'બોર્ડ ભૌતિક ૯૦+')
ON CONFLICT DO NOTHING;
