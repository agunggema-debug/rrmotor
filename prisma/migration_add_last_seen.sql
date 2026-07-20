-- ============================================================
-- Migration: Add missing last_seen column to VisitorSession
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================

-- Add last_seen column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'VisitorSession' AND column_name = 'last_seen'
  ) THEN
    ALTER TABLE "VisitorSession" ADD COLUMN last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW();
    CREATE INDEX IF NOT EXISTS idx_visitorsession_last_seen ON "VisitorSession"(last_seen);
  END IF;
END $$;

-- ============================================================
-- Migration: Ensure Account password_hash is never empty
-- ============================================================

-- Update any accounts with empty password_hash to a placeholder
-- (these accounts will need password reset)
UPDATE "Account"
SET password_hash = '$argon2id$v=19$m=65536,t=2,p=2$PLACEHOLDER$CHANGE_ME'
WHERE password_hash = '' OR password_hash IS NULL;