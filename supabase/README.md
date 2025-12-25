# Supabase Setup for Free Trial Submissions

This directory contains the database schema for tracking free trial form submissions.

## Setup Instructions

### 1. Create the Table in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL migration file: `migrations/create_free_trial_table.sql`
4. Or copy and paste the SQL directly into the SQL editor

### 2. Set Up Row Level Security (RLS) Policies

After creating the table, you need to set up RLS policies to allow your API to insert records:

**Option A: Using Service Role (Recommended for API routes)**
- Your API uses the service role key which bypasses RLS
- No additional policies needed if you're using service role

**Option B: Using Policies (if not using service role)**
```sql
-- Allow authenticated service role to insert
CREATE POLICY "Service role can insert free trial submissions"
ON free_trial
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow authenticated service role to read
CREATE POLICY "Service role can read free trial submissions"
ON free_trial
FOR SELECT
TO service_role
USING (true);
```

### 3. Environment Variables

Make sure you have these environment variables set in your `.env.local` or deployment environment:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

You can find these in your Supabase project settings:
- **Project Settings** → **API** → Copy the URL and service_role key

### 4. Verify the Setup

After setting up:
- Submit a test form submission
- Check your Supabase dashboard → **Table Editor** → `free_trial` table
- You should see the new record with all the form data

## Table Structure

The `free_trial` table includes:

- **Personal Information**: first_name, last_name, email, phone_number, address
- **Reservation Preferences**: reservation_with, number_of_people, booking_type
- **Recurring Fields**: frequency, preferred_day, preferred_time, start_date_option
- **Specific Dates**: specific_dates (JSONB array)
- **Additional Preferences**: favorite_restaurants, restaurants_to_try, dietary_restrictions, cuisines_to_avoid, additional_notes, additional_info
- **Metadata**: id (UUID), created_at, email_sent, email_id

## Notes

- The table uses JSONB for `specific_dates` to store the array of date entries with their individual settings
- All optional fields (additional preferences) allow NULL values
- The `created_at` timestamp is automatically set when a record is inserted
- The `email_sent` and `email_id` fields are updated after the email is successfully sent

