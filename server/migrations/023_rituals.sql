-- ═══════════════════════════════════════════════════════════════════════════════
--  Migration 023 — Rituals Tables
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Create Rituals Table
CREATE TABLE IF NOT EXISTS rituals (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url   TEXT,
    title       TEXT,
    description TEXT,
    status      TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Rituals Why Table (Why use this ritual?)
CREATE TABLE IF NOT EXISTS rituals_why (
    id          SERIAL PRIMARY KEY,
    ritual_id   UUID NOT NULL REFERENCES rituals(id) ON DELETE CASCADE,
    whys        TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Ritual How Table (How to perform the ritual)
CREATE TABLE IF NOT EXISTS ritual_how (
    id          SERIAL PRIMARY KEY,
    ritual_id   UUID NOT NULL REFERENCES rituals(id) ON DELETE CASCADE,
    hows        TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create Ritual Tips Table (Tips/precautions for the ritual)
CREATE TABLE IF NOT EXISTS ritual_tips (
    id          SERIAL PRIMARY KEY,
    ritual_id   UUID NOT NULL REFERENCES rituals(id) ON DELETE CASCADE,
    tips        TEXT NOT NULL,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create Indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_rituals_product_id ON rituals (product_id);
CREATE INDEX IF NOT EXISTS idx_rituals_why_ritual_id ON rituals_why (ritual_id);
CREATE INDEX IF NOT EXISTS idx_ritual_how_ritual_id ON ritual_how (ritual_id);
CREATE INDEX IF NOT EXISTS idx_ritual_tips_ritual_id ON ritual_tips (ritual_id);

-- 6. Trigger Function to automatically maintain updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create Triggers
DROP TRIGGER IF EXISTS trigger_set_rituals_updated_at ON rituals;
CREATE TRIGGER trigger_set_rituals_updated_at
BEFORE UPDATE ON rituals
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_rituals_why_updated_at ON rituals_why;
CREATE TRIGGER trigger_set_rituals_why_updated_at
BEFORE UPDATE ON rituals_why
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_ritual_how_updated_at ON ritual_how;
CREATE TRIGGER trigger_set_ritual_how_updated_at
BEFORE UPDATE ON ritual_how
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_ritual_tips_updated_at ON ritual_tips;
CREATE TRIGGER trigger_set_ritual_tips_updated_at
BEFORE UPDATE ON ritual_tips
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
