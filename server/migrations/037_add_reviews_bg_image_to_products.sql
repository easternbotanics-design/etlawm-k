-- ═══════════════════════════════════════════════════════════════════════════════
--  Migration 037 — Add reviews_bg_image to products
--  Safe to re-run: uses IF NOT EXISTS guard.
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS reviews_bg_image TEXT;
