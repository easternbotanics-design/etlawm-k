CREATE TABLE IF NOT EXISTS cms_videos (
  id BIGSERIAL PRIMARY KEY,

  title TEXT,
  video_url TEXT NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  description TEXT,
  thumbnail_url TEXT,

  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),

  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
