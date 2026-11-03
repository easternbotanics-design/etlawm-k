-- Migration 034 — Add subtitle and body to ritual_how
ALTER TABLE ritual_how ADD COLUMN IF NOT EXISTS subtitle TEXT DEFAULT '';
ALTER TABLE ritual_how ADD COLUMN IF NOT EXISTS body TEXT DEFAULT '';
ALTER TABLE ritual_how ALTER COLUMN hows DROP NOT NULL;
