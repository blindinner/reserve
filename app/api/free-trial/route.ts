import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
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
      additionalInfo,
    } = body

    console.log("Received free trial form submission:", {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      reservationWith,
      numberOfPeople,
      preferredDay,
      preferredTime,
      startDateOption,
    })

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber || !email || !address || !reservationWith || !preferredDay || !preferredTime || !startDateOption) {
      console.error("Missing required fields")
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      )
    }

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

    // Helper to get next date for a given day of the week
    const getNextDateForDay = (dayName: string, weeksFromNow: number): Date => {
      const dayMap: { [key: string]: number } = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      }

      const today = new Date()
      const todayDay = today.getDay()
      const targetDay = dayMap[dayName.toLowerCase()] ?? 0

      let daysUntilTarget = targetDay - todayDay
      if (daysUntilTarget <= 0) {
        daysUntilTarget += 7
      }
      daysUntilTarget += weeksFromNow * 7
      const targetDate = new Date(today)
      targetDate.setDate(today.getDate() + daysUntilTarget)
      return targetDate
    }

    // Format date for display
    const formatDate = (date: Date): string => {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    }

    const startDateDisplay = startDateOption === "this-week"
      ? `This coming ${preferredDayLabel} (${formatDate(getNextDateForDay(preferredDay, 0))})`
      : `The following ${preferredDayLabel} (${formatDate(getNextDateForDay(preferredDay, 1))})`

    // Convert 24-hour to 12-hour for display
    const convertTo12Hour = (time24: string): string => {
      if (!time24) return ""
      const [hour, minute] = time24.split(":")
      const hourNum = parseInt(hour)
      const period = hourNum >= 12 ? "PM" : "AM"
      let hour12 = hourNum % 12
      if (hour12 === 0) hour12 = 12
      return `${hour12}:${minute} ${period}`
    }

    console.log("Attempting to send free trial email to benji@rendeza.com...")

    const plainTextMessage = `New Free Trial Signup

Personal Information:
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phoneNumber}
Address: ${address}

Reservation Details:
With: ${reservationWithLabel}
Number of People: ${finalNumberOfPeople}
Preferred Day: ${preferredDayLabel}
Preferred Time: ${convertTo12Hour(preferredTime)}
Start Date: ${startDateDisplay}

${additionalInfo ? `Additional Information:\n${additionalInfo}` : ""}
`

    const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 30px;">
    <h2 style="color: #543A14; margin-top: 0;">New Free Trial Signup</h2>
    
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
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Preferred Time:</strong> ${convertTo12Hour(preferredTime)}</p>
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Start Date:</strong> ${startDateDisplay}</p>
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
      subject: `New Free Trial Signup: ${firstName} ${lastName} - ${preferredDayLabel} at ${convertTo12Hour(preferredTime)}`,
      html: htmlMessage,
      text: plainTextMessage,
      replyTo: email,
      headers: {
        "X-Entity-Ref-ID": `free-trial-${Date.now()}`,
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

    console.log("Free trial email sent successfully! Resend response:", { id: data?.id, data })
    return NextResponse.json(
      { message: "Form submitted successfully", id: data?.id },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error processing free trial form:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

