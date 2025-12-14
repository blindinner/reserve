"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("API Error:", data)
        throw new Error(data.error || "Failed to send message")
      }

      console.log("Form submitted successfully:", data)

      // Success
      setSubmitStatus("success")
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        message: "",
      })
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle")
      }, 5000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmitStatus("error")
      // Reset error status after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle")
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-[#543A14]">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light mb-6 text-balance text-[#FFF0DC]">Contact Us</h2>
          <p className="text-xl md:text-2xl text-[#FFF0DC]/80 leading-relaxed text-pretty">
            Share a few details, and we'll craft a personalized dining experience for you.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="firstName" className="text-lg font-light text-[#FFF0DC]">
                Name
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="h-14 text-lg border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 bg-white"
                placeholder="John"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="lastName" className="text-lg font-light text-[#FFF0DC]">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className="h-14 text-lg border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 bg-white"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-lg font-light text-[#FFF0DC]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-14 text-lg border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 bg-white"
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="phoneNumber" className="text-lg font-light text-[#FFF0DC]">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
                className="h-14 text-lg border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 bg-white"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="message" className="text-lg font-light text-[#FFF0DC]">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Your message here..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={6}
              className="text-lg border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 resize-none bg-white"
            />
          </div>

          <div className="text-center pt-4">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#543A14] text-base px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Submit Inquiry"}
            </Button>
            
            {submitStatus === "success" && (
              <p className="text-sm text-green-300 mt-6">
                Thank you! Your inquiry has been sent. We'll respond within 24 hours.
              </p>
            )}
            
            {submitStatus === "error" && (
              <p className="text-sm text-red-300 mt-6">
                Sorry, there was an error sending your message. Please try again later.
              </p>
            )}
            
            {submitStatus === "idle" && (
              <p className="text-sm text-[#FFF0DC]/70 mt-6">
                We'll respond within 24 hours to discuss your personalized service.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
