import { Resend } from "resend"
import { NextResponse } from "next/server"
import { createOrGetCustomer, createOrder, getOrderByOrderId, updateOrder } from "@/lib/db"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    // Check if API key is set
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set in environment variables")
      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 }
      )
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      address,
      reservationWith,
      numberOfPeople,
      preferredDay,
      preferredTime,
      startDateOption,
      pricingPlan,
      billingFrequency,
      additionalInfo,
    } = body

    console.log("Received onboarding form submission:", {
      firstName,
      lastName,
      email,
      phoneNumber,
      reservationWith,
      numberOfPeople,
      preferredDay,
      preferredTime,
      startDateOption,
      pricingPlan,
    })

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber || !email || !address || !reservationWith || !preferredDay || !preferredTime || !startDateOption || !pricingPlan) {
      console.error("Missing required fields")
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      )
    }

    // Validate numberOfPeople for options that require it
    if (
      (reservationWith === "kids" ||
        reservationWith === "whole-family" ||
        reservationWith === "friend") &&
      !numberOfPeople
    ) {
      return NextResponse.json(
        { error: "Number of people is required for this reservation type" },
        { status: 400 }
      )
    }

    // Format reservationWith for display
    const reservationWithLabels: Record<string, string> = {
      spouse: "Spouse",
      "boyfriend-girlfriend": "Boyfriend / Girlfriend",
      kids: "Kids",
      "whole-family": "Whole Family",
      friend: "Friend",
    }

    const reservationWithLabel = reservationWithLabels[reservationWith] || reservationWith
    const finalNumberOfPeople =
      reservationWith === "spouse" || reservationWith === "boyfriend-girlfriend"
        ? "2"
        : numberOfPeople

    // Format day for display
    const dayLabels: Record<string, string> = {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    }
    const preferredDayLabel = dayLabels[preferredDay] || preferredDay

    // Format pricing plan for display
    const pricingPlanLabels: Record<string, string> = {
      weekly: "Weekly",
      biweekly: "Biweekly",
      business: "Business",
    }
    const pricingPlanLabel = pricingPlanLabels[pricingPlan] || pricingPlan

    // Calculate pricing
    const planPricing: Record<string, { monthly: number; annual: number }> = {
      weekly: { monthly: 39, annual: 390 },
      biweekly: { monthly: 25, annual: 250 },
      business: { monthly: 0, annual: 0 },
    }

    const getPriceDisplay = (plan: string, frequency: string) => {
      if (plan === "business") return "Contact for pricing"
      const pricing = planPricing[plan as "weekly" | "biweekly"]
      if (frequency === "monthly") {
        return `$${pricing.monthly}/month`
      } else {
        const savings = (pricing.monthly * 12) - pricing.annual
        return `$${pricing.annual}/year (Save $${savings})`
      }
    }

    const priceDisplay = getPriceDisplay(pricingPlan, billingFrequency || "monthly")

    // Calculate amount
    const planPricingCalc: Record<string, { monthly: number; annual: number }> = {
      weekly: { monthly: 39, annual: 390 },
      biweekly: { monthly: 25, annual: 250 },
      business: { monthly: 0, annual: 0 },
    }
    const amount = pricingPlan === "business" 
      ? 0 
      : billingFrequency === "monthly"
        ? planPricingCalc[pricingPlan as "weekly" | "biweekly"].monthly
        : planPricingCalc[pricingPlan as "weekly" | "biweekly"].annual

    // Save to database
    try {
      // Create or get customer
      const customer = await createOrGetCustomer({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phoneNumber,
        address: address,
      })

      // Create order (if order_id exists, it was already created in payment flow)
      const orderId = body.orderId || `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      
      // Check if order exists (might have been created by payment API)
      const existingOrder = await getOrderByOrderId(orderId)
      
      let order
      if (existingOrder) {
        // Update existing order with reservation details
        order = await updateOrder(orderId, {
          customer_id: customer.id,
          reservation_with: reservationWith,
          number_of_people: finalNumberOfPeople ? parseInt(finalNumberOfPeople) : null,
          preferred_day: preferredDay,
          preferred_time: preferredTime,
          start_date_option: startDateOption,
          additional_info: additionalInfo || null,
        })
      } else {
        // Order doesn't exist, create it
        order = await createOrder({
          order_id: orderId,
          customer_id: customer.id,
          plan: pricingPlan,
          billing_frequency: billingFrequency || "monthly",
          amount: amount,
          status: "pending",
          reservation_with: reservationWith,
          number_of_people: finalNumberOfPeople ? parseInt(finalNumberOfPeople) : null,
          preferred_day: preferredDay,
          preferred_time: preferredTime,
          start_date_option: startDateOption,
          additional_info: additionalInfo || null,
        })
      }
      
      console.log("Data saved to database:", { customerId: customer.id, orderId: order.order_id })
    } catch (dbError) {
      console.error("Database error (continuing with email):", dbError)
      // Continue with email even if database fails
    }

    console.log("Attempting to send onboarding email to benji@rendeza.com...")

    // Create plain text message
    const plainTextMessage = `New Onboarding Form Submission

Personal Information:
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phoneNumber}
Address: ${address}

