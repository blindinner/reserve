# Production Readiness Checklist

Before going live with real payments, verify the following:

## ✅ Environment Variables (Vercel)

All of these must be set in your Vercel project settings:

### Allpay Configuration
- [ ] `ALLPAY_API_LOGIN` - Your Allpay API login
- [ ] `ALLPAY_API_KEY` - Your Allpay API key
- [ ] `ALLPAY_CURRENCY` - Currency code (e.g., "ILS")
- [ ] `ALLPAY_LANG` - Language code (e.g., "he" or "en")
- [ ] `NEXT_PUBLIC_BASE_URL` - Production URL (e.g., "https://www.rendeza.com")

### Supabase Configuration
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for server-side operations)

### Email Configuration (Optional but recommended)
- [ ] `RESEND_API_KEY` - For sending confirmation emails

### Geoapify Configuration (Optional)
- [ ] `NEXT_PUBLIC_GEOAPIFY_API_KEY` - For address autocomplete

---

## ✅ Allpay Account Setup

- [ ] **Production mode enabled** (not test/sandbox)
- [ ] **Subscriptions module activated** in Allpay dashboard
- [ ] Verify API credentials are production credentials (not test keys)
- [ ] Webhook URL is correctly set in payment requests (handled automatically via `notifications_url`)

---

## ✅ Database (Supabase)

- [ ] All tables created:
  - [ ] `customers` table
  - [ ] `orders` table  
  - [ ] `payments` table
- [ ] All triggers and functions working (especially `updated_at` triggers)
- [ ] Test that database operations work (create customer, create order, update order)

---

## ✅ Payment Flow Testing

Test the complete flow with a **small test amount** first:

1. **Initial Payment Flow:**
   - [ ] User selects a plan on homepage
   - [ ] User fills onboarding form
   - [ ] User clicks "Complete Purchase"
   - [ ] User is redirected to Allpay payment page
   - [ ] User completes payment
   - [ ] User is redirected to `/payment/success`
   - [ ] Order status is updated to "active" in database
   - [ ] Verify order appears in `orders` table with correct status

2. **Webhook Handling (for recurring charges):**
   - [ ] Webhook endpoint is accessible: `/api/allpay/webhook`
   - [ ] Note: Webhooks only arrive after the first recurring charge (next month)
   - [ ] When webhook arrives, payment record is created in `payments` table

---

## ✅ Security Checks

- [ ] All environment variables are set (no undefined values)
- [ ] API keys are secure (not exposed in client-side code)
- [ ] Payment verification endpoint only activates "pending" orders
- [ ] Payment verification endpoint only activates orders created within 24 hours
- [ ] Webhook signature verification is working

---

## ✅ Error Handling

- [ ] Payment failures are handled gracefully
- [ ] User sees appropriate error messages
- [ ] Failed payments don't activate subscriptions
- [ ] Database errors are logged but don't break the flow

---

## ✅ Monitoring & Logging

- [ ] Vercel function logs are accessible
- [ ] Set up alerts for:
  - [ ] Payment creation failures
  - [ ] Webhook failures
  - [ ] Database errors
- [ ] Monitor orders table for unexpected status changes

---

## ✅ Important Notes

1. **Webhooks**: Allpay only sends webhooks for recurring charges, NOT for initial payments. Initial payments are confirmed when user returns to the success page.

2. **Payment Records**: The `payments` table will be empty until the first recurring charge occurs (next month). This is expected behavior.

3. **First Month Free**: If you're offering first month free, make sure this is communicated to users clearly.

4. **Test First**: Always test with a small real payment before going fully live.

---

## ⚠️ Before Going Live

1. **Test with a real payment** (small amount) to verify end-to-end flow
2. **Verify order appears in database** with correct status
3. **Check Allpay dashboard** shows the payment correctly
4. **Monitor logs** for any errors during first real transactions
5. **Have a rollback plan** if something goes wrong

---

## 🔄 After Going Live

- Monitor first few transactions closely
- Check that webhooks arrive correctly for recurring charges (next month)
- Verify payments table populates correctly after first recurring charge
- Monitor for any errors or edge cases
- Keep database backups enabled

