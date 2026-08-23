CREATE TABLE IF NOT EXISTS cms_faqs (
  id BIGSERIAL PRIMARY KEY,

  product_name TEXT NOT NULL,
  product_link TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),

  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
