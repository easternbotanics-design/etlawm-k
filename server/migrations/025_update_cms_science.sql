-- ═══════════════════════════════════════════════════════════════════════════════
--  Migration 025 — Update Science CMS Table (Add descriptions array, drop box_1, box_2, box_3, colour)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE cms_science ADD COLUMN IF NOT EXISTS descriptions TEXT[];
ALTER TABLE cms_science DROP COLUMN IF EXISTS box_1;
ALTER TABLE cms_science DROP COLUMN IF EXISTS box_2;
ALTER TABLE cms_science DROP COLUMN IF EXISTS box_3;
ALTER TABLE cms_science DROP COLUMN IF EXISTS colour;

