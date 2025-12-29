-- Migration: Add all missing columns to payments table
-- Run this in Supabase SQL editor to fix payments table schema

-- Add charge_number column
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS charge_number INTEGER;

-- Add is_recurring column
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;

-- Add webhook_data column (JSONB for storing full webhook payload)
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS webhook_data JSONB;

-- Add subscription_id column if it doesn't exist
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255);

-- Add currency column if it doesn't exist (with default)
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'ILS';

-- Add comments for documentation
COMMENT ON COLUMN payments.charge_number IS 'Charge number for recurring payments (1st, 2nd, 3rd, etc.)';
COMMENT ON COLUMN payments.is_recurring IS 'Whether this is a recurring subscription charge';
COMMENT ON COLUMN payments.webhook_data IS 'Store full webhook payload for debugging';
COMMENT ON COLUMN payments.subscription_id IS 'Allpay subscription ID (for recurring payments)';

-- Verify the columns were added
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'payments' 
-- ORDER BY ordinal_position;

