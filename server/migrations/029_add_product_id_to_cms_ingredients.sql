-- Migration 029 — Add product_id to cms_ingredients
ALTER TABLE cms_ingredients
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;
