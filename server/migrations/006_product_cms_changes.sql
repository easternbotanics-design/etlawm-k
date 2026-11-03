-- ═══════════════════════════════════════════════════════════════════════════════
--  Migration 006 — Extended Product CMS Fields
--  Safe to re-run: uses IF NOT EXISTS guards.
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS code TEXT,
    ADD COLUMN IF NOT EXISTS discount_value NUMERIC(10,2),
    ADD COLUMN IF NOT EXISTS discount_type TEXT NOT NULL DEFAULT 'percentage',
    ADD COLUMN IF NOT EXISTS size_value NUMERIC(10,2),
    ADD COLUMN IF NOT EXISTS size_unit TEXT,
    ADD COLUMN IF NOT EXISTS ingredients TEXT,
    ADD COLUMN IF NOT EXISTS usage_instructions TEXT,
    ADD COLUMN IF NOT EXISTS benefits TEXT[],
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS seo_title TEXT,
    ADD COLUMN IF NOT EXISTS seo_description TEXT,
    ADD COLUMN IF NOT EXISTS is_draft BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_code_unique
ON products (code)
WHERE code IS NOT NULL AND code <> '';

CREATE INDEX IF NOT EXISTS idx_products_status
ON products (status);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'products_status_check'
    ) THEN
        ALTER TABLE products
        ADD CONSTRAINT products_status_check
        CHECK (status IN ('active', 'out_of_stock', 'archived', 'draft'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'products_discount_type_check'
    ) THEN
        ALTER TABLE products
        ADD CONSTRAINT products_discount_type_check
        CHECK (discount_type IN ('percentage', 'amount'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'products_discount_value_check'
    ) THEN
        ALTER TABLE products
        ADD CONSTRAINT products_discount_value_check
        CHECK (
            discount_value IS NULL
            OR (
                discount_value >= 0
                AND (
                    discount_type <> 'percentage'
                    OR discount_value <= 100
                )
            )
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'products_size_value_check'
    ) THEN
        ALTER TABLE products
        ADD CONSTRAINT products_size_value_check
        CHECK (size_value IS NULL OR size_value >= 0);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'products_stock_qty_check'
    ) THEN
        ALTER TABLE products
        ADD CONSTRAINT products_stock_qty_check
        CHECK (stock_qty >= 0);
    END IF;
END $$;

UPDATE products
SET status = CASE
    WHEN is_active = false THEN 'archived'
    WHEN stock_qty <= 0 THEN 'out_of_stock'
    ELSE 'active'
END
WHERE status IS NULL OR status = '';

UPDATE products
SET seo_title = name
WHERE seo_title IS NULL OR seo_title = '';

UPDATE products
SET seo_description = left(description, 160)
WHERE (seo_description IS NULL OR seo_description = '')
  AND description IS NOT NULL;

CREATE OR REPLACE FUNCTION set_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_products_updated_at ON products;
CREATE TRIGGER trigger_set_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_products_updated_at();

CREATE INDEX IF NOT EXISTS idx_product_images_product_sort
ON product_images (product_id, sort_order);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_one_primary
ON product_images (product_id)
WHERE is_primary = true;