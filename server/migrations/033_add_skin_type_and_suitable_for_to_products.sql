-- ═══════════════════════════════════════════════════════════════════════════════
--  Migration 033 — Add skin_type and suitable_for to products
--  Safe to re-run: uses IF NOT EXISTS guards.
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS skin_type TEXT,
    ADD COLUMN IF NOT EXISTS suitable_for TEXT;
