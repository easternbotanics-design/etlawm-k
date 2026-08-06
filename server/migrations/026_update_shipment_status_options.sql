-- ═══════════════════════════════════════════════════════════════════════════════
--  Migration 026 — Update Shipment Status Options to unpacked, dispatched, delivered
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Drop existing check constraint on shipment table if present
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'shipment' AND constraint_name = 'shipment_status_check'
    ) THEN
        ALTER TABLE shipment DROP CONSTRAINT shipment_status_check;
    END IF;
END $$;

-- 2. Migrate existing 'packed' statuses to 'dispatched'
UPDATE shipment SET status = 'dispatched' WHERE status = 'packed';
UPDATE orders SET shipment_status = 'dispatched' WHERE shipment_status = 'packed';

-- 3. Add updated check constraint to shipment table
ALTER TABLE shipment ADD CONSTRAINT shipment_status_check CHECK (status IN ('unpacked', 'dispatched', 'delivered'));
