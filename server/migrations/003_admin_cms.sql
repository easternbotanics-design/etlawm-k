-- ═══════════════════════════════════════════════════════════════════════════════
--  Migration 003 — Admin CMS & Product Fields
--  Safe to re-run: uses IF NOT EXISTS guards.
-- ═══════════════════════════════════════════════════════════════════════════════

-- is_admin flag on users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- slug on products (URL-safe, unique, auto-filled on insert via trigger)
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge TEXT;           -- "Best Seller" | "New" | null
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS concerns TEXT[] NOT NULL DEFAULT '{}';

-- Back-fill slugs for any existing rows
UPDATE products SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Trigger to auto-generate slug on product insertion
CREATE OR REPLACE FUNCTION generate_product_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug := regexp_replace(NEW.slug, '^-+|-+$', '', 'g');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_product_slug ON products;
CREATE TRIGGER trigger_generate_product_slug
BEFORE INSERT ON products
FOR EACH ROW
EXECUTE FUNCTION generate_product_slug();
