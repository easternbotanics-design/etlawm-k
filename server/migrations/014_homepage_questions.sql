-- Migration 014 — Homepage Questions table
CREATE TABLE IF NOT EXISTS homepage_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_homepage_questions_email ON homepage_questions (email);
CREATE INDEX IF NOT EXISTS idx_homepage_questions_created ON homepage_questions (created_at);
