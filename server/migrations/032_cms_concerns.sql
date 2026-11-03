CREATE TABLE IF NOT EXISTS concern (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO concern (name, slug)
VALUES
  ('Hair Fall', 'hair-fall'),
  ('Dandruff', 'dandruff'),
  ('Acne', 'acne'),
  ('Glow', 'glow'),
  ('Dryness', 'dryness')
ON CONFLICT (slug) DO NOTHING;
