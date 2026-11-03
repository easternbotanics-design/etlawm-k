-- Migration 015 — Ingredients CMS table
CREATE TABLE IF NOT EXISTS cms_ingredients (
  id BIGSERIAL PRIMARY KEY,

  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  para1 TEXT NOT NULL,
  para2 TEXT NOT NULL,
  para3 TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),

  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
