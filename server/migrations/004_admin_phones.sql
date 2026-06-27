-- ═══════════════════════════════════════════════════════════════════════════════
--  Migration 004 — Admin Phone Numbers Reservation Table
--  Safe to re-run: uses IF NOT EXISTS guards.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_phones (
    phone_number TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial admin phone numbers
INSERT INTO admin_phones (phone_number) VALUES
('917030577234')
ON CONFLICT (phone_number) DO NOTHING;

-- Synchronise existing users' admin status
UPDATE users
SET is_admin = true
WHERE phone_number IN (SELECT phone_number FROM admin_phones);
