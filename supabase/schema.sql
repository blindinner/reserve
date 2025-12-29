-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(255) NOT NULL UNIQUE, -- Allpay order ID
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  plan VARCHAR(50) NOT NULL, -- 'weekly', 'biweekly', 'business'
  billing_frequency VARCHAR(50) NOT NULL, -- 'monthly', 'annual'
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'cancelled', 'active', 'cancelled'
  subscription_id VARCHAR(255), -- Allpay subscription ID (if applicable)
  is_subscription BOOLEAN DEFAULT true, -- Whether this is a subscription order
  next_charge_date DATE, -- Expected date of next recurring charge (for subscription tracking)
  last_payment_date DATE, -- Date of last successful payment received via webhook
  reservation_with VARCHAR(100), -- 'spouse', 'kids', etc.
  number_of_people INTEGER,
  preferred_day VARCHAR(20), -- 'monday', 'tuesday', etc.
  preferred_time TIME, -- Store as TIME type
  start_date_option VARCHAR(50), -- 'this-week', 'next-week'
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_subscription_id ON orders(subscription_id);
CREATE INDEX IF NOT EXISTS idx_orders_next_charge_date ON orders(next_charge_date) WHERE next_charge_date IS NOT NULL;

-- Payments table (for tracking payment status from webhooks)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(255) NOT NULL,
  transaction_id VARCHAR(255), -- Allpay transaction ID
  subscription_id VARCHAR(255), -- Allpay subscription ID (for recurring payments)
  charge_number INTEGER, -- Charge number for recurring payments (1st, 2nd, etc.)
  status VARCHAR(50) NOT NULL, -- 'success', 'failed', 'pending', 'cancelled'
  amount DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'ILS',
  is_recurring BOOLEAN DEFAULT false, -- Whether this is a recurring subscription charge
  webhook_data JSONB, -- Store full webhook payload for debugging
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Create index on order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
-- Drop existing triggers if they exist (for re-running schema)
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;

-- Create triggers
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