Reservation Details:
With: ${reservationWithLabel}
Number of People: ${finalNumberOfPeople}
Preferred Day: ${preferredDayLabel}
Preferred Time: ${preferredTime}
Start Date: ${startDateOption === "this-week" ? "This coming " + preferredDayLabel : "The following " + preferredDayLabel}

Pricing Plan:
Plan: ${pricingPlanLabel}
Billing: ${billingFrequency === "annual" ? "Annual (2 months free)" : "Monthly"}
Price: ${priceDisplay}

${additionalInfo ? `Additional Information:\n${additionalInfo}` : ""}
`

    // Create HTML message
    const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px;">
    <h2 style="color: #543A14; margin-top: 0;">New Onboarding Form Submission</h2>
    
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #F0BB78;">
      <h3 style="color: #543A14; margin-top: 0;">Personal Information</h3>
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Name:</strong> ${firstName} ${lastName}</p>
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Email:</strong> <a href="mailto:${email}" style="color: #543A14;">${email}</a></p>
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Phone:</strong> ${phoneNumber}</p>
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Address:</strong> ${address}</p>
    </div>
    
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #F0BB78;">
      <h3 style="color: #543A14; margin-top: 0;">Reservation Details</h3>
      <p style="margin: 10px 0;"><strong style="color: #543A14;">With:</strong> ${reservationWithLabel}</p>
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Number of People:</strong> ${finalNumberOfPeople}</p>
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Preferred Day:</strong> ${preferredDayLabel}</p>
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Preferred Time:</strong> ${preferredTime}</p>
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Start Date:</strong> ${startDateOption === "this-week" ? "This coming " + preferredDayLabel : "The following " + preferredDayLabel}</p>
    </div>
    
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #F0BB78;">
      <h3 style="color: #543A14; margin-top: 0;">Pricing Plan</h3>
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Plan:</strong> ${pricingPlanLabel}</p>
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Billing:</strong> ${billingFrequency === "annual" ? "Annual (2 months free)" : "Monthly"}</p>
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Price:</strong> ${priceDisplay}</p>
    </div>
    
    ${additionalInfo ? `
    <div style="margin: 30px 0;">
      <h3 style="color: #543A14; margin-bottom: 10px;">Additional Information:</h3>
      <div style="white-space: pre-wrap; line-height: 1.8; color: #333; padding: 15px; background-color: #fafafa; border-radius: 4px;">${additionalInfo.replace(/\n/g, '<br>')}</div>
    </div>
    ` : ""}
  </div>
</body>
</html>
`

    const { data, error } = await resend.emails.send({
      from: "Rendeza <contact@rendeza.com>",
      to: "benji@rendeza.com",
      subject: `New Onboarding: ${firstName} ${lastName} - ${preferredDayLabel} at ${preferredTime}`,
      html: htmlMessage,
      text: plainTextMessage,
      replyTo: email,
      headers: {
        "X-Entity-Ref-ID": `onboarding-${Date.now()}`,
      },
    })

    if (error) {
      console.error("Resend error:", JSON.stringify(error, null, 2))
      console.error("Full error details:", error)

      const errorMessage = error.message || "Unknown error"
      if (errorMessage.includes("domain") || errorMessage.includes("not verified")) {
        return NextResponse.json(
          {
            error: "Domain not verified. Please verify contact.rendeza.com in Resend dashboard.",
            details: error,
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: "Failed to send email", details: error, message: errorMessage },
        { status: 500 }
      )
    }

    console.log("Onboarding email sent successfully! Resend response:", { id: data?.id, data })
    return NextResponse.json(
      { message: "Form submitted successfully", id: data?.id },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error processing onboarding form:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

