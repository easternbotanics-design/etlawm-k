-- Migration 016 — Add scientific_name to cms_ingredients
ALTER TABLE cms_ingredients
ADD COLUMN IF NOT EXISTS scientific_name TEXT;
