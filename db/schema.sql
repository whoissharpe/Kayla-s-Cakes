-- Kayla's Cakes — lead store (Cloudflare D1)
-- Apply:  npm run db:remote

CREATE TABLE IF NOT EXISTS leads (
  id            TEXT PRIMARY KEY,
  created_at    TEXT NOT NULL,
  name          TEXT NOT NULL,
  contact_method TEXT NOT NULL,
  phone         TEXT,
  email         TEXT,
  event_date    TEXT NOT NULL,
  item_type     TEXT NOT NULL,
  flavor        TEXT,
  servings      TEXT,
  theme         TEXT,
  budget        TEXT,
  notes         TEXT,
  photo_keys    TEXT,               -- JSON array of R2 object keys
  status        TEXT NOT NULL DEFAULT 'new',
  admin_notes   TEXT,
  updated_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status  ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_event   ON leads (event_date);

-- Rate limiting: one row per submission, pruned as it goes.
CREATE TABLE IF NOT EXISTS submissions (
  ip         TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_submissions ON submissions (ip, created_at);
