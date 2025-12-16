import { NextRequest, NextResponse } from "next/server"
import { generateAllpaySignature } from "@/lib/allpay"
import { updateOrderStatus, createPayment, updateOrder, getOrderByOrderId } from "@/lib/db"

/**
 * Webhook endpoint to receive payment notifications from Allpay
 * 
 * Allpay will send POST requests here with payment status updates.
 * We need to verify the signature to ensure the request is authentic.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""
    let params: Record<string, any> = {}

    // Handle both JSON and form data
    let itemsAsString: string | undefined // Keep original string format for signature verification
    if (contentType.includes("application/json")) {
      // Allpay sends JSON for subscription notifications
      params = await request.json()
      
      // Allpay sends 'items' as a stringified JSON string in webhooks
      // We need to keep it as string for signature verification, but can parse for our use
      if (params.items && typeof params.items === "string") {
        itemsAsString = params.items // Keep original for signature
        try {
          params.items = JSON.parse(params.items) // Parse for our use
        } catch (e) {
          console.error("Failed to parse items string:", e)
          // Keep it as string if parsing fails
        }
      }
      
      console.log("Webhook received as JSON")
    } else {
      // Fallback to form data
      const formData = await request.formData()
      console.log("Webhook received as form data")

      // Convert FormData to object
      for (const [key, value] of formData.entries()) {
        // Handle arrays (like items)
        if (key.includes("[") && key.includes("]")) {
          // Parse array notation like items[0][name]
          const match = key.match(/^(.+?)\[(\d+)\]\[(.+?)\]$/)
          if (match) {
            const arrayName = match[1]
            const index = parseInt(match[2])
            const propName = match[3]

            if (!params[arrayName]) {
              params[arrayName] = []
            }
            if (!params[arrayName][index]) {
              params[arrayName][index] = {}
            }
            params[arrayName][index][propName] = value.toString()
          }
        } else {
          params[key] = value.toString()
        }
      }
      
      // Parse items if it's a string in form data too
      if (params.items && typeof params.items === "string") {
        itemsAsString = params.items // Keep original for signature
        try {
          params.items = JSON.parse(params.items)
        } catch (e) {
          console.error("Failed to parse items string:", e)
        }
      }
    }

    console.log("Parsed webhook params")

    const receivedSign = params.sign
    const apiKey = process.env.ALLPAY_API_KEY

    if (!apiKey) {
      console.error("ALLPAY_API_KEY not set")
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 }
      )
    }

    // Verify signature
    // IMPORTANT: Allpay calculates the signature with items as a STRING (not parsed JSON)
    // So we need to verify the signature using the original string format
    const paramsForSignature = { ...params }
    
    // Restore items to original string format for signature verification
    if (itemsAsString) {
      paramsForSignature.items = itemsAsString
    } else if (params.items && Array.isArray(params.items)) {
      // If we don't have the original string, stringify it (should match if format is consistent)
      paramsForSignature.items = JSON.stringify(params.items)
    }
    
    const calculatedSign = generateAllpaySignature(paramsForSignature, apiKey)

    if (receivedSign !== calculatedSign) {
      console.error("Invalid signature in webhook")
      console.error("Received signature:", receivedSign)
      console.error("Calculated signature:", calculatedSign)
      console.error("Order ID:", params.order_id)
      console.error("Status:", params.status)
      // Log params without sensitive data for debugging
      const debugParams = { ...params }
      delete debugParams.sign
      console.error("Params (no sign):", JSON.stringify(debugParams, null, 2))
      
      // Still try to process if this is a known order (for debugging)
      // But return error to Allpay so they retry
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }
    
    console.log("✓ Signature verified successfully")

    // Extract payment information
    const orderId = params.order_id
    // Allpay sends status as numeric: 0 = unpaid, 1 = successful payment
    const statusNum = params.status !== undefined ? parseInt(params.status) : null
    const status = statusNum === 1 ? "success" : statusNum === 0 ? "pending" : (params.status || params.payment_status || "pending")
    
    // For subscriptions, Allpay may send additional fields
    // transaction_id might be in receipt field or as a separate field
    const transactionId = params.transaction_id || params.payment_id || (params.receipt && params.receipt.trim() !== "" ? params.receipt : undefined)
    const subscriptionId = params.subscription_id
    // inst field indicates installment number (1 = first payment)
    const chargeNumber = params.charge_number ? parseInt(params.charge_number) : (params.inst ? parseInt(params.inst) : null)
    // For subscriptions, check if there's a subscription_id or if this is a recurring payment
    const isRecurring = subscriptionId ? true : false

    // Log webhook data (safe - no sensitive keys in params)
    if (process.env.NODE_ENV === "development") {
      console.log("Allpay webhook received:", {
        orderId,
        statusNum,
        status,
        transactionId,
        subscriptionId,
        chargeNumber,
        isRecurring,
      })
    }

    // Save payment record to database
    try {
      console.log("Attempting to create payment record:", {
        order_id: orderId,
        transaction_id: transactionId,
        subscription_id: subscriptionId,
        charge_number: chargeNumber,
        status: status,
        amount: params.amount,
      })
      
      // Create payment record
      // For first payment (chargeNumber = 1 or inst = 1), transaction_id might not be available yet
      // We can use a combination or generate one if needed
      const paymentRecordId = transactionId || (orderId ? `${orderId}-payment-${Date.now()}` : undefined)
      
      const payment = await createPayment({
        order_id: orderId,
        transaction_id: paymentRecordId || undefined,
        subscription_id: subscriptionId || undefined,
        charge_number: chargeNumber || undefined,
        status: status,
        amount: params.amount ? parseFloat(params.amount) : undefined,
        currency: params.currency || "USD", // Use from params, default to USD
        is_recurring: isRecurring,
        webhook_data: params,
      })
      
      console.log("✓ Payment record created successfully:", {
        id: payment.id,
        order_id: payment.order_id,
        transaction_id: payment.transaction_id,
        status: payment.status,
        amount: payment.amount,
      })

      // Update order status based on payment status
      // Allpay status: 1 = successful payment, 0 = unpaid/failed
      let orderStatus = "pending"
      const today = new Date()
      const todayDateString = today.toISOString().split('T')[0] // YYYY-MM-DD format
      
      // Helper function to calculate next charge date (1 month from today for monthly billing)
      const calculateNextChargeDate = (): string => {
        const nextMonth = new Date(today)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        return nextMonth.toISOString().split('T')[0]
      }
      
      if (statusNum === 1 || status === "success" || status === "approved" || status === "completed") {
        // For subscriptions, mark as "active" after first successful payment
        if (isRecurring && subscriptionId) {
          orderStatus = "active"
          
          // Get the order to check billing frequency
          const order = await getOrderByOrderId(orderId)
          const billingFrequency = order?.billing_frequency || "monthly"
          
          // Update subscription tracking fields
          const updateData: any = {
            subscription_id: subscriptionId,
            status: "active",
            last_payment_date: todayDateString,
          }
          
          // Calculate next charge date based on billing frequency
          if (billingFrequency === "monthly") {
            updateData.next_charge_date = calculateNextChargeDate()
          } else if (billingFrequency === "annual") {
            // For annual, add 12 months
            const nextYear = new Date(today)
            nextYear.setMonth(nextYear.getMonth() + 12)
            updateData.next_charge_date = nextYear.toISOString().split('T')[0]
          }
          
          // Update subscription_id in order if this is the first charge
          if (chargeNumber === 1 || chargeNumber === null) {
            await updateOrder(orderId, updateData)
            console.log(`✓ Order ${orderId} activated with subscription ${subscriptionId}`)
            console.log(`✓ Next charge date set to: ${updateData.next_charge_date}`)
          } else {
            // For recurring payments after first, update last payment date and next charge date
            await updateOrder(orderId, updateData)
            console.log(`✓ Recurring payment #${chargeNumber} processed for order ${orderId}`)
            console.log(`✓ Next charge date set to: ${updateData.next_charge_date}`)
          }
        } else {
          // One-time payment
          orderStatus = "paid"
          await updateOrderStatus(orderId, "paid", paymentRecordId || undefined)
          console.log(`✓ Order ${orderId} marked as paid`)
        }
      } else if (statusNum === 0 || status === "failed" || status === "rejected" || status === "cancelled") {
        orderStatus = "failed"
        await updateOrderStatus(orderId, "failed", paymentRecordId || undefined)
        console.log(`✗ Order ${orderId} payment failed`)
      }

      // For first payment only, ensure order status is updated
      if (chargeNumber === 1 || chargeNumber === null || !isRecurring) {
        if (orderStatus !== "pending") {
          await updateOrderStatus(orderId, orderStatus, paymentRecordId || undefined)
        }
      }

      console.log(`Payment ${status} for order: ${orderId}${isRecurring ? ` (Recurring charge #${chargeNumber})` : ""}`)
      
      // TODO: Add additional business logic here:
      // - Send confirmation email to customer (if paid)
      // - For first payment: Activate subscription, create reservation schedule
      // - For recurring payments: Send receipt email, update next reservation date
    } catch (dbError) {
      console.error("Database error processing webhook:", dbError)
      // Continue anyway to return success to Allpay
    }

    // Always return success to Allpay (even if processing fails)
    // This prevents Allpay from retrying
    return NextResponse.json({ status: "ok" }, { status: 200 })
  } catch (error) {
    console.error("Error processing Allpay webhook:", error)
    // Still return success to prevent retries
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for testing webhook accessibility
 */
export async function GET() {
  return NextResponse.json(
    { 
      message: "Webhook endpoint is accessible",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}

