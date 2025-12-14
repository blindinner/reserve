import { Resend } from "resend"
import { NextResponse } from "next/server"

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
    const { firstName, lastName, email, phoneNumber, message } = body

    console.log("Received form submission:", { firstName, lastName, email, phoneNumber, message: message?.substring(0, 50) + "..." })

    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber || !message) {
      console.error("Missing required fields:", { firstName: !!firstName, lastName: !!lastName, email: !!email, phoneNumber: !!phoneNumber, message: !!message })
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    console.log("Attempting to send email to benji@rendeza.com...")

    // Send email using Resend
    const plainTextMessage = `New Contact Form Submission

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phoneNumber}

Message:
${message}
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
    <h2 style="color: #543A14; margin-top: 0;">New Contact Form Submission</h2>
    
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #F0BB78;">
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Name:</strong> ${firstName} ${lastName}</p>
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Email:</strong> <a href="mailto:${email}" style="color: #543A14;">${email}</a></p>
      <p style="margin: 10px 0;"><strong style="color: #543A14;">Phone:</strong> ${phoneNumber}</p>
    </div>
    
    <div style="margin: 30px 0;">
      <h3 style="color: #543A14; margin-bottom: 10px;">Message:</h3>
      <div style="white-space: pre-wrap; line-height: 1.8; color: #333; padding: 15px; background-color: #fafafa; border-radius: 4px;">${message.replace(/\n/g, '<br>')}</div>
    </div>
  </div>
</body>
</html>
`

    const { data, error } = await resend.emails.send({
      from: "Rendeza <contact@rendeza.com>",
      to: "benji@rendeza.com",
      subject: `New Inquiry from ${firstName} ${lastName} - Rendeza`,
      html: htmlMessage,
      text: plainTextMessage,
      replyTo: email,
      headers: {
        "X-Entity-Ref-ID": `inquiry-${Date.now()}`,
      },
    })

    if (error) {
      console.error("Resend error:", JSON.stringify(error, null, 2))
      console.error("Full error details:", error)
      
      // If domain verification fails, provide helpful error message
      const errorMessage = error.message || "Unknown error"
      if (errorMessage.includes("domain") || errorMessage.includes("not verified")) {
        return NextResponse.json(
          { 
            error: "Domain not verified. Please verify contact.rendeza.com in Resend dashboard.",
            details: error 
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: "Failed to send email", details: error, message: errorMessage },
        { status: 500 }
      )
    }

    console.log("Email sent successfully! Resend response:", { id: data?.id, data })
    return NextResponse.json(
      { message: "Email sent successfully", id: data?.id },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error processing contact form:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

