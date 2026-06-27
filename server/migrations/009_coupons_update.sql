CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type VARCHAR(20) NOT NULL
    CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL
    CHECK (discount_value > 0),
  minimum_order_value NUMERIC(10, 2) DEFAULT 0,
  maximum_discount NUMERIC(10, 2),
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='carts' AND column_name='coupon_id'
    ) THEN
        ALTER TABLE carts ADD COLUMN coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL;
    END IF;
END $$;