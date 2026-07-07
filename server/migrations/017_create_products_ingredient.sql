-- Migration 017 — Create products_ingredient table
CREATE TABLE IF NOT EXISTS products_ingredient (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id BIGINT NOT NULL REFERENCES cms_ingredients(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, ingredient_id)
);
