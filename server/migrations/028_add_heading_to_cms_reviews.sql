-- Migration 028 — Add heading column to cms_reviews
ALTER TABLE cms_reviews
ADD COLUMN IF NOT EXISTS heading TEXT;
