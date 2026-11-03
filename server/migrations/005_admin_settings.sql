-- ═══════════════════════════════════════════════════════════════════════════════
--  Migration 005 — Admin Settings Table
--  Safe to re-run: uses IF NOT EXISTS guard.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial default settings if they don't exist
INSERT INTO admin_settings (key, value) VALUES
('store_name', 'ETLAWM'),
('support_email', 'support@etlawm.com'),
('low_stock_threshold', '5'),
('enable_whatsapp_notifications', 'true')
ON CONFLICT (key) DO NOTHING;
