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
      bookingType,
      frequency,
      preferredDay,
      preferredTime,
      startDateOption,
      specificDates,
      additionalInfo,
      favoriteRestaurants,
      restaurantsToTry,
      dietaryRestrictions,
      cuisinesToAvoid,
      additionalNotes,
    } = body

    console.log("Received free trial form submission:", {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      reservationWith,
      numberOfPeople,
      bookingType,
      frequency,
      preferredDay,
      preferredTime,
      startDateOption,
      specificDates,
      favoriteRestaurants,
      restaurantsToTry,
      dietaryRestrictions,
      cuisinesToAvoid,
      additionalNotes,
      additionalInfo,
    })

    // Log full data for DB tracking purposes
    console.log("Full submission data for database:", JSON.stringify({
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      reservationWith,
      numberOfPeople,
      bookingType,
      frequency,
      preferredDay,
      preferredTime,
      startDateOption,
      specificDates,
      favoriteRestaurants: favoriteRestaurants || null,
      restaurantsToTry: restaurantsToTry || null,
      dietaryRestrictions: dietaryRestrictions || null,
      cuisinesToAvoid: cuisinesToAvoid || null,
      additionalNotes: additionalNotes || null,
      additionalInfo: additionalInfo || null,
    }, null, 2))

    // Validate required fields
    const baseFieldsValid = firstName && lastName && phoneNumber && email && address && reservationWith && preferredTime

    if (!baseFieldsValid) {
      console.error("Missing required base fields")
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      )
    }

    // Validate booking type specific fields
    if (bookingType === "recurring") {
      if (!frequency || !preferredDay || !startDateOption) {
        console.error("Missing required recurring booking fields")
        return NextResponse.json(
          { error: "Frequency, preferred day, and start date are required for recurring bookings" },
          { status: 400 }
        )
      }
    } else if (bookingType === "specific-dates") {
      if (!specificDates || !Array.isArray(specificDates) || specificDates.length === 0) {
        console.error("Missing required specific dates")
        return NextResponse.json(
          { error: "At least one date must be selected for specific date bookings" },
          { status: 400 }
        )
      }
      // Validate that each date entry has required fields
      for (const entry of specificDates) {
        if (!entry.date || !entry.time || !entry.reservationWith) {
          return NextResponse.json(
            { error: "Each date must have time and reservation type specified" },
            { status: 400 }
          )
        }
        const needsPeople =
          entry.reservationWith === "kids" ||
          entry.reservationWith === "whole-family" ||
          entry.reservationWith === "friend"
        if (needsPeople && !entry.numberOfPeople) {
          return NextResponse.json(
            { error: "Number of people is required for this reservation type on one or more dates" },
            { status: 400 }
          )
        }
      }
    } else {
      return NextResponse.json(
        { error: "Invalid booking type" },
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
    const preferredDayLabel = preferredDay ? (dayLabels[preferredDay] || preferredDay) : ""

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

    // Format date for display (short version)
    const formatDateShort = (date: Date): string => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    // Build schedule display based on booking type
    let scheduleDisplay = ""
    if (bookingType === "recurring") {
      const frequencyLabel = frequency === "weekly" ? "Weekly" : "Bi-weekly"
      const startDateDisplay = startDateOption === "this-week"
        ? `This coming ${preferredDayLabel} (${formatDate(getNextDateForDay(preferredDay, 0))})`
        : `The following ${preferredDayLabel} (${formatDate(getNextDateForDay(preferredDay, 1))})`
      scheduleDisplay = `${frequencyLabel} on ${preferredDayLabel}s\nStart Date: ${startDateDisplay}`
    } else if (bookingType === "specific-dates") {
      const entries = Array.isArray(specificDates) ? specificDates : []
      const reservationWithLabels: Record<string, string> = {
        spouse: "Spouse",
        "boyfriend-girlfriend": "Boyfriend / Girlfriend",
        kids: "Kids",
        "whole-family": "Whole Family",
        friend: "Friend",
      }

      scheduleDisplay = entries
        .map((entry: any) => {
          const date = new Date(entry.date)
          const dateStr = formatDate(date)
          const timeStr = convertTo12Hour(entry.time)
          const withLabel = reservationWithLabels[entry.reservationWith] || entry.reservationWith
          const peopleCount =
            entry.reservationWith === "spouse" || entry.reservationWith === "boyfriend-girlfriend"
              ? "2"
              : entry.numberOfPeople || ""
          return `${dateStr} at ${timeStr}\n  With: ${withLabel}${peopleCount ? ` (${peopleCount} people)` : ""}`
        })
        .join("\n\n")
    }

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
Booking Type: ${bookingType === "recurring" ? "Recurring Schedule" : "Specific Dates"}
Schedule:
${scheduleDisplay}
Preferred Time: ${convertTo12Hour(preferredTime)}

${favoriteRestaurants ? `Favorite Restaurants:\n${favoriteRestaurants}\n` : ""}
${restaurantsToTry ? `Restaurants to Try:\n${restaurantsToTry}\n` : ""}
${dietaryRestrictions ? `Dietary Restrictions:\n${dietaryRestrictions}\n` : ""}
${cuisinesToAvoid ? `Cuisines/Places to Avoid:\n${cuisinesToAvoid}\n` : ""}
${additionalNotes ? `Additional Notes:\n${additionalNotes}\n` : ""}
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
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Booking Type:</strong> ${bookingType === "recurring" ? "Recurring Schedule" : "Specific Dates"}</p>
      ${bookingType === "recurring" ? `
        <p style="margin: 10px 0;"><strong style="color: #543A14;">Frequency:</strong> ${frequency === "weekly" ? "Weekly" : "Bi-weekly"}</p>
        <p style="margin: 10px 0;"><strong style="color: #543A14;">Preferred Day:</strong> ${preferredDayLabel}</p>
        <p style="margin: 10px 0;"><strong style="color: #543A14;">Start Date:</strong> ${startDateOption === "this-week"
          ? `This coming ${preferredDayLabel} (${formatDate(getNextDateForDay(preferredDay, 0))})`
          : `The following ${preferredDayLabel} (${formatDate(getNextDateForDay(preferredDay, 1))})`}</p>
      ` : `
        <p style="margin: 10px 0;"><strong style="color: #543A14;">Selected Dates:</strong></p>
        ${Array.isArray(specificDates) ? specificDates.map((entry: any) => {
            const date = new Date(entry.date)
            const reservationWithLabels: Record<string, string> = {
              spouse: "Spouse",
              "boyfriend-girlfriend": "Boyfriend / Girlfriend",
              kids: "Kids",
              "whole-family": "Whole Family",
              friend: "Friend",
            }
            const withLabel = reservationWithLabels[entry.reservationWith] || entry.reservationWith
            const peopleCount =
              entry.reservationWith === "spouse" || entry.reservationWith === "boyfriend-girlfriend"
                ? "2"
                : entry.numberOfPeople || ""
            return `
            <div style="margin: 15px 0; padding: 15px; background-color: #fafafa; border-radius: 6px; border-left: 3px solid #F0BB78;">
              <p style="margin: 5px 0; font-weight: 600; color: #543A14;">${formatDate(date)}</p>
              <p style="margin: 5px 0; color: #543A14;">Time: ${convertTo12Hour(entry.time)}</p>
              <p style="margin: 5px 0; color: #543A14;">With: ${withLabel}${peopleCount ? ` (${peopleCount} people)` : ""}</p>
            </div>
          `
          }).join("") : ""}
      `}
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Preferred Time:</strong> ${convertTo12Hour(preferredTime)}</p>
    </div>
    
    ${(favoriteRestaurants || restaurantsToTry || dietaryRestrictions || cuisinesToAvoid || additionalNotes || additionalInfo) ? `
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #F0BB78;">
      <h3 style="color: #543A14; margin-top: 0;">Additional Preferences</h3>
      ${favoriteRestaurants ? `
        <p style="margin: 10px 0;"><strong style="color: #543A14;">Favorite Restaurants:</strong></p>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #333; padding: 10px; background-color: #fafafa; border-radius: 4px; margin-bottom: 15px;">${favoriteRestaurants.replace(/\n/g, '<br>')}</div>
      ` : ""}
      ${restaurantsToTry ? `
        <p style="margin: 10px 0;"><strong style="color: #543A14;">Restaurants to Try:</strong></p>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #333; padding: 10px; background-color: #fafafa; border-radius: 4px; margin-bottom: 15px;">${restaurantsToTry.replace(/\n/g, '<br>')}</div>
      ` : ""}
      ${dietaryRestrictions ? `
        <p style="margin: 10px 0;"><strong style="color: #543A14;">Dietary Restrictions:</strong></p>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #333; padding: 10px; background-color: #fafafa; border-radius: 4px; margin-bottom: 15px;">${dietaryRestrictions.replace(/\n/g, '<br>')}</div>
      ` : ""}
      ${cuisinesToAvoid ? `
        <p style="margin: 10px 0;"><strong style="color: #543A14;">Cuisines/Places to Avoid:</strong></p>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #333; padding: 10px; background-color: #fafafa; border-radius: 4px; margin-bottom: 15px;">${cuisinesToAvoid.replace(/\n/g, '<br>')}</div>
      ` : ""}
      ${additionalNotes ? `
        <p style="margin: 10px 0;"><strong style="color: #543A14;">Additional Notes:</strong></p>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #333; padding: 10px; background-color: #fafafa; border-radius: 4px; margin-bottom: 15px;">${additionalNotes.replace(/\n/g, '<br>')}</div>
      ` : ""}
      ${additionalInfo ? `
        <p style="margin: 10px 0;"><strong style="color: #543A14;">Additional Information:</strong></p>
        <div style="white-space: pre-wrap; line-height: 1.8; color: #333; padding: 10px; background-color: #fafafa; border-radius: 4px;">${additionalInfo.replace(/\n/g, '<br>')}</div>
      ` : ""}
    </div>
    ` : ""}
  </div>
</body>
</html>
`

    const subjectBooking = bookingType === "recurring"
      ? `${frequency === "weekly" ? "Weekly" : "Bi-weekly"} on ${preferredDayLabel}s`
      : `${Array.isArray(specificDates) ? specificDates.length : 0} specific date${(Array.isArray(specificDates) ? specificDates.length : 0) > 1 ? "s" : ""}`

    const { data, error } = await resend.emails.send({
      from: "Rendeza <contact@rendeza.com>",
      to: "benji@rendeza.com",
      subject: `New Free Trial Signup: ${firstName} ${lastName} - ${subjectBooking} at ${convertTo12Hour(preferredTime)}`,
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

    // Return all submitted data for potential DB storage
    return NextResponse.json(
      {
        message: "Form submitted successfully",
        id: data?.id,
        data: {
          firstName,
          lastName,
          email,
          phoneNumber,
          address,
          reservationWith,
          numberOfPeople,
          bookingType,
          frequency,
          preferredDay,
          preferredTime,
          startDateOption,
          specificDates,
          favoriteRestaurants: favoriteRestaurants || null,
          restaurantsToTry: restaurantsToTry || null,
          dietaryRestrictions: dietaryRestrictions || null,
          cuisinesToAvoid: cuisinesToAvoid || null,
          additionalNotes: additionalNotes || null,
          additionalInfo: additionalInfo || null,
        }
      },
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

