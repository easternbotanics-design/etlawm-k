-- ═══════════════════════════════════════════════════════════════════════════════
--  Migration 024 — Science CMS Table
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS cms_science (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    box_1       TEXT,
    box_2       TEXT,
    box_3       TEXT,
    image_url   TEXT,
    colour      VARCHAR(50),
    status      VARCHAR(20) DEFAULT 'published',
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_set_cms_science_updated_at ON cms_science;
CREATE TRIGGER trigger_set_cms_science_updated_at
BEFORE UPDATE ON cms_science
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
