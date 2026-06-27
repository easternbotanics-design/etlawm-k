-- ═══════════════════════════════════════════════════════════════════════════════
--  Migration 002 — Add whatsapp_opt_in to users
--  Safe to re-run: uses IF NOT EXISTS guard.
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN NOT NULL DEFAULT false;
