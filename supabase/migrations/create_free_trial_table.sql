-- Create free_trial table for tracking free trial form submissions
CREATE TABLE IF NOT EXISTS free_trial (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  
  -- Reservation Preferences
  reservation_with TEXT NOT NULL,
  number_of_people TEXT,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('recurring', 'specific-dates')),
  
  -- Recurring Booking Fields
  frequency TEXT CHECK (frequency IN ('weekly', 'biweekly')),
  preferred_day TEXT,
  preferred_time TEXT NOT NULL,
  start_date_option TEXT,
  
  -- Specific Dates (stored as JSONB array)
  specific_dates JSONB DEFAULT '[]'::jsonb,
  
  -- Additional Preferences (all optional)
  favorite_restaurants TEXT,
  restaurants_to_try TEXT,
  dietary_restrictions TEXT,
  cuisines_to_avoid TEXT,
  additional_notes TEXT,
  additional_info TEXT,
  
  -- Metadata
  email_sent BOOLEAN DEFAULT FALSE,
  email_id TEXT
);

-- Create index on email for quick lookups
CREATE INDEX IF NOT EXISTS idx_free_trial_email ON free_trial(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_free_trial_created_at ON free_trial(created_at DESC);

-- Create index on booking_type for filtering
CREATE INDEX IF NOT EXISTS idx_free_trial_booking_type ON free_trial(booking_type);

-- Enable Row Level Security (RLS) - adjust policies as needed
ALTER TABLE free_trial ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to insert (for API routes)
-- Note: You'll need to create this policy in Supabase dashboard or via SQL
-- CREATE POLICY "Service role can insert free trial submissions"
-- ON free_trial
-- FOR INSERT
-- TO service_role
-- WITH CHECK (true);

-- Policy to allow service role to read (for admin access)
-- CREATE POLICY "Service role can read free trial submissions"
-- ON free_trial
-- FOR SELECT
-- TO service_role
-- USING (true);

