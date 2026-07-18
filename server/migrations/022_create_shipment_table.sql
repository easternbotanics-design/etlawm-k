-- ═══════════════════════════════════════════════════════════════════════════════
--  Migration 022 — Create Shipment Table & Automated Payment Trigger
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Create Shipment Table
CREATE TABLE IF NOT EXISTS shipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_details TEXT,
    delivery_address TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unpacked' CHECK (status IN ('packed', 'unpacked')),
    tracking_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Populate Shipment Table with Existing Paid/Shipped/Delivered Orders
INSERT INTO shipment (order_id, name, contact_details, delivery_address, status, tracking_id)
SELECT 
    o.id AS order_id,
    o.shipping_name AS name,
    COALESCE(u.phone_number, '') || ' / ' || COALESCE(u.email, '') AS contact_details,
    o.shipping_line1 || ', ' || o.shipping_city || ', ' || o.shipping_state || ' - ' || o.shipping_pincode AS delivery_address,
    CASE 
        WHEN o.status = 'delivered' OR o.status = 'shipped' THEN 'packed'::text
        ELSE 'unpacked'::text
    END AS status,
    o.tracking_id
FROM orders o
JOIN users u ON u.id = o.user_id
WHERE o.status IN ('paid', 'shipped', 'delivered')
ON CONFLICT (order_id) DO NOTHING;

-- 3. Create Trigger Function to Automatically Create Shipment on Status = 'paid'
CREATE OR REPLACE FUNCTION create_shipment_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'paid' AND (TG_OP = 'INSERT' OR OLD.status IS NULL OR OLD.status <> 'paid') THEN
        INSERT INTO shipment (order_id, name, contact_details, delivery_address, status, tracking_id)
        SELECT 
            NEW.id,
            NEW.shipping_name,
            COALESCE(u.phone_number, '') || ' / ' || COALESCE(u.email, ''),
            NEW.shipping_line1 || ', ' || NEW.shipping_city || ', ' || NEW.shipping_state || ' - ' || NEW.shipping_pincode,
            'unpacked',
            NEW.tracking_id
        FROM users u
        WHERE u.id = NEW.user_id
        ON CONFLICT (order_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create Trigger on Orders Table
CREATE OR REPLACE TRIGGER trigger_create_shipment
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION create_shipment_on_payment();
