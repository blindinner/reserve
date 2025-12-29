-- Migration: Add charge_number column to payments table
-- Run this in Supabase SQL editor

-- Add charge_number column to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS charge_number INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN payments.charge_number IS 'Charge number for recurring payments (1st, 2nd, 3rd, etc.)';

-- Verify the column was added
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'payments' AND column_name = 'charge_number';

