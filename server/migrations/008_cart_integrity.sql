-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 008 — Cart Integrity, Guest Cart Support and Category Repair
-- Safe to run after the existing migrations.
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── Repair category fields from the malformed end of Migration 006 ──────────

ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS slug VARCHAR(140),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS subtitle TEXT,
    ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug_unique
ON categories (slug)
WHERE slug IS NOT NULL AND slug <> '';

-- ─── Add cart timestamps ─────────────────────────────────────────────────────

ALTER TABLE carts
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE cart_items
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ─── Clean invalid legacy cart rows before adding constraints ────────────────

-- A user cart should not also remain associated with a guest ID.
UPDATE carts
SET guest_id = NULL
WHERE user_id IS NOT NULL
  AND guest_id IS NOT NULL;

-- Remove completely ownerless carts.
DELETE FROM carts
WHERE user_id IS NULL
  AND guest_id IS NULL;

-- Remove invalid cart quantities.
DELETE FROM cart_items
WHERE quantity <= 0;

-- ─── Ensure every cart has exactly one owner ─────────────────────────────────

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'carts_exactly_one_owner_check'
    ) THEN
        ALTER TABLE carts
        ADD CONSTRAINT carts_exactly_one_owner_check
        CHECK (
            (user_id IS NOT NULL AND guest_id IS NULL)
            OR
            (user_id IS NULL AND guest_id IS NOT NULL)
        );
    END IF;
END $$;

-- ─── Quantity must always be positive ────────────────────────────────────────

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'cart_items_quantity_positive_check'
    ) THEN
        ALTER TABLE cart_items
        ADD CONSTRAINT cart_items_quantity_positive_check
        CHECK (quantity > 0);
    END IF;
END $$;

-- ─── Helpful cart indexes ────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_carts_user_id
ON carts (user_id)
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_carts_guest_id
ON carts (guest_id)
WHERE guest_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id
ON cart_items (cart_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_product_id
ON cart_items (product_id);

-- ─── Automatically maintain updated_at ──────────────────────────────────────

CREATE OR REPLACE FUNCTION set_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_carts_updated_at ON carts;

CREATE TRIGGER trigger_set_carts_updated_at
BEFORE UPDATE ON carts
FOR EACH ROW
EXECUTE FUNCTION set_cart_updated_at();

DROP TRIGGER IF EXISTS trigger_set_cart_items_updated_at ON cart_items;

CREATE TRIGGER trigger_set_cart_items_updated_at
BEFORE UPDATE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION set_cart_updated_at();

COMMIT;