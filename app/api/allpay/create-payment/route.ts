import { NextRequest, NextResponse } from "next/server"
import { generateAllpaySignature, formatPrice } from "@/lib/allpay"
import { createOrGetCustomer, createOrder } from "@/lib/db"

const ALLPAY_API_URL = "https://allpay.to/app/?show=getpayment&mode=api9"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      orderId,
      plan,
      billingFrequency,
      firstName,
      lastName,
      email,
      phoneNumber,
      amount,
    } = body

    // Validate required fields
    if (!orderId || !plan || !amount || !email) {
      return NextResponse.json(
        { error: "Missing required payment fields" },
        { status: 400 }
      )
    }

    // Get API credentials from environment variables
    const apiLogin = process.env.ALLPAY_API_LOGIN
    const apiKey = process.env.ALLPAY_API_KEY

    if (!apiLogin || !apiKey) {
      console.error("ALLPAY_API_LOGIN or ALLPAY_API_KEY not set")
      return NextResponse.json(
        { error: "Payment service is not configured" },
        { status: 500 }
      )
    }

    // Get base URL for callback URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin

    // Determine currency (default ILS)
    const currency = process.env.ALLPAY_CURRENCY || "ILS"

    // Determine language (default AUTO)
    const lang = process.env.ALLPAY_LANG || "AUTO"

    // Build items array for Allpay (subscription)
    // All values must be strings for signature generation
    const planName = plan === "weekly" ? "Weekly Plan" : plan === "biweekly" ? "Biweekly Plan" : "Business Plan"
    const items = [
      {
        name: planName,
        qty: "1", // String for signature
        price: formatPrice(amount), // Already a string
        vat: "0", // No VAT (as per your requirement)
      },
    ]

    // Build subscription parameters
    // For monthly subscriptions, we'll use:
    // - start_type: 1 (immediately) - charge right away
    // - end_type: 1 (infinite) - continue until cancelled
    const subscription = {
      start_type: "1", // 1 = Immediately, 2 = On specific date, 3 = After N days
      end_type: "1", // 1 = Infinite, 2 = On specific date, 3 = After N charges
    }

    // Build subscription request parameters (all as strings for signature)
    const paymentParams: Record<string, any> = {
      login: apiLogin,
      order_id: orderId,
      items: items,
      subscription: subscription,
      currency: currency,
      lang: lang,
      notifications_url: `${baseUrl}/api/allpay/webhook`,
      success_url: `${baseUrl}/payment/success?order_id=${orderId}`,
      backlink_url: `${baseUrl}`,
      client_name: `${firstName} ${lastName}`.trim(),
      client_email: email,
      client_phone: phoneNumber || "",
    }

    // Generate signature (all values should already be strings)
    const sign = generateAllpaySignature(paymentParams, apiKey)
    paymentParams.sign = sign

    console.log("Creating Allpay subscription request for order:", orderId)

    // Convert items to proper format (numbers for API, but strings were used for signature)
    const requestBody = {
      login: apiLogin,
      order_id: orderId,
      items: items.map(item => ({
        name: item.name,
        qty: parseInt(item.qty),
        price: parseFloat(item.price),
        vat: parseInt(item.vat),
      })),
      subscription: {
        start_type: parseInt(subscription.start_type),
        end_type: parseInt(subscription.end_type),
      },
      currency: currency,
      lang: lang,
      notifications_url: `${baseUrl}/api/allpay/webhook`,
      success_url: `${baseUrl}/payment/success?order_id=${orderId}`,
      backlink_url: `${baseUrl}`,
      client_name: `${firstName} ${lastName}`.trim(),
      client_email: email,
      client_phone: phoneNumber || "",
      sign: sign,
    }

    const requestBodyString = JSON.stringify(requestBody)

    const response = await fetch(ALLPAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(requestBodyString.length),
      },
      body: requestBodyString,
    })

    const responseText = await response.text()
    console.log("Allpay response:", responseText)

    if (!response.ok) {
      console.error("Allpay API error:", responseText)
      return NextResponse.json(
        { error: "Failed to create payment", details: responseText },
        { status: response.status }
      )
    }

    // Parse response - Allpay typically returns URL or JSON
    let paymentUrl: string
    try {
      const responseJson = JSON.parse(responseText)
      paymentUrl = responseJson.url || responseJson.payment_url || responseJson.link
    } catch {
      // If not JSON, might be direct URL
      paymentUrl = responseText.trim()
    }

    if (!paymentUrl) {
      console.error("No payment URL in Allpay response:", responseText)
      return NextResponse.json(
        { error: "Invalid response from payment provider" },
        { status: 500 }
      )
    }

    console.log("Payment URL created successfully:", paymentUrl)

    return NextResponse.json(
      {
        success: true,
        paymentUrl: paymentUrl,
        orderId: orderId,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error creating Allpay payment:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

