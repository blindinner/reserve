import { NextRequest, NextResponse } from "next/server"
import { getOrderByOrderId, updateOrderStatus } from "@/lib/db"

/**
 * Verify and update payment status when user returns from Allpay
 * This is called from the success page since Allpay doesn't send webhooks
 * for the initial subscription payment (only for recurring charges)
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      )
    }

    // Get the order from database
    const order = await getOrderByOrderId(orderId)

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Security: Only activate orders that are in "pending" status
    // This prevents reactivating already active/cancelled orders
    if (order.status && order.status !== "pending") {
      return NextResponse.json(
        { 
          success: true,
          orderId,
          status: order.status,
          message: `Order is already ${order.status}`,
        },
        { status: 200 }
      )
    }

    // Security: Only activate orders created within the last 24 hours
    // This prevents someone from using old order IDs
    const orderCreatedAt = order.created_at ? new Date(order.created_at) : null
    if (orderCreatedAt) {
      const hoursSinceCreation = (Date.now() - orderCreatedAt.getTime()) / (1000 * 60 * 60)
      if (hoursSinceCreation > 24) {
        return NextResponse.json(
          { error: "Order is too old to activate via redirect" },
          { status: 400 }
        )
      }
    }

    // TODO: Ideally, verify payment status with Allpay's API here
    // If Allpay provides a "Get Payment Status" endpoint, call it to verify
    // For now, we trust that Allpay only redirects to success_url after successful payment
    
    // Update order status to "active" since user was redirected here by Allpay
    // This means the initial payment was successful
    await updateOrderStatus(orderId, "active", undefined)

    return NextResponse.json({
      success: true,
      orderId,
      status: "active",
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
