-- Migration: Add recurring payment tracking fields to orders table
-- Run this in Supabase SQL editor to add the new fields to existing database

-- First, add any missing columns that might not exist yet
-- Add subscription_id column if it doesn't exist (needed for index)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subscription_id VARCHAR(255);

-- Add is_subscription column if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS is_subscription BOOLEAN DEFAULT true;

-- Add next_charge_date column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS next_charge_date DATE;

-- Add last_payment_date column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS last_payment_date DATE;

-- Create index on subscription_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_subscription_id ON orders(subscription_id) WHERE subscription_id IS NOT NULL;

-- Create index on next_charge_date for finding overdue payments
CREATE INDEX IF NOT EXISTS idx_orders_next_charge_date ON orders(next_charge_date) WHERE next_charge_date IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN orders.next_charge_date IS 'Expected date of next recurring charge (for subscription tracking)';
COMMENT ON COLUMN orders.last_payment_date IS 'Date of last successful payment received via webhook';

