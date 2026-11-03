-- ═══════════════════════════════════════════════════════════════════════════════
--  Migration 018 — Early Bird Launch Discounts
--  Safe to re-run: uses IF NOT EXISTS / DO NOTHING guards.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS early_bird_discounts (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_active      BOOLEAN NOT NULL DEFAULT true,
    coupon_code    VARCHAR(50) NOT NULL UNIQUE,
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    discount_type  VARCHAR(20) NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    user_limit     INTEGER NOT NULL DEFAULT 100 CHECK (user_limit > 0),
    starts_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add tracking columns to orders table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='orders' AND column_name='early_bird_discount_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN early_bird_discount_id UUID REFERENCES early_bird_discounts(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='orders' AND column_name='early_bird_discount_amount'
    ) THEN
        ALTER TABLE orders ADD COLUMN early_bird_discount_amount NUMERIC(10, 2) DEFAULT 0.00;
    END IF;
END $$;

-- Add tracking column to carts table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='carts' AND column_name='early_bird_discount_id'
    ) THEN
        ALTER TABLE carts ADD COLUMN early_bird_discount_id UUID REFERENCES early_bird_discounts(id) ON DELETE SET NULL;
    END IF;
END $$;
