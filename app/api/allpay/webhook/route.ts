import { NextRequest, NextResponse } from "next/server"
import { generateAllpaySignature } from "@/lib/allpay"
import { updateOrderStatus, createPayment, updateOrder } from "@/lib/db"

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
    if (contentType.includes("application/json")) {
      // Allpay sends JSON for subscription notifications
      params = await request.json()
      console.log("Webhook received as JSON:", JSON.stringify(params, null, 2))
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
    }

    console.log("Parsed webhook params:", JSON.stringify(params, null, 2))

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
    const calculatedSign = generateAllpaySignature(params, apiKey)

    if (receivedSign !== calculatedSign) {
      console.error("Invalid signature in webhook")
      console.error("Received:", receivedSign)
      console.error("Calculated:", calculatedSign)
      console.error("Params:", JSON.stringify(params, null, 2))
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }

    // Extract payment information
    const orderId = params.order_id
    // Allpay sends status as numeric: 0 = unpaid, 1 = successful payment
    const statusNum = params.status !== undefined ? parseInt(params.status) : null
    const status = statusNum === 1 ? "success" : statusNum === 0 ? "pending" : (params.status || params.payment_status || "pending")
    
    // For subscriptions, Allpay may send additional fields
    const transactionId = params.transaction_id || params.payment_id || params.receipt
    const subscriptionId = params.subscription_id
    const chargeNumber = params.charge_number ? parseInt(params.charge_number) : (params.inst ? parseInt(params.inst) : null)
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
      
      const payment = await createPayment({
        order_id: orderId,
        transaction_id: transactionId || undefined,
        subscription_id: subscriptionId || undefined,
        charge_number: chargeNumber || undefined,
        status: status,
        amount: params.amount ? parseFloat(params.amount) : undefined,
        currency: params.currency || "ILS",
        is_recurring: isRecurring,
        webhook_data: params,
      })
      
      console.log("Payment record created successfully:", payment)

      // Update order status based on payment status
      // Allpay status: 1 = successful payment, 0 = unpaid/failed
      let orderStatus = "pending"
      if (statusNum === 1 || status === "success" || status === "approved" || status === "completed") {
        // For subscriptions, mark as "active" after first successful payment
        if (isRecurring && subscriptionId) {
          orderStatus = "active"
          // Update subscription_id in order if this is the first charge
          if (chargeNumber === 1 || chargeNumber === null) {
            await updateOrder(orderId, { subscription_id: subscriptionId, status: "active" })
          }
        } else {
          orderStatus = "paid"
        }
      } else if (statusNum === 0 || status === "failed" || status === "rejected" || status === "cancelled") {
        orderStatus = "failed"
      }

      if (!isRecurring || chargeNumber === 1 || chargeNumber === null) {
        await updateOrderStatus(orderId, orderStatus, transactionId || undefined)
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

