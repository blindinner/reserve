# Supabase Database Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: `rendeza` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for project to be set up (takes 1-2 minutes)

## Step 2: Get Your Supabase Credentials

1. Go to **Settings** → **API**
2. You'll need:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon public** key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** key (`SUPABASE_SERVICE_ROLE_KEY`) - **Keep this secret!**

## Step 3: Run the Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

This creates:
- `customers` table - Stores customer information
- `orders` table - Stores order details
- `payments` table - Tracks payment status from Allpay webhooks

## Step 4: Add Environment Variables

Add these to your `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important:**
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe to expose (used client-side)
- `SUPABASE_SERVICE_ROLE_KEY` must stay secret (only used server-side)
- Never commit `.env.local` to git (already in `.gitignore`)

## Step 5: Set Up Row Level Security (RLS) - Optional but Recommended

For production, you should set up RLS policies. For now, the service role key will work, but you can set up RLS later for better security.

## Step 6: Verify Setup

1. Restart your Next.js dev server: `npm run dev`
2. The database integration should now work!

## Troubleshooting

**"Missing Supabase environment variables" error:**
- Make sure all three environment variables are set in `.env.local`
- Restart your dev server after adding them

**Database connection errors:**
- Verify your credentials in Supabase dashboard
- Check that the schema was run successfully
- Make sure your Supabase project is active (not paused)

**Tables not found:**
- Go to SQL Editor and verify tables exist: `SELECT * FROM customers;`
- If tables don't exist, run `supabase/schema.sql` again

## Database Schema Overview

### `customers`
- Stores customer information (name, email, phone, address)
- One customer can have multiple orders

### `orders`
- Stores order details (plan, billing, reservation preferences)
- Linked to customers via `customer_id`
- Status: `pending`, `paid`, `failed`, `cancelled`

### `payments`
- Tracks payment transactions from Allpay
- Linked to orders via `order_id`
- Stores webhook data for debugging

