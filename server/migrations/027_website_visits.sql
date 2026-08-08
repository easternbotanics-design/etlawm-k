-- Create website_visits table for analytics tracking
CREATE TABLE IF NOT EXISTS website_visits (
    id BIGSERIAL PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    path TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes on created_at and visitor_id for fast analytics querying
CREATE INDEX IF NOT EXISTS idx_website_visits_created_at ON website_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_website_visits_visitor_id ON website_visits(visitor_id);
