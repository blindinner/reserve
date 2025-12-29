"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AddressSuggestion {
  formatted: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  country: string
  postcode?: string
}

export function OnboardingForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planParam = searchParams.get("plan") || "biweekly"
  const billingParam = searchParams.get("billing") || "annual"

  const [currentStep, setCurrentStep] = useState(1)
  const [billingFrequency, setBillingFrequency] = useState<"monthly" | "annual">(billingParam as "monthly" | "annual")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    address: "",
    reservationWith: "",
    numberOfPeople: "",
    preferredDay: "",
    preferredTime: "18:00", // Default to 6 PM
    startDateOption: "", // "this-week" or "next-week"
    pricingPlan: planParam, // From URL parameter
    billingFrequency: billingParam as "monthly" | "annual",
    additionalInfo: "",
  })
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Initialize form data from URL params on mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      pricingPlan: planParam,
      billingFrequency: billingParam as "monthly" | "annual"
    }))
    setBillingFrequency(billingParam as "monthly" | "annual")
  }, [planParam, billingParam])

  // Handle click outside suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch address suggestions from Geoapify
  const fetchAddressSuggestions = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY
    if (!apiKey) {
      console.warn("Geoapify API key not found in environment variables")
      return
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new AbortController for this request
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setIsLoading(true)
    try {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query.trim())}&apiKey=${apiKey}&limit=5`

      const response = await fetch(url, {
        signal: abortController.signal
      })

      if (!response.ok) {
        // Don't log 400 errors as they're usually validation issues
        if (response.status !== 400) {
          console.error(`HTTP error! status: ${response.status}`)
        }
        return
      }

      const data = await response.json()

      if (data.features && Array.isArray(data.features) && data.features.length > 0) {
        const addressSuggestions: AddressSuggestion[] = data.features.map((feature: any) => ({
          formatted: feature.properties?.formatted || "",
          address_line1: feature.properties?.address_line1 || feature.properties?.city || "",
          address_line2: feature.properties?.address_line2 || feature.properties?.country || "",
          city: feature.properties?.city || feature.properties?.county || "",
          state: feature.properties?.state || feature.properties?.region || "",
          country: feature.properties?.country || "",
          postcode: feature.properties?.postcode || "",
        }))
        setSuggestions(addressSuggestions)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error: any) {
      // Ignore abort errors (they're expected when canceling previous requests)
      if (error.name !== 'AbortError') {
        console.error("Error fetching address suggestions:", error)
      }
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false)
      }
    }
  }

  // Handle address input change with debouncing
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData({ ...formData, address: value })

    // Debounce API calls
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchAddressSuggestions(value)
    }, 150)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    setFormData({ ...formData, address: suggestion.formatted })
    setShowSuggestions(false)
    setSuggestions([])
  }
  const [timeHour, setTimeHour] = useState("6")
  const [timeMinute, setTimeMinute] = useState("00")
  const [timePeriod, setTimePeriod] = useState<"AM" | "PM">("PM")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [isPaymentReady, setIsPaymentReady] = useState(false)
  const allpayRef = useRef<any>(null)
  const iframeId = "allpay-payment-iframe-onboarding"

  // Declare AllpayPayment type
  declare global {
    interface Window {
      AllpayPayment: any
    }
  }

  // Determine if we should show the number of people field
  const shouldShowNumberOfPeople =
    formData.reservationWith === "kids" ||
    formData.reservationWith === "whole-family" ||
    formData.reservationWith === "friend"

  // Auto-set number of people for spouse/partner
  const handleReservationWithChange = (value: string) => {
    if (value === "spouse" || value === "boyfriend-girlfriend") {
      setFormData({ ...formData, reservationWith: value, numberOfPeople: "2" })
    } else {
      setFormData({ ...formData, reservationWith: value, numberOfPeople: "" })
    }
  }

  // Calculate final number of people for display
  const finalNumberOfPeople =
    formData.reservationWith === "spouse" || formData.reservationWith === "boyfriend-girlfriend"
      ? "2"
      : formData.numberOfPeople || ""

  // Pricing calculations
  const planPricing = {
    weekly: { monthly: 39, annual: 390 }, // 10 months (2 months free)
    biweekly: { monthly: 25, annual: 250 }, // 10 months (2 months free)
    business: { monthly: 0, annual: 0 }, // Business pricing
  }

  const getCurrentPrice = (plan: string) => {
    if (plan === "weekly" || plan === "biweekly") {
      return billingFrequency === "monthly"
        ? planPricing[plan as "weekly" | "biweekly"].monthly
        : planPricing[plan as "weekly" | "biweekly"].annual
    }
    return 0
  }

  const getMonthlyEquivalent = (plan: string) => {
    if (plan === "weekly" || plan === "biweekly") {
      if (billingFrequency === "annual") {
        return Math.round(planPricing[plan as "weekly" | "biweekly"].annual / 12)
      }
    }
    return planPricing[plan as "weekly" | "biweekly"]?.monthly || 0
  }

  const getSavings = (plan: string) => {
    if (plan === "weekly" || plan === "biweekly") {
      if (billingFrequency === "annual") {
        const monthlyTotal = planPricing[plan as "weekly" | "biweekly"].monthly * 12
        const annualPrice = planPricing[plan as "weekly" | "biweekly"].annual
        return monthlyTotal - annualPrice
      }
    }
    return 0
  }

  // Update billing frequency in form data
  const handleBillingFrequencyChange = (freq: "monthly" | "annual") => {
    setBillingFrequency(freq)
    setFormData({ ...formData, billingFrequency: freq })
  }

  // Validate step 1
  const canProceedStep1 = () => {
    return formData.pricingPlan
  }

  // Convert 12-hour display format to 24-hour format for storage
  const convertTo24Hour = (displayTime: string): string => {
    const [time, period] = displayTime.split(" ")
    const [hour, minute] = time.split(":")
    let hour24 = parseInt(hour)
    if (period === "PM" && hour24 !== 12) {
      hour24 += 12
    } else if (period === "AM" && hour24 === 12) {
      hour24 = 0
    }
    return `${hour24.toString().padStart(2, "0")}:${minute}`
  }

  // Convert 24-hour format to 12-hour display format
  const convertTo12Hour = (time24: string): string => {
    if (!time24) return ""
    const [hour, minute] = time24.split(":")
    const hourNum = parseInt(hour)
    const period = hourNum >= 12 ? "PM" : "AM"
    let hour12 = hourNum % 12
    if (hour12 === 0) hour12 = 12
    return `${hour12}:${minute} ${period}`
  }

  // Calculate next occurrence of a day
  const getNextDateForDay = (dayName: string, weeksFromNow: number = 0): Date => {
    const dayMap: Record<string, number> = {
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

    // Calculate days until target day
    let daysUntilTarget = targetDay - todayDay
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7 // Move to next week if already passed
    }

    // Add weeks offset
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

  // Validate step 2
  const canProceedStep2 = () => {
    return formData.reservationWith && formData.preferredDay && formData.preferredTime && formData.startDateOption
  }

  // Validate step 3 (Checkout)
  const canProceedStep3 = () => {
    return formData.firstName && formData.lastName && formData.email && formData.phoneNumber && formData.address
  }

  const handleNext = () => {
    if (currentStep === 1 && canProceedStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && canProceedStep2()) {
      setCurrentStep(3)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // Skip payment for business plan (custom pricing)
      if (formData.pricingPlan === "business") {
        // Just submit the form without payment
        const response = await fetch("/api/onboarding", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (!response.ok) {
          console.error("API Error:", data)
          throw new Error(data.error || "Failed to submit form")
        }

        setSubmitStatus("success")
        setTimeout(() => {
          setFormData({
            firstName: "",
            lastName: "",
            phoneNumber: "",
            email: "",
            address: "",
            reservationWith: "",
            numberOfPeople: "",
            preferredDay: "",
            preferredTime: "",
            startDateOption: "",
            pricingPlan: "",
            billingFrequency: "monthly",
            additionalInfo: "",
          })
          setBillingFrequency("annual")
          setTimeHour("")
          setTimeMinute("")
          setTimePeriod("PM")
          setCurrentStep(1)
          setSubmitStatus("idle")
        }, 5000)
        return
      }

      // Calculate payment amount
      const amount = getCurrentPrice(formData.pricingPlan)

      if (!amount || amount <= 0) {
        throw new Error("Invalid payment amount")
      }

      // Generate unique order ID
      const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

      // Create payment request
      const paymentResponse = await fetch("/api/allpay/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderId,
          plan: formData.pricingPlan,
          billingFrequency: formData.billingFrequency,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          amount: amount,
        }),
      })

      const paymentData = await paymentResponse.json()

      if (!paymentResponse.ok) {
        console.error("Payment API Error:", paymentData)
        throw new Error(paymentData.error || "Failed to create payment")
      }

      // Store form data temporarily (you might want to save this to a database)
      // For now, we'll submit it to onboarding API which will store it
      // The webhook will confirm payment later
      const onboardingResponse = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          orderId: orderId, // Include order ID for tracking
        }),
      })

      if (!onboardingResponse.ok) {
        console.error("Onboarding API Error:", await onboardingResponse.json())
        // Continue anyway - payment is created
      }

      // Set payment URL to show iframe on same page
      if (paymentData.paymentUrl) {
        setPaymentUrl(paymentData.paymentUrl)
        setCurrentOrderId(orderId)
        setIsPaymentReady(true)
      } else {
        throw new Error("No payment URL received")
      }
    } catch (error) {
      console.error("Error processing payment:", error)
      setSubmitStatus("error")
      // Reset error status after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle")
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

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
  const preferredDayLabel = formData.preferredDay ? dayLabels[formData.preferredDay] || formData.preferredDay : ""

  // Format pricing plan for display
  const pricingPlanLabels: Record<string, string> = {
    weekly: "Weekly",
    biweekly: "Biweekly",
    business: "Business",
  }
  const pricingPlanLabel = formData.pricingPlan ? pricingPlanLabels[formData.pricingPlan] || formData.pricingPlan : ""

  // Handle plan selection with billing frequency
  const handlePlanSelect = (plan: string) => {
    setFormData({ ...formData, pricingPlan: plan, billingFrequency: billingFrequency })
  }

  // Update form data when billing frequency changes if plan is already selected
  useEffect(() => {
    if (formData.pricingPlan) {
      setFormData(prev => ({ ...prev, billingFrequency }))
    }
  }, [billingFrequency])

  // Initialize Allpay when payment URL is ready
  useEffect(() => {
    if (isPaymentReady && paymentUrl && typeof window !== "undefined" && window.AllpayPayment && !allpayRef.current) {
      try {
        allpayRef.current = new window.AllpayPayment({
          iframeId: iframeId,
          onSuccess: function () {
            // Redirect to success page
            router.push(`/payment/success?order_id=${currentOrderId || ""}`)
          },
          onError: function (error_n: number, error_msg: string) {
            console.error("Payment error:", error_n, error_msg)
            setSubmitStatus("error")
            setIsPaymentReady(false)
            setPaymentUrl(null)
          },
        })
      } catch (err) {
        console.error("Error initializing Allpay:", err)
        setSubmitStatus("error")
        setIsPaymentReady(false)
        setPaymentUrl(null)
      }
    }
  }, [isPaymentReady, paymentUrl, currentOrderId, router])

  return (
    <>
      {/* Load Allpay Hosted Fields script */}
      <Script
        src="https://allpay.to/js/allpay-hf.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Try to initialize if payment URL is already ready
          if (isPaymentReady && paymentUrl && typeof window !== "undefined" && window.AllpayPayment && !allpayRef.current) {
            try {
              allpayRef.current = new window.AllpayPayment({
                iframeId: iframeId,
                onSuccess: function () {
                  router.push(`/payment/success?order_id=${currentOrderId || ""}`)
                },
                onError: function (error_n: number, error_msg: string) {
                  console.error("Payment error:", error_n, error_msg)
                  setSubmitStatus("error")
                  setIsPaymentReady(false)
                  setPaymentUrl(null)
                },
              })
            } catch (err) {
              console.error("Error initializing Allpay:", err)
            }
          }
        }}
      />
      <div className="min-h-screen bg-[#FFF0DC]">
        <div className="py-8 md:py-12 px-4 md:px-6 lg:px-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 md:mb-10 text-center">
            <Link
              href="/"
              className="text-2xl md:text-3xl font-serif text-[#543A14] uppercase tracking-wide inline-block mb-4 hover:opacity-80 transition-opacity"
            >
              RENDEZA
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif font-light text-[#543A14] mb-2">
              Personalize Your Experience
            </h1>
          </div>

          {/* Step Indicator */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${currentStep >= 1 ? "bg-[#F0BB78] text-[#543A14]" : "bg-[#F0BB78]/30 text-[#543A14]/60"
                  }`}>
                  {currentStep > 1 ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    "1"
                  )}
                </div>
                <span className={`text-sm font-medium hidden sm:inline transition-colors ${currentStep >= 1 ? "text-[#543A14]" : "text-[#543A14]/60"}`}>
                  Preferences
                </span>
              </div>
              <div className={`w-16 h-px transition-colors ${currentStep >= 2 ? "bg-[#F0BB78]" : "bg-[#F0BB78]/30"}`}></div>
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${currentStep >= 2 ? "bg-[#F0BB78] text-[#543A14]" : "bg-[#F0BB78]/30 text-[#543A14]/60"
                  }`}>
                  2
                </div>
                <span className={`text-sm font-medium hidden sm:inline transition-colors ${currentStep >= 2 ? "text-[#543A14]" : "text-[#543A14]/60"}`}>
                  Checkout
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="pb-12">
            <div className="relative min-h-[600px] pb-8">
              {/* Step 1: Reservation Preferences */}
              <div
                className={`transition-all duration-500 ease-in-out ${currentStep === 1
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-full absolute inset-0 pointer-events-none"
                  }`}
              >
                <div className="bg-white rounded-xl shadow-lg border border-[#F0BB78]/20 p-6 md:p-8 lg:p-10 max-w-3xl mx-auto">
                  {/* Plan Summary Badge */}
                  {formData.pricingPlan && (
                    <div className="mb-6 p-4 bg-[#F0BB78]/10 rounded-lg border border-[#F0BB78]/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-[#543A14]/60 mb-1">Selected Plan</p>
                          <p className="text-base font-medium text-[#543A14]">
                            {pricingPlanLabel}
                          </p>
                          {formData.pricingPlan !== "business" && (
                            <p className="text-xs text-[#543A14]/70 mt-1">First month free</p>
                          )}
                        </div>
                        <Link
                          href="/#pricing"
                          className="text-xs text-[#543A14]/70 hover:text-[#543A14] underline"
                        >
                          Change
                        </Link>
                      </div>
                    </div>
                  )}

                  <h2 className="text-xl md:text-2xl font-serif font-light text-[#543A14] mb-2">
                    Reservation Preferences
                  </h2>
                  <p className="text-sm text-[#543A14]/70 mb-8">
                    Tell us about your reservation details and preferences
                  </p>

                  <div className="space-y-6">
                    {/* Who */}
                    <div className="space-y-3">
                      <Label htmlFor="reservationWith" className="text-sm font-medium text-[#543A14]">
                        With who will your reservation be? *
                      </Label>
                      <Select
                        value={formData.reservationWith}
                        onValueChange={handleReservationWithChange}
                        required
                      >
                        <SelectTrigger className="h-12 text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 w-full bg-white">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#F0BB78]/30">
                          <SelectItem value="spouse" className="text-[#543A14]">Spouse</SelectItem>
                          <SelectItem value="boyfriend-girlfriend" className="text-[#543A14]">Boyfriend / Girlfriend</SelectItem>
                          <SelectItem value="kids" className="text-[#543A14]">Kids</SelectItem>
                          <SelectItem value="whole-family" className="text-[#543A14]">Whole Family</SelectItem>
                          <SelectItem value="friend" className="text-[#543A14]">Friend</SelectItem>
                        </SelectContent>
                      </Select>
                      {(formData.reservationWith === "spouse" || formData.reservationWith === "boyfriend-girlfriend") && (
                        <p className="text-xs text-[#543A14]/60">
                          Reservation set for 2 people
                        </p>
                      )}
                    </div>

                    {/* Number of People - Conditional */}
                    {shouldShowNumberOfPeople && (
                      <div className="space-y-3">
                        <Label htmlFor="numberOfPeople" className="text-sm font-medium text-[#543A14]">
                          How many people? *
                        </Label>
                        <Input
                          id="numberOfPeople"
                          type="number"
                          min="1"
                          value={formData.numberOfPeople}
                          onChange={(e) => setFormData({ ...formData, numberOfPeople: e.target.value })}
                          required
                          className="h-12 text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20"
                          placeholder="Enter number of people"
                        />
                      </div>
                    )}

                    {/* Day and Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Label htmlFor="preferredDay" className="text-sm font-medium text-[#543A14]">
                          Preferred Day *
                        </Label>
                        <Select
                          value={formData.preferredDay}
                          onValueChange={(value) => setFormData({ ...formData, preferredDay: value })}
                          required
                        >
                          <SelectTrigger className="h-12 text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 w-full bg-white">
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-[#F0BB78]/30">
                            <SelectItem value="monday" className="text-[#543A14]">Monday</SelectItem>
                            <SelectItem value="tuesday" className="text-[#543A14]">Tuesday</SelectItem>
                            <SelectItem value="wednesday" className="text-[#543A14]">Wednesday</SelectItem>
                            <SelectItem value="thursday" className="text-[#543A14]">Thursday</SelectItem>
                            <SelectItem value="friday" className="text-[#543A14]">Friday</SelectItem>
                            <SelectItem value="saturday" className="text-[#543A14]">Saturday</SelectItem>
                            <SelectItem value="sunday" className="text-[#543A14]">Sunday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="preferredTime" className="text-sm font-medium text-[#543A14]">
                          Preferred Time *
                        </Label>
                        <Select
                          value={formData.preferredTime ? convertTo12Hour(formData.preferredTime) : ""}
                          onValueChange={(value) => {
                            const time24 = convertTo24Hour(value)
                            setFormData(prev => ({ ...prev, preferredTime: time24 }))
                            // Update time components for display
                            const [time, period] = value.split(" ")
                            const [hour, minute] = time.split(":")
                            setTimeHour(hour)
                            setTimeMinute(minute)
                            setTimePeriod(period as "AM" | "PM")
                          }}
                          required
                        >
                          <SelectTrigger className="h-12 text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 w-full bg-white">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-[#F0BB78]/30 max-h-[300px]">
                            {["AM", "PM"].map((period) =>
                              Array.from({ length: 12 }, (_, i) => i + 1).map((hour) =>
                                ["00", "30"].map((minute) => {
                                  const displayTime = `${hour}:${minute} ${period}`
                                  return (
                                    <SelectItem key={displayTime} value={displayTime} className="text-[#543A14]">
                                      {displayTime}
                                    </SelectItem>
                                  )
                                })
                              ).flat()
                            ).flat()}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Start Date Selection - Show when both day and time are selected */}
                    {formData.preferredDay && formData.preferredTime && (
                      <div className="space-y-3 pt-4 border-t border-[#F0BB78]/20">
                        <Label className="text-sm font-medium text-[#543A14] block">
                          When would you like to start? *
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                          {/* This Week Option */}
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, startDateOption: "this-week" })}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${formData.startDateOption === "this-week"
                                ? "border-[#F0BB78] bg-[#F0BB78]/10"
                                : "border-[#F0BB78]/30 bg-white hover:border-[#F0BB78]/60"
                              }`}
                          >
                            <div className="font-medium text-[#543A14] mb-1">This Coming {formData.preferredDay.charAt(0).toUpperCase() + formData.preferredDay.slice(1)}</div>
                            <div className="text-sm text-[#543A14]/70">
                              {formatDate(getNextDateForDay(formData.preferredDay, 0))}
                            </div>
                          </button>

                          {/* Next Week Option */}
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, startDateOption: "next-week" })}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${formData.startDateOption === "next-week"
                                ? "border-[#F0BB78] bg-[#F0BB78]/10"
                                : "border-[#F0BB78]/30 bg-white hover:border-[#F0BB78]/60"
                              }`}
                          >
                            <div className="font-medium text-[#543A14] mb-1">The Following {formData.preferredDay.charAt(0).toUpperCase() + formData.preferredDay.slice(1)}</div>
                            <div className="text-sm text-[#543A14]/70">
                              {formatDate(getNextDateForDay(formData.preferredDay, 1))}
                            </div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Additional Preferences */}
                    <div className="pt-4 border-t border-[#F0BB78]/20">
                      <Label htmlFor="additionalInfo" className="text-sm font-medium text-[#543A14] block mb-2">
                        Additional Preferences (Optional)
                      </Label>
                      <p className="text-xs text-[#543A14]/60 mb-3">
                        Share your preferences, dietary restrictions, favorite cuisines, or specific restaurants you'd like us to try.
                      </p>
                      <Textarea
                        id="additionalInfo"
                        placeholder="I love Italian and French cuisine. I'm vegetarian and prefer quieter, intimate settings..."
                        value={formData.additionalInfo}
                        onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                        rows={4}
                        className="text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 resize-none"
                      />
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-8">
                    <Button
                      type="button"
                      onClick={handleBack}
                      variant="outline"
                      className="flex-1 border-[#F0BB78]/50 text-[#543A14] hover:bg-[#F0BB78]/10 h-12"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={!canProceedStep2()}
                      className="flex-1 bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#543A14] disabled:opacity-50 disabled:cursor-not-allowed h-12 font-medium"
                    >
                      Continue to Checkout
                    </Button>
                  </div>
                </div>
              </div>

              {/* Step 2: Contact Information + Payment */}
              <div
                className={`transition-all duration-500 ease-in-out ${currentStep === 2
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-full absolute inset-0 pointer-events-none"
                  }`}
              >
                <div className="bg-white rounded-xl shadow-lg border border-[#F0BB78]/20 p-6 md:p-8 lg:p-10 max-w-6xl mx-auto">
                  <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Column: Contact Information */}
                    <div>
                      <h2 className="text-xl md:text-2xl font-serif font-light text-[#543A14] mb-2">
                        Contact Information
                      </h2>
                      <p className="text-sm text-[#543A14]/70 mb-6">
                        We'll use this to confirm your reservations
                      </p>

                      <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm font-medium text-[#543A14]">
                              First Name *
                            </Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              required
                              className="h-12 text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20"
                              placeholder="John"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm font-medium text-[#543A14]">
                              Last Name *
                            </Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              required
                              className="h-12 text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20"
                              placeholder="Doe"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-[#543A14]">
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="h-12 text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20"
                            placeholder="john@example.com"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber" className="text-sm font-medium text-[#543A14]">
                            Phone Number *
                          </Label>
                          <Input
                            id="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            required
                            className="h-12 text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20"
                            placeholder="(555) 123-4567"
                          />
                        </div>

                        <div className="space-y-2 relative">
                          <Label htmlFor="address" className="text-sm font-medium text-[#543A14]">
                            Address *
                          </Label>
                          <div className="relative">
                            <Input
                              ref={addressInputRef}
                              id="address"
                              placeholder="Start typing your address..."
                              value={formData.address}
                              onChange={handleAddressChange}
                              onFocus={() => {
                                if (suggestions.length > 0) {
                                  setShowSuggestions(true)
                                }
                              }}
                              required
                              className="h-12 text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20"
                            />
                            {isLoading && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="w-5 h-5 border-2 border-[#F0BB78] border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                            {showSuggestions && suggestions.length > 0 && (
                              <div
                                ref={suggestionsRef}
                                className="absolute z-50 w-full mt-1 bg-white border border-[#F0BB78]/30 rounded-md shadow-lg max-h-60 overflow-auto"
                              >
                                {suggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleSuggestionSelect(suggestion)}
                                    className="w-full text-left px-4 py-3 hover:bg-[#F0BB78]/10 border-b border-[#F0BB78]/10 last:border-b-0 transition-colors"
                                  >
                                    <div className="text-[#543A14] font-medium">{suggestion.formatted}</div>
                                    {suggestion.city && suggestion.state && (
                                      <div className="text-sm text-[#543A14]/70 mt-1">
                                        {suggestion.city}, {suggestion.state} {suggestion.postcode || ""}
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Back Button */}
                      <div className="mt-8">
                        <Button
                          type="button"
                          onClick={handleBack}
                          variant="outline"
                          className="w-full border-[#F0BB78]/50 text-[#543A14] hover:bg-[#F0BB78]/10 h-12"
                        >
                          Back
                        </Button>
                      </div>
                    </div>

                    {/* Right Column: Summary & Payment */}
                    <div className="lg:border-l lg:border-[#F0BB78]/20 lg:pl-8 lg:pt-0 pt-8 border-t border-[#F0BB78]/20 lg:border-t-0">
                      <h2 className="text-xl md:text-2xl font-serif font-light text-[#543A14] mb-2">
                        Summary
                      </h2>
                      <p className="text-sm text-[#543A14]/70 mb-6">
                        Review your reservation details
                      </p>

                      {/* Plan Summary */}
                      <div className="bg-[#FFF0DC]/50 rounded-lg border border-[#F0BB78]/30 p-5 mb-4">
                        <h3 className="text-sm font-medium text-[#543A14] mb-4 uppercase tracking-wide">Your Plan</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[#543A14]/70 text-sm">Plan</span>
                            <span className="text-[#543A14] font-medium">{pricingPlanLabel}</span>
                          </div>
                          {formData.pricingPlan !== "business" && (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-[#543A14]/70 text-sm">Billing</span>
                                <span className="text-[#543A14] font-medium text-sm">
                                  {billingFrequency === "annual" ? "Annual (2 months free)" : "Monthly"}
                                </span>
                              </div>
                              <div className="flex justify-between items-center pt-3 border-t border-[#F0BB78]/20">
                                <span className="text-[#543A14] font-medium">Total</span>
                                <span className="text-[#543A14] font-medium text-lg">
                                  ${getCurrentPrice(formData.pricingPlan)}
                                  <span className="text-sm font-normal ml-1">
                                    {billingFrequency === "monthly" ? "/month" : "/year"}
                                  </span>
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Reservation Details Summary */}
                      <div className="bg-[#FFF0DC]/50 rounded-lg border border-[#F0BB78]/30 p-5 mb-6">
                        <h3 className="text-sm font-medium text-[#543A14] mb-4 uppercase tracking-wide">Reservation Details</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#543A14]/70">With</span>
                            <span className="text-[#543A14] font-medium">
                              {formData.reservationWith === "spouse" && "Spouse"}
                              {formData.reservationWith === "boyfriend-girlfriend" && "Boyfriend / Girlfriend"}
                              {formData.reservationWith === "kids" && "Kids"}
                              {formData.reservationWith === "whole-family" && "Whole Family"}
                              {formData.reservationWith === "friend" && "Friend"}
                            </span>
                          </div>
                          {finalNumberOfPeople && (
                            <div className="flex justify-between">
                              <span className="text-[#543A14]/70">People</span>
                              <span className="text-[#543A14] font-medium">{finalNumberOfPeople}</span>
                            </div>
                          )}
                          {preferredDayLabel && (
                            <div className="flex justify-between">
                              <span className="text-[#543A14]/70">Day</span>
                              <span className="text-[#543A14] font-medium">{preferredDayLabel}</span>
                            </div>
                          )}
                          {formData.preferredTime && (
                            <div className="flex justify-between">
                              <span className="text-[#543A14]/70">Time</span>
                              <span className="text-[#543A14] font-medium">
                                {convertTo12Hour(formData.preferredTime)}
                              </span>
                            </div>
                          )}
                          {formData.startDateOption && formData.preferredDay && (
                            <div className="flex justify-between pt-2 border-t border-[#F0BB78]/20">
                              <span className="text-[#543A14]/70">Start Date</span>
                              <span className="text-[#543A14] font-medium text-right max-w-[60%]">
                                {formData.startDateOption === "this-week"
                                  ? `This coming ${formData.preferredDay.charAt(0).toUpperCase() + formData.preferredDay.slice(1)}`
                                  : `The following ${formData.preferredDay.charAt(0).toUpperCase() + formData.preferredDay.slice(1)}`
                                }
                                <span className="block text-xs text-[#543A14]/60 font-normal mt-0.5">
                                  {formData.startDateOption === "this-week"
                                    ? formatDate(getNextDateForDay(formData.preferredDay, 0))
                                    : formatDate(getNextDateForDay(formData.preferredDay, 1))
                                  }
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Complete Purchase Button */}
                      <Button
                        type="submit"
                        disabled={isSubmitting || !canProceedStep3()}
                        className="w-full bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#543A14] disabled:opacity-50 disabled:cursor-not-allowed h-12 font-medium shadow-lg hover:shadow-xl transition-shadow"
                      >
                        {isSubmitting ? "Processing..." : "Complete Purchase"}
                      </Button>

                      {submitStatus === "success" && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800 font-medium text-sm">
                            Thank you! We've received your information and will be in touch soon.
                          </p>
                        </div>
                      )}

                      {submitStatus === "error" && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-800 font-medium text-sm">
                            Sorry, there was an error. Please try again.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>

        {/* Payment Modal Dialog */}
        <Dialog open={isPaymentReady && !!paymentUrl} onOpenChange={(open) => {
          if (!open) {
            setIsPaymentReady(false)
            setPaymentUrl(null)
            setSubmitStatus("idle")
          }
        }}>
          <DialogContent className="max-w-xl bg-[#FFF0DC] border-[#F0BB78]/30 p-0 overflow-hidden">
            <DialogHeader className="px-5 pt-4 pb-3 border-b border-[#F0BB78]/20">
              <DialogTitle className="text-xl font-serif font-light text-[#543A14]">
                Complete Your Payment
              </DialogTitle>
              <DialogDescription className="text-sm text-[#543A14]/70 pt-1">
                Enter your payment information to complete your subscription
              </DialogDescription>
            </DialogHeader>

            <div className="px-5 pt-4 pb-4">
              <div className="bg-white rounded-lg border border-[#F0BB78]/30 overflow-hidden shadow-sm mb-4">
                <iframe
                  id={iframeId}
                  src={paymentUrl || ""}
                  className="w-full h-[150px] border-0"
                  title="Payment form"
                />
              </div>

              <Button
                onClick={() => {
                  if (allpayRef.current && typeof allpayRef.current.pay === "function") {
                    allpayRef.current.pay()
                  } else {
                    setSubmitStatus("error")
                    setIsPaymentReady(false)
                    setPaymentUrl(null)
                    setTimeout(() => setSubmitStatus("idle"), 5000)
                  }
                }}
                className="w-full bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#543A14] h-12 font-medium shadow-lg hover:shadow-xl transition-shadow"
              >
                Complete Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
