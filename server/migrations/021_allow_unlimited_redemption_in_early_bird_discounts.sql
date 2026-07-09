-- Migration 021 — Allow unlimited redemption in early bird discounts (-1)
ALTER TABLE early_bird_discounts DROP CONSTRAINT IF EXISTS early_bird_discounts_user_limit_check;
ALTER TABLE early_bird_discounts ADD CONSTRAINT early_bird_discounts_user_limit_check CHECK (user_limit > 0 OR user_limit = -1);
