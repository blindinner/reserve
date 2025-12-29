# Debugging Guide

## Where to Check for Errors

### 1. **Browser Console (Client-Side Errors)**
- Open your browser's Developer Tools (F12 or Cmd+Option+I)
- Go to the **Console** tab
- Look for red error messages
- Check the **Network** tab for failed API requests (status codes 4xx or 5xx)

### 2. **Vercel Logs**
- Go to your Vercel dashboard
- Click on your project
- Go to **Deployments** → Select the latest deployment
- Click **View Function Logs** or **View Build Logs**
- Look for:
  - `console.error()` messages
  - `console.log()` messages with error indicators
  - Stack traces

### 3. **Vercel Real-Time Logs**
- In Vercel dashboard, go to your project
- Click on **Logs** in the sidebar
- This shows real-time logs from your functions
- Filter by:
  - **Function**: Select specific API routes
  - **Level**: Error, Warning, Info
  - **Time**: Recent time period

### 4. **API Route Logs**
All API routes now log detailed error information:
- Error type
- Error message
- Stack trace
- Full error object

### 5. **Network Tab in Browser**
- Open Developer Tools → **Network** tab
- Try to reproduce the error
- Look for failed requests (red status)
- Click on the failed request to see:
  - Request payload
  - Response body
  - Response headers
  - Status code

## Common Error Types

### Client-Side Errors
- **React errors**: Check browser console
- **API call failures**: Check Network tab
- **Form validation errors**: Usually shown in the UI

### Server-Side Errors
- **500 Internal Server Error**: Check Vercel function logs
- **400 Bad Request**: Check request payload in Network tab
- **Database errors**: Check Supabase logs or Vercel function logs

## How to Debug

1. **Reproduce the error** while having Developer Tools open
2. **Check browser console** for client-side errors
3. **Check Network tab** for API request/response details
4. **Check Vercel logs** for server-side errors
5. **Look for error patterns**:
   - Missing environment variables
   - Database connection issues
   - API key problems
   - Validation errors

## Getting More Details

If you see an error but need more information:

1. **Add more logging**: The API routes now have enhanced error logging
2. **Check environment variables**: Make sure all required env vars are set in Vercel
3. **Check database**: Verify Supabase connection and table structure
4. **Check external APIs**: Verify Resend, Allpay, etc. are configured correctly

## Quick Debug Checklist

- [ ] Browser console shows no errors?
- [ ] Network tab shows successful API calls?
- [ ] Vercel logs show no errors?
- [ ] Environment variables are set?
- [ ] Database connection is working?
- [ ] External API keys are valid?

