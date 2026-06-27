-- Migration 013 — Convert OTP storage for 2Factor sessions

ALTER TABLE otp_codes
ADD COLUMN IF NOT EXISTS session_id TEXT;

ALTER TABLE otp_codes
ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT '2factor';

ALTER TABLE otp_codes
ALTER COLUMN otp_hash DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_otp_codes_session_id
ON otp_codes (session_id);