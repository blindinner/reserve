import { NextRequest, NextResponse } from "next/server"
import { generateAllpaySignature } from "@/lib/allpay"
import { updateOrderStatus, createPayment, updateOrder } from "@/lib/db"
import { updateOrderStatus, createPayment, getOrderByOrderId } from "@/lib/db"

/**
 * Webhook endpoint to receive payment notifications from Allpay
 * 
 * Allpay will send POST requests here with payment status updates.
 * We need to verify the signature to ensure the request is authentic.
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body as form data (Allpay typically sends form-encoded data)
    const formData = await request.formData()
    const params: Record<string, any> = {}

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
    const status = params.status || params.payment_status
    const transactionId = params.transaction_id || params.payment_id
    const subscriptionId = params.subscription_id
    const chargeNumber = params.charge_number ? parseInt(params.charge_number) : null
    const isRecurring = subscriptionId ? true : false

    console.log("Allpay webhook received:", {
      orderId,
      status,
      transactionId,
      subscriptionId,
      chargeNumber,
      isRecurring,
      params,
    })

    // Save payment record to database
    try {
      await createPayment({
        order_id: orderId,
        transaction_id: transactionId || undefined,
        subscription_id: subscriptionId || undefined,
        charge_number: chargeNumber || undefined,
        status: status || "pending",
        amount: params.amount ? parseFloat(params.amount) : undefined,
        currency: params.currency || "ILS",
        is_recurring: isRecurring,
        webhook_data: params,
      })

      // Update order status based on payment status
      let orderStatus = "pending"
      if (status === "success" || status === "approved" || status === "completed") {
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
      } else if (status === "failed" || status === "rejected" || status === "cancelled") {
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

