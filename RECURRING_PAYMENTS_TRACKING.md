# Recurring Payment Tracking System

## Overview

The system automatically tracks recurring subscription payments to verify that webhooks are received every month and payments are on schedule.

## Database Schema

### Orders Table (New Fields)
- `next_charge_date` (DATE) - Expected date of next recurring charge
- `last_payment_date` (DATE) - Date of last successful payment received via webhook

### Payments Table
- `subscription_id` - Allpay subscription ID
- `charge_number` - Which payment this is (1st, 2nd, 3rd, etc.)
- `is_recurring` - Whether this is a recurring payment
- `created_at` - When the webhook was received

## How It Works

### 1. When a Webhook is Received

When Allpay sends a webhook for a successful payment:

1. **Payment Record Created**: Entry added to `payments` table with:
   - `order_id`
   - `transaction_id`
   - `subscription_id`
   - `charge_number` (from `inst` field)
   - `status`: "success"
   - `amount`, `currency`
   - `is_recurring`: true

2. **Order Updated**: The `orders` table is updated with:
   - `last_payment_date`: Set to today's date
   - `next_charge_date`: Calculated as 1 month from today (for monthly billing)
   - `subscription_id`: Saved if first payment
   - `status`: Set to "active"

### 2. Date Calculation

- **Monthly Billing**: Next charge date = Today + 1 month
- **Annual Billing**: Next charge date = Today + 12 months

### 3. Tracking Each Payment

Each webhook contains:
- `charge_number` or `inst` field indicating which payment this is
- First payment: `inst: 1`
- Second payment: `inst: 2`
- And so on...

## Monitoring Recurring Payments

### Query Overdue Payments

```sql
-- Find subscriptions where next charge date has passed
SELECT 
  order_id,
  subscription_id,
  next_charge_date,
  last_payment_date,
  status,
  (CURRENT_DATE - next_charge_date) as days_overdue
FROM orders
WHERE 
  is_subscription = true
  AND status = 'active'
  AND next_charge_date < CURRENT_DATE
ORDER BY next_charge_date;
```

### Query Upcoming Payments

```sql
-- Find subscriptions with payments due in the next 7 days
SELECT 
  order_id,
  subscription_id,
  next_charge_date,
  last_payment_date,
  (next_charge_date - CURRENT_DATE) as days_until_charge
FROM orders
WHERE 
  is_subscription = true
  AND status = 'active'
  AND next_charge_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY next_charge_date;
```

### Verify Payment Received

```sql
-- Check if payment webhook was received for expected charge
SELECT 
  o.order_id,
  o.next_charge_date,
  o.last_payment_date,
  p.charge_number,
  p.created_at as payment_received_at,
  p.status as payment_status
FROM orders o
LEFT JOIN payments p ON o.order_id = p.order_id 
  AND p.created_at::date = o.last_payment_date
WHERE 
  o.is_subscription = true
  AND o.status = 'active'
ORDER BY o.next_charge_date;
```

## Health Status Categories

You can categorize subscription health:

1. **Healthy**: `next_charge_date` is in the future
2. **Late**: `next_charge_date` passed but < 7 days ago
3. **Overdue**: `next_charge_date` passed > 7 days ago
4. **Missing**: No `next_charge_date` set or subscription not active

## Helper Functions

See `lib/recurring-payments.ts` for helper functions:
- `calculateNextChargeDate()` - Calculate expected next charge
- `isPaymentOverdue()` - Check if payment is overdue
- `getPaymentHealthStatus()` - Get overall health status

## Example Flow

1. **First Payment (Webhook #1)**:
   - Payment record created with `charge_number: 1`
   - `last_payment_date`: 2025-12-16
   - `next_charge_date`: 2026-01-16

2. **Second Payment (Webhook #2) - One Month Later**:
   - Payment record created with `charge_number: 2`
   - `last_payment_date`: 2026-01-16 (updated)
   - `next_charge_date`: 2026-02-16 (updated)

3. **If Webhook Missing**:
   - `next_charge_date` remains at 2026-02-16
   - You can query for `next_charge_date < CURRENT_DATE` to find overdue payments

## Running the Migration

To add these fields to your existing database:

```sql
-- Run supabase/migration_add_recurring_tracking.sql in Supabase SQL editor
```

Or run the full schema (which includes these fields):
```sql
-- Run supabase/schema.sql (it's idempotent)
```

## Benefits

1. ✅ **Automatic Tracking**: Every webhook automatically updates tracking dates
2. ✅ **Payment Verification**: Easy to see if webhooks are arriving on schedule
3. ✅ **Overdue Detection**: Query for subscriptions with overdue payments
4. ✅ **Audit Trail**: Complete history in `payments` table
5. ✅ **Billing Frequency Support**: Handles both monthly and annual billing

