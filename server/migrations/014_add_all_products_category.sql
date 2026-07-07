-- ═══════════════════════════════════════════════════════════════════════════════
--  Migration 014 — Seed All Products Category
--  Safe to re-run: uses ON CONFLICT DO NOTHING.
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO categories (name, slug, description, subtitle, is_active, image_url)
VALUES (
    'All Products', 
    'all-products', 
    'All Products in ETLAWM', 
    'Pure botanical rituals for hair and skin — crafted with Ayurvedic wisdom', 
    true, 
    '/images/menu/category-placeholder.jpg'
)
ON CONFLICT (slug) DO NOTHING;
