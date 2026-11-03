DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='orders' AND column_name='shipment_status'
    ) THEN
        ALTER TABLE orders ADD COLUMN shipment_status VARCHAR(20) DEFAULT 'unpacked';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='orders' AND column_name='tracking_id'
    ) THEN
        ALTER TABLE orders ADD COLUMN tracking_id VARCHAR(100) DEFAULT NULL;
    END IF;
END $$;
