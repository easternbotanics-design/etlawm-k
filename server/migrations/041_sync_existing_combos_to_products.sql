INSERT INTO products (id, name, slug, price, original_price, badge, description, stock_qty, is_active)
SELECT 
  c.id,
  c.name,
  COALESCE(c.slug, LOWER(REPLACE(c.name, ' ', '-'))),
  COALESCE(c.price, 999),
  c.original_price,
  COALESCE(c.badge, 'combo'),
  c.description,
  9999,
  c.is_active
FROM combos c
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  badge = EXCLUDED.badge,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

INSERT INTO product_images (product_id, image_url, is_primary)
SELECT c.id, c.image_url, true
FROM combos c
WHERE c.image_url IS NOT NULL AND c.image_url != ''
ON CONFLICT DO NOTHING;
