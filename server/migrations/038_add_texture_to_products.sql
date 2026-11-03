-- ═══════════════════════════════════════════════════════════════════════════════
--  Migration 038 — Add texture to products
--  Safe to re-run: uses IF NOT EXISTS guards.
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS texture TEXT;
