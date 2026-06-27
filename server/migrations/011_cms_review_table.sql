CREATE TABLE IF NOT EXISTS cms_reviews (
  id BIGSERIAL PRIMARY KEY,

  customer_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_link TEXT,
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  review TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),

  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);