# How to Check if Webhook is Working

## 1. Check Vercel Function Logs

1. Go to **Vercel Dashboard** → Your Project
2. Click on **Functions** tab
3. Look for `/api/allpay/webhook` function
4. Check the **Logs** section for recent invocations

**What to look for:**
- ✅ `"Webhook received as JSON"` - Means webhook reached your endpoint
- ✅ `"✓ Signature verified successfully"` - Signature passed
- ✅ `"Attempting to create payment record"` - Payment creation started
- ✅ `"✓ Payment record created successfully"` - Payment was saved
- ❌ Any error messages

## 2. Check Database - Orders Table

Even if payment record wasn't created, the order might have been updated:

```sql
-- Check recent orders and their status
SELECT 
  order_id,
  status,
  subscription_id,
  next_charge_date,
  last_payment_date,
  updated_at
FROM orders
ORDER BY updated_at DESC
LIMIT 10;
```

## 3. Check Database - Payments Table

```sql
-- Check if any payments were created
SELECT 
  id,
  order_id,
  transaction_id,
  subscription_id,
  charge_number,
  status,
  amount,
  created_at
FROM payments
ORDER BY created_at DESC
LIMIT 10;
```

## 4. Check Recent Order Updates

```sql
-- Find orders updated in the last hour (might show webhook activity)
SELECT 
  order_id,
  status,
  subscription_id,
  updated_at,
  (NOW() - updated_at) as time_ago
FROM orders
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

## 5. Check Allpay Dashboard

- Look at the webhook delivery status in Allpay
- Check if it shows 200 (success) or still shows 401/error
- See the response from your endpoint


