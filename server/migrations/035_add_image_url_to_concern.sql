-- Migration 035 — Add image_url to concern table
ALTER TABLE concern ADD COLUMN IF NOT EXISTS image_url TEXT;
