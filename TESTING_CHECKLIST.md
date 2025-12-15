# Testing Checklist - Subscription Integration

## ✅ Pre-Testing Setup

### 1. Environment Variables
Verify these are set in your `.env.local`:

```env
# Allpay
ALLPAY_API_LOGIN=your_login
ALLPAY_API_KEY=your_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Base URL
NEXT_PUBLIC_BASE_URL=https://your-domain.com (or http://localhost:3000 for local)
```

### 2. Database Schema
- ✅ Run `supabase/schema.sql` in Supabase SQL Editor
- ✅ Verify tables exist: `customers`, `orders`, `payments`
- ✅ Verify triggers are created

### 3. Allpay Configuration
- ✅ Subscriptions Module enabled in Allpay Settings → Modules
- ✅ API credentials configured
- ✅ Test mode or production mode ready

## 🧪 Testing Steps

### Step 1: Test Subscription Creation Flow

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Go through the onboarding flow:**
   - Navigate to homepage
   - Click on a pricing plan (Weekly or Biweekly)
   - Fill out the onboarding form completely
   - Click "Complete Purchase"

3. **What should happen:**
   - ✅ Form data is saved to database (check Supabase `customers` and `orders` tables)
   - ✅ Payment request is created with subscription parameters
   - ✅ You're redirected to Allpay payment page
   - ✅ On Allpay page, you should see subscription details

### Step 2: Complete Test Payment

1. **On Allpay payment page:**
   - Use a test card (check Allpay docs for test cards)
   - Complete the payment

2. **What should happen:**
   - ✅ Redirected to `/payment/success?order_id=...`
   - ✅ Success page displays correctly

### Step 3: Verify Webhook Processing

1. **Check server logs** (in terminal running `npm run dev`):
   - Look for: "Allpay webhook received"
   - Should show subscription_id and charge_number

2. **Check Supabase database:**
   
   **`payments` table:**
   - Should have a new record with:
     - `status`: 'success'
     - `is_recurring`: true (or false for first charge)
     - `subscription_id`: should be populated
     - `charge_number`: 1 (for first charge)
     - `webhook_data`: full payload from Allpay
   
   **`orders` table:**
   - Order status should be: 'active'
   - `subscription_id` should be populated
   - `is_subscription` should be true

### Step 4: Test Recurring Charges (Optional - for testing)

If you want to simulate recurring charges:
- Allpay will automatically charge monthly
- You can test this by waiting for the next billing cycle
- Or check with Allpay support about testing recurring charges

## 🔍 Debugging

### Common Issues

**1. "Invalid signature" error:**
- Check that `ALLPAY_API_KEY` is correct
- Verify signature generation includes subscription object
- Check server logs for signature calculation

**2. Webhook not receiving notifications:**
- Verify `notifications_url` in payment request is publicly accessible
- For local testing, use a tool like ngrok to expose localhost
- Check Allpay dashboard for webhook delivery status

**3. Database errors:**
- Verify Supabase credentials are correct
- Check that schema was run successfully
- Look at Supabase logs for errors

**4. Subscription not created:**
- Verify Subscriptions Module is enabled in Allpay
- Check that subscription parameters are included in request
- Review Allpay response in server logs

### Check Server Logs

Watch your terminal for:
- "Creating Allpay subscription request for order: ..."
- "Allpay response: ..."
- "Allpay webhook received: ..."
- "Payment success/failed for order: ..."

### Check Supabase Tables

Run these queries in Supabase SQL Editor:

```sql
-- Check recent orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;

-- Check recent payments
SELECT * FROM payments ORDER BY created_at DESC LIMIT 5;

-- Check customers
SELECT * FROM customers ORDER BY created_at DESC LIMIT 5;
```

## 📝 Next Steps After Testing

Once everything works:

1. **Production Deployment:**
   - Set environment variables in Vercel/production
   - Verify `NEXT_PUBLIC_BASE_URL` points to production domain
   - Test with real payment (small amount)

2. **Monitor Subscriptions:**
   - Set up alerts for failed payments
   - Monitor webhook logs
   - Track subscription status in database

3. **Add Business Logic:**
   - Send confirmation emails after successful payment
   - Create reservation schedules
   - Handle subscription cancellations (if needed)

