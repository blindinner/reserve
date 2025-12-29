"use client"

import React, { useState, useRef, useEffect } from "react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Script from "next/script"
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

interface SpecificDateEntry {
  date: Date
  time: string // 24-hour format
  reservationWith: string
  numberOfPeople: string
  isCustomized?: boolean // Whether user has customized this date's settings
}

export function FreeTrialForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    address: "",
    reservationWith: "",
    numberOfPeople: "",
    bookingType: "recurring", // "recurring" or "specific-dates"
    frequency: "", // "weekly" or "biweekly" (for recurring)
    preferredDay: "",
    preferredTime: "18:00", // Default to 6 PM
    startDateOption: "", // "this-week" or "next-week" (for recurring)
    defaultPreferredTime: "18:00", // Default time for specific dates
    specificDates: [] as SpecificDateEntry[], // Array of date entries with individual settings
    editingDateIndex: -1, // Track which date is being edited (-1 means none)
    additionalInfo: "",
    favoriteRestaurants: "",
    restaurantsToTry: "",
    dietaryRestrictions: "",
    cuisinesToAvoid: "",
    additionalNotes: "",
  })
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  const [addressVerified, setAddressVerified] = useState(false)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [isPaymentReady, setIsPaymentReady] = useState(false)
  const allpayRef = useRef<any>(null)
  const iframeId = "allpay-payment-iframe-free-trial"

  // Declare AllpayPayment type
  declare global {
    interface Window {
      AllpayPayment: any
    }
  }

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
    // Unverify address if user types (modifies the selected address)
    setAddressVerified(false)

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
    setAddressVerified(true) // Mark address as verified when user selects from suggestions
  }

  // Determine if we should show the number of people field
  const shouldShowNumberOfPeople =
    formData.reservationWith === "kids" ||
    formData.reservationWith === "whole-family" ||
    formData.reservationWith === "friend"


  // Calculate final number of people for display
  const finalNumberOfPeople =
    formData.reservationWith === "spouse" || formData.reservationWith === "boyfriend-girlfriend"
      ? "2"
      : formData.numberOfPeople || ""

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

  // Handle specific dates selection (for multiple mode, receives array of dates)
  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) {
      setFormData((prev) => ({ ...prev, specificDates: [] }))
      return
    }

    // Cap at 4 dates
    const maxDates = dates.slice(0, 4)

    // Sort dates chronologically
    const sortedDates = [...maxDates].sort((a, b) => a.getTime() - b.getTime())

    setFormData((prev) => {
      // Keep existing entries for dates that are still selected
      const existingEntries = prev.specificDates.filter((entry) =>
        sortedDates.some((d) => d.toDateString() === entry.date.toDateString())
      )

      // Create new entries for newly added dates using defaults
      const existingDateStrings = existingEntries.map((e) => e.date.toDateString())
      const newDates = sortedDates.filter(
        (d) => !existingDateStrings.includes(d.toDateString())
      )

      // Determine default number of people based on reservation type
      const defaultPeople =
        prev.reservationWith === "spouse" ||
          prev.reservationWith === "boyfriend-girlfriend"
          ? "2"
          : prev.numberOfPeople || ""

      const newEntries: SpecificDateEntry[] = newDates.map((date) => ({
        date,
        time: prev.defaultPreferredTime || "18:00",
        reservationWith: prev.reservationWith || "",
        numberOfPeople: defaultPeople,
        isCustomized: false, // Track if user has customized this date
      }))

      // Combine and sort by date
      const allEntries = [...existingEntries, ...newEntries].sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      )

      return { ...prev, specificDates: allEntries }
    })
  }

  // Update defaults and apply to all non-customized dates
  const updateDefaults = (field: "defaultPreferredTime", value: string) => {
    setFormData((prev) => {
      const updates: any = {}

      if (field === "defaultPreferredTime") {
        // Update time for all non-customized dates
        const time24 = value.includes("AM") || value.includes("PM")
          ? convertTo24Hour(value)
          : value
        updates.defaultPreferredTime = time24
        updates.specificDates = prev.specificDates.map((entry) => {
          if (!entry.isCustomized) {
            return { ...entry, time: time24 }
          }
          return entry
        })
      }

      return { ...prev, ...updates }
    })
  }

  // Sync reservation preferences to all non-customized dates
  useEffect(() => {
    if (formData.bookingType === "specific-dates" && formData.reservationWith) {
      setFormData((prev) => {
        const defaultPeople =
          prev.reservationWith === "spouse" ||
            prev.reservationWith === "boyfriend-girlfriend"
            ? "2"
            : prev.numberOfPeople || ""

        return {
          ...prev,
          specificDates: prev.specificDates.map((entry) => {
            if (!entry.isCustomized) {
              return {
                ...entry,
                reservationWith: prev.reservationWith,
                numberOfPeople: defaultPeople,
              }
            }
            return entry
          }),
        }
      })
    }
  }, [formData.reservationWith, formData.numberOfPeople, formData.bookingType])

  // Remove a specific date
  const removeDate = (dateToRemove: Date) => {
    setFormData((prev) => ({
      ...prev,
      specificDates: prev.specificDates.filter(
        (entry) => entry.date.toDateString() !== dateToRemove.toDateString()
      ),
    }))
  }

  // Update a specific date entry's settings (when customizing)
  const updateDateEntry = (dateIndex: number, field: keyof SpecificDateEntry, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specificDates: prev.specificDates.map((entry, index) => {
        if (index === dateIndex) {
          // Auto-set number of people for spouse/partner
          if (field === "reservationWith") {
            if (value === "spouse" || value === "boyfriend-girlfriend") {
              return { ...entry, [field]: value, numberOfPeople: "2", isCustomized: true }
            } else {
              return { ...entry, [field]: value, numberOfPeople: "", isCustomized: true }
            }
          }
          // Handle time conversion for display
          if (field === "time" && value.includes(":")) {
            // Check if it's 12-hour format (has AM/PM)
            if (value.includes("AM") || value.includes("PM")) {
              const time24 = convertTo24Hour(value)
              return { ...entry, [field]: time24, isCustomized: true }
            }
            // Already 24-hour format
            return { ...entry, [field]: value, isCustomized: true }
          }
          if (field === "numberOfPeople") {
            return { ...entry, [field]: value, isCustomized: true }
          }
          return { ...entry, [field]: value, isCustomized: true }
        }
        return entry
      }),
    }))
  }

  // Reset a date back to defaults
  const resetDateToDefaults = (dateIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      specificDates: prev.specificDates.map((entry, index) => {
        if (index === dateIndex) {
          const defaultPeople =
            prev.reservationWith === "spouse" ||
              prev.reservationWith === "boyfriend-girlfriend"
              ? "2"
              : prev.numberOfPeople || ""
          return {
            ...entry,
            time: prev.defaultPreferredTime || "18:00",
            reservationWith: prev.reservationWith || "",
            numberOfPeople: defaultPeople,
            isCustomized: false,
          }
        }
        return entry
      }),
      editingDateIndex: -1,
    }))
  }

  // Validate current step
  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      // Step 1: Personal Info - address must be verified (selected from autocomplete)
      return (
        formData.firstName &&
        formData.lastName &&
        formData.email &&
        formData.phoneNumber &&
        formData.address &&
        addressVerified
      )
    } else if (currentStep === 2) {
      // Step 2: Reservation Preferences
      if (formData.bookingType === "recurring") {
        return (
          formData.reservationWith &&
          formData.frequency &&
          formData.preferredDay &&
          formData.preferredTime &&
          formData.startDateOption &&
          (shouldShowNumberOfPeople ? formData.numberOfPeople : true)
        )
      } else {
        // Specific dates
        if (!formData.reservationWith || !formData.defaultPreferredTime) return false
        const needsPeople =
          formData.reservationWith === "kids" ||
          formData.reservationWith === "whole-family" ||
          formData.reservationWith === "friend"
        if (needsPeople && !formData.numberOfPeople) return false
        if (formData.specificDates.length === 0) return false
        return formData.specificDates.every((entry) => {
          const entryNeedsPeople =
            entry.reservationWith === "kids" ||
            entry.reservationWith === "whole-family" ||
            entry.reservationWith === "friend"
          return (
            entry.time &&
            entry.reservationWith &&
            (entryNeedsPeople ? entry.numberOfPeople : true)
          )
        })
      }
    }
    return true // Step 3 (Additional Info) is optional
  }

  const handleNext = () => {
    if (canProceedToNextStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Validate form
  const canSubmit = () => {
    const baseFields =
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.phoneNumber &&
      formData.address &&
      formData.reservationWith &&
      (shouldShowNumberOfPeople ? formData.numberOfPeople : true)

    if (formData.bookingType === "recurring") {
      return (
        baseFields &&
        formData.frequency &&
        formData.preferredDay &&
        formData.preferredTime &&
        formData.startDateOption
      )
    } else {
      // Validate that reservation preferences are set (shared with recurring)
      if (!formData.reservationWith || !formData.defaultPreferredTime) return false

      // Validate number of people if needed
      const needsPeople =
        formData.reservationWith === "kids" ||
        formData.reservationWith === "whole-family" ||
        formData.reservationWith === "friend"

      if (needsPeople && !formData.numberOfPeople) return false

      // Validate that all specific dates have required fields
      if (formData.specificDates.length === 0) return false

      return formData.specificDates.every((entry) => {
        const entryNeedsPeople =
          entry.reservationWith === "kids" ||
          entry.reservationWith === "whole-family" ||
          entry.reservationWith === "friend"
        return (
          entry.time &&
          entry.reservationWith &&
          (entryNeedsPeople ? entry.numberOfPeople : true)
        )
      })
    }
  }

  // Pricing calculations - default to biweekly for free trial
  const planPricing = {
    weekly: { monthly: 39, annual: 390 },
    biweekly: { monthly: 25, annual: 250 },
  }

  const getCurrentPrice = (plan: string = "biweekly") => {
    return planPricing[plan as "weekly" | "biweekly"]?.monthly || 25
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Only submit if we're on the last step
    if (currentStep !== totalSteps) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // Determine plan from frequency (default to biweekly)
      const plan = formData.frequency === "weekly" ? "weekly" : "biweekly"
      const amount = getCurrentPrice(plan)

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
          plan: plan,
          billingFrequency: "monthly",
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

      // Save form data to free-trial API (for tracking)
      const submissionData = {
        ...formData,
        specificDates: formData.specificDates.map((entry) => ({
          date: entry.date.toISOString(),
          time: entry.time,
          reservationWith: entry.reservationWith,
          numberOfPeople: entry.numberOfPeople,
        })),
        editingDateIndex: undefined,
        orderId: orderId,
      }
      delete submissionData.editingDateIndex

      const freeTrialResponse = await fetch("/api/free-trial", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      })

      if (!freeTrialResponse.ok) {
        console.error("Free trial API Error:", await freeTrialResponse.json())
        // Continue anyway - payment is created
      }

      // Set payment URL to show iframe in modal
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
      setTimeout(() => {
        setSubmitStatus("idle")
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Initialize Allpay when payment URL is ready
  useEffect(() => {
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
        setSubmitStatus("error")
        setIsPaymentReady(false)
        setPaymentUrl(null)
      }
    }
  }, [isPaymentReady, paymentUrl, currentOrderId, router])

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

  const stepLabels = [
    { number: 1, title: "Personal Info" },
    { number: 2, title: "Reservation Preferences" },
    { number: 3, title: "Additional Info" },
  ]

  return (
    <>
      {/* Load Allpay Hosted Fields script */}
      <Script
        src="https://allpay.to/js/allpay-hf.js"
        strategy="afterInteractive"
        onLoad={() => {
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
      <div className="py-8 md:py-12 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 md:mb-10 text-center">
        <Link
          href="/"
          className="text-2xl md:text-3xl font-serif text-[#543A14] uppercase tracking-wide inline-block mb-4 hover:opacity-80 transition-opacity"
        >
          RENDEZA
        </Link>
        <h1 className="text-3xl md:text-4xl font-serif font-light text-[#543A14] mb-2">
          Claim Your Free Month
        </h1>
        <p className="text-base text-[#543A14]/70">
          Complete the form below to start your free month subscription
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4 md:gap-8">
          {stepLabels.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${currentStep === step.number
                    ? "bg-[#F0BB78] text-[#543A14]"
                    : currentStep > step.number
                      ? "bg-[#F0BB78]/30 text-[#543A14]"
                      : "bg-[#F0BB78]/10 text-[#543A14]/50"
                    }`}
                >
                  {step.number}
                </div>
                <span
                  className={`text-xs mt-2 font-medium hidden md:block ${currentStep === step.number
                    ? "text-[#543A14]"
                    : "text-[#543A14]/50"
                    }`}
                >
                  {step.title}
                </span>
              </div>
              {index < stepLabels.length - 1 && (
                <div
                  className={`h-px w-12 md:w-20 transition-colors ${currentStep > step.number
                    ? "bg-[#F0BB78]"
                    : "bg-[#F0BB78]/20"
                    }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          // Only allow submission when explicitly clicking the submit button
          // This prevents auto-submission on Enter key
          if (currentStep === totalSteps) {
            handleSubmit(e)
          }
        }}
        onKeyDown={(e) => {
          // Prevent form submission on Enter key anywhere
          // Only allow submission via button click
          if (e.key === "Enter") {
            const target = e.target as HTMLElement
            // Allow Enter in textareas (they handle their own Enter for new lines)
            if (target.tagName === "TEXTAREA") {
              return // Let textarea handle Enter naturally
            }
            // Allow Enter in address input (for autocomplete suggestions and normal input behavior)
            if (target.id === "address") {
              return // Let address input handle Enter naturally for autocomplete
            }
            // Prevent Enter from submitting form in all other cases
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        <div className="bg-white rounded-xl shadow-lg border border-[#F0BB78]/20 p-6 md:p-8 lg:p-10 space-y-8">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-light text-[#543A14] mb-6">
                Personal Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
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

                <div className="space-y-2 md:col-span-2 relative">
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
                      className={`h-12 text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 ${addressVerified && formData.address ? "border-green-500/50" : ""
                        }`}
                    />
                    {isLoading && !addressVerified && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-[#F0BB78] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {addressVerified && formData.address && !isLoading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
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
                  {formData.address && !addressVerified && (
                    <p className="text-sm text-amber-600 mt-1">
                      Please select an address from the suggestions above to continue.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Reservation Preferences */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-light text-[#543A14] mb-6">
                Reservation Preferences
              </h2>

              <div className="space-y-6">
                {/* Booking Type Selection */}
                <div className="space-y-4 pb-4 border-b border-[#F0BB78]/20">
                  <Label className="text-sm font-medium text-[#543A14] block">
                    How would you like to schedule? *
                  </Label>
                  <RadioGroup
                    value={formData.bookingType}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        bookingType: value as "recurring" | "specific-dates",
                        // Reset related fields when switching
                        frequency: "",
                        preferredDay: "",
                        startDateOption: "",
                        specificDates: [],
                        editingDateIndex: -1,
                      })
                    }
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-3 space-y-0">
                      <RadioGroupItem value="recurring" id="recurring" className="mt-1" />
                      <div className="flex-1">
                        <Label
                          htmlFor="recurring"
                          className="text-base font-medium text-[#543A14] cursor-pointer"
                        >
                          Recurring Schedule
                        </Label>
                        <p className="text-sm text-[#543A14]/70 mt-1">
                          Weekly or bi-weekly reservations on the same day
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-y-0">
                      <RadioGroupItem value="specific-dates" id="specific-dates" className="mt-1" />
                      <div className="flex-1">
                        <Label
                          htmlFor="specific-dates"
                          className="text-base font-medium text-[#543A14] cursor-pointer"
                        >
                          Choose Specific Dates
                        </Label>
                        <p className="text-sm text-[#543A14]/70 mt-1">
                          Select the exact dates you'd like us to book for you
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Who - Shared for both booking types */}
                <div className="space-y-3">
                  <Label htmlFor="reservationWith" className="text-sm font-medium text-[#543A14]">
                    With who will your reservation be? *
                  </Label>
                  <Select
                    value={formData.reservationWith}
                    onValueChange={(value) => {
                      if (value === "spouse" || value === "boyfriend-girlfriend") {
                        setFormData({
                          ...formData,
                          reservationWith: value,
                          numberOfPeople: "2",
                        })
                      } else {
                        setFormData({
                          ...formData,
                          reservationWith: value,
                          numberOfPeople: "",
                        })
                      }
                    }}
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

                {/* Number of People - Conditional, Shared for both */}
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
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData({
                          ...formData,
                          numberOfPeople: value,
                        })
                      }}
                      required
                      className="h-12 text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20"
                      placeholder="Enter number of people"
                    />
                  </div>
                )}

                {/* Recurring Booking Fields */}
                {formData.bookingType === "recurring" && (
                  <>
                    {/* Frequency Selection */}
                    <div className="space-y-3 pt-4 border-t border-[#F0BB78]/20">
                      <Label htmlFor="frequency" className="text-sm font-medium text-[#543A14]">
                        How often? *
                      </Label>
                      <Select
                        value={formData.frequency}
                        onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                        required={formData.bookingType === "recurring"}
                      >
                        <SelectTrigger className="h-12 text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 w-full bg-white">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#F0BB78]/30">
                          <SelectItem value="weekly" className="text-[#543A14]">Weekly</SelectItem>
                          <SelectItem value="biweekly" className="text-[#543A14]">Bi-weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

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
                          value={formData.preferredTime ? convertTo12Hour(formData.preferredTime) : "6:00 PM"}
                          onValueChange={(value) => {
                            const time24 = convertTo24Hour(value)
                            setFormData(prev => ({ ...prev, preferredTime: time24 }))
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

                    {/* Start Date Selection */}
                    {formData.preferredDay && formData.preferredTime && (
                      <div className="space-y-3 pt-4 border-t border-[#F0BB78]/20">
                        <Label className="text-sm font-medium text-[#543A14] block">
                          When would you like to start? *
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, startDateOption: "this-week" })}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${formData.startDateOption === "this-week"
                              ? "border-[#F0BB78] bg-[#F0BB78]/10"
                              : "border-[#F0BB78]/30 bg-white hover:border-[#F0BB78]/60"
                              }`}
                          >
                            <div className="font-medium text-[#543A14] mb-1">
                              This Coming {formData.preferredDay.charAt(0).toUpperCase() + formData.preferredDay.slice(1)}
                            </div>
                            <div className="text-sm text-[#543A14]/70">
                              {formatDate(getNextDateForDay(formData.preferredDay, 0))}
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, startDateOption: "next-week" })}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${formData.startDateOption === "next-week"
                              ? "border-[#F0BB78] bg-[#F0BB78]/10"
                              : "border-[#F0BB78]/30 bg-white hover:border-[#F0BB78]/60"
                              }`}
                          >
                            <div className="font-medium text-[#543A14] mb-1">
                              The Following {formData.preferredDay.charAt(0).toUpperCase() + formData.preferredDay.slice(1)}
                            </div>
                            <div className="text-sm text-[#543A14]/70">
                              {formatDate(getNextDateForDay(formData.preferredDay, 1))}
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Specific Dates Selection */}
                {formData.bookingType === "specific-dates" && (
                  <>
                    {/* Default Time Preference */}
                    <div className="space-y-6 pt-4 border-t border-[#F0BB78]/20 pb-4 border-b border-[#F0BB78]/20">
                      <div>
                        <Label className="text-sm font-medium text-[#543A14] block mb-1">
                          Default Time Preference *
                        </Label>
                        <p className="text-xs text-[#543A14]/60 mb-4">
                          Set your preferred time. This will be applied to all selected dates, but you can customize individual dates if needed.
                        </p>
                      </div>

                      {/* Default Time */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-[#543A14]">
                          Preferred Time *
                        </Label>
                        <Select
                          value={
                            formData.defaultPreferredTime
                              ? convertTo12Hour(formData.defaultPreferredTime)
                              : "6:00 PM"
                          }
                          onValueChange={(value) => {
                            const time24 = convertTo24Hour(value)
                            updateDefaults("defaultPreferredTime", time24)
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
                                    <SelectItem
                                      key={displayTime}
                                      value={displayTime}
                                      className="text-[#543A14]"
                                    >
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

                    {/* Date Selection */}
                    <div className="space-y-4 pt-4">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-[#543A14] block">
                          Select Dates (max 4) *
                        </Label>
                        <p className="text-xs text-[#543A14]/60">
                          Select up to 4 dates. Default preferences will be applied automatically.
                        </p>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full justify-start text-left font-normal h-12 text-base border-[#F0BB78]/50 hover:border-[#F0BB78] focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 bg-white"
                              disabled={formData.specificDates.length >= 4}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-[#543A14]" />
                              {formData.specificDates.length === 0
                                ? "Pick your dates (max 4)"
                                : `${formData.specificDates.length} date${formData.specificDates.length > 1 ? "s" : ""} selected${formData.specificDates.length >= 4 ? " (max reached)" : ""}`}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white border-[#F0BB78]/30" align="start">
                            <Calendar
                              mode="multiple"
                              selected={formData.specificDates.map((entry) => entry.date)}
                              onSelect={handleDateSelect}
                              disabled={(date) => {
                                // Disable past dates
                                const today = new Date()
                                today.setHours(0, 0, 0, 0)
                                // Also disable if we've reached max dates
                                if (formData.specificDates.length >= 4) {
                                  const isSelected = formData.specificDates.some(
                                    (e) => e.date.toDateString() === date.toDateString()
                                  )
                                  return date < today || !isSelected
                                }
                                return date < today
                              }}
                              initialFocus
                              className="border-0"
                            />
                          </PopoverContent>
                        </Popover>
                        {formData.specificDates.length >= 4 && (
                          <p className="text-xs text-[#543A14]/60 mt-1">
                            Maximum of 4 dates reached. Remove a date to select a different one.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Selected Dates Display */}
                    {formData.specificDates.length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-[#F0BB78]/20">
                        <Label className="text-sm font-medium text-[#543A14] block">
                          Selected Dates
                        </Label>
                        {formData.specificDates.map((entry, index) => {
                          const reservationWithLabels: Record<string, string> = {
                            spouse: "Spouse",
                            "boyfriend-girlfriend": "Boyfriend / Girlfriend",
                            kids: "Kids",
                            "whole-family": "Whole Family",
                            friend: "Friend",
                          }
                          const withLabel =
                            reservationWithLabels[entry.reservationWith] ||
                            entry.reservationWith
                          const peopleCount =
                            entry.reservationWith === "spouse" ||
                              entry.reservationWith === "boyfriend-girlfriend"
                              ? "2"
                              : entry.numberOfPeople || ""

                          const isEditing = formData.editingDateIndex === index

                          return (
                            <div
                              key={index}
                              className={`p-4 bg-[#F0BB78]/5 border border-[#F0BB78]/20 rounded-lg ${entry.isCustomized ? "border-[#F0BB78]/50" : ""
                                }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium text-[#543A14]">
                                      {format(entry.date, "EEEE, MMMM d, yyyy")}
                                    </h4>
                                    {entry.isCustomized && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-[#F0BB78]/20 border-[#F0BB78]/50 text-[#543A14]"
                                      >
                                        Customized
                                      </Badge>
                                    )}
                                  </div>
                                  {!isEditing ? (
                                    <div className="space-y-1 text-sm text-[#543A14]/80">
                                      <p>
                                        <span className="font-medium">Time:</span>{" "}
                                        {convertTo12Hour(entry.time)}
                                      </p>
                                      <p>
                                        <span className="font-medium">With:</span> {withLabel}
                                        {peopleCount && ` (${peopleCount} people)`}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="space-y-4 mt-4">
                                      {/* Who */}
                                      <div className="space-y-2">
                                        <Label className="text-xs font-medium text-[#543A14]">
                                          With who? *
                                        </Label>
                                        <Select
                                          value={entry.reservationWith}
                                          onValueChange={(value) =>
                                            updateDateEntry(index, "reservationWith", value)
                                          }
                                          required
                                        >
                                          <SelectTrigger className="h-10 text-sm border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 bg-white">
                                            <SelectValue placeholder="Select an option" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-white border-[#F0BB78]/30">
                                            <SelectItem value="spouse" className="text-[#543A14]">
                                              Spouse
                                            </SelectItem>
                                            <SelectItem
                                              value="boyfriend-girlfriend"
                                              className="text-[#543A14]"
                                            >
                                              Boyfriend / Girlfriend
                                            </SelectItem>
                                            <SelectItem value="kids" className="text-[#543A14]">
                                              Kids
                                            </SelectItem>
                                            <SelectItem
                                              value="whole-family"
                                              className="text-[#543A14]"
                                            >
                                              Whole Family
                                            </SelectItem>
                                            <SelectItem value="friend" className="text-[#543A14]">
                                              Friend
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {/* Number of People - Conditional */}
                                      {(entry.reservationWith === "kids" ||
                                        entry.reservationWith === "whole-family" ||
                                        entry.reservationWith === "friend") && (
                                          <div className="space-y-2">
                                            <Label className="text-xs font-medium text-[#543A14]">
                                              How many people? *
                                            </Label>
                                            <Input
                                              type="number"
                                              min="1"
                                              value={entry.numberOfPeople}
                                              onChange={(e) =>
                                                updateDateEntry(index, "numberOfPeople", e.target.value)
                                              }
                                              required
                                              className="h-10 text-sm border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20"
                                              placeholder="Enter number of people"
                                            />
                                          </div>
                                        )}

                                      {/* Time */}
                                      <div className="space-y-2">
                                        <Label className="text-xs font-medium text-[#543A14]">
                                          Preferred Time *
                                        </Label>
                                        <Select
                                          value={
                                            entry.time ? convertTo12Hour(entry.time) : "6:00 PM"
                                          }
                                          onValueChange={(value) =>
                                            updateDateEntry(index, "time", value)
                                          }
                                          required
                                        >
                                          <SelectTrigger className="h-10 text-sm border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 bg-white">
                                            <SelectValue placeholder="Select time" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-white border-[#F0BB78]/30 max-h-[300px]">
                                            {["AM", "PM"].map((period) =>
                                              Array.from({ length: 12 }, (_, i) => i + 1).map(
                                                (hour) =>
                                                  ["00", "30"].map((minute) => {
                                                    const displayTime = `${hour}:${minute} ${period}`
                                                    return (
                                                      <SelectItem
                                                        key={displayTime}
                                                        value={displayTime}
                                                        className="text-[#543A14]"
                                                      >
                                                        {displayTime}
                                                      </SelectItem>
                                                    )
                                                  })
                                              ).flat()
                                            ).flat()}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className="flex gap-2 pt-2">
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          onClick={() => resetDateToDefaults(index)}
                                          className="text-xs h-8 border-[#F0BB78]/50 text-[#543A14] hover:bg-[#F0BB78]/10"
                                        >
                                          Reset to Defaults
                                        </Button>
                                        <Button
                                          type="button"
                                          size="sm"
                                          onClick={() =>
                                            setFormData((prev) => ({
                                              ...prev,
                                              editingDateIndex: -1,
                                            }))
                                          }
                                          className="text-xs h-8 bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#543A14]"
                                        >
                                          Done
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-start gap-2 ml-4">
                                  {!isEditing && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          editingDateIndex: index,
                                        }))
                                      }
                                      className="text-xs h-8 text-[#543A14] hover:bg-[#F0BB78]/20"
                                    >
                                      Edit
                                    </Button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeDate(entry.date)}
                                    className="text-[#543A14]/60 hover:text-[#543A14] transition-colors p-1"
                                    aria-label="Remove date"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}

              </div>
            </div>
          )}

          {/* Step 3: Additional Info */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl md:text-2xl font-serif font-light text-[#543A14] mb-6">
                Additional Information
              </h2>

              {/* Favorite Restaurants */}
              <div className="space-y-3">
                <Label htmlFor="favoriteRestaurants" className="text-sm font-medium text-[#543A14]">
                  Favorite Restaurants (Optional)
                </Label>
                <Textarea
                  id="favoriteRestaurants"
                  placeholder="Tell us about your favorite restaurants"
                  value={formData.favoriteRestaurants}
                  onChange={(e) => setFormData({ ...formData, favoriteRestaurants: e.target.value })}
                  rows={3}
                  className="text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 resize-none"
                />
              </div>

              {/* Restaurants to Try */}
              <div className="space-y-3">
                <Label htmlFor="restaurantsToTry" className="text-sm font-medium text-[#543A14]">
                  Any restaurants you'd like us to try and book for you? (Optional)
                </Label>
                <Textarea
                  id="restaurantsToTry"
                  placeholder="We will do our best to book them for you"
                  value={formData.restaurantsToTry}
                  onChange={(e) => setFormData({ ...formData, restaurantsToTry: e.target.value })}
                  rows={3}
                  className="text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 resize-none"
                />
              </div>

              {/* Dietary Restrictions */}
              <div className="space-y-3">
                <Label htmlFor="dietaryRestrictions" className="text-sm font-medium text-[#543A14]">
                  Any Dietary Restrictions? (Optional)
                </Label>
                <Textarea
                  id="dietaryRestrictions"
                  placeholder="Vegetarian, gluten-free, nut allergies, kosher..."
                  value={formData.dietaryRestrictions}
                  onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                  rows={3}
                  className="text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 resize-none"
                />
              </div>

              {/* Cuisines/Places to Avoid */}
              <div className="space-y-3">
                <Label htmlFor="cuisinesToAvoid" className="text-sm font-medium text-[#543A14]">
                  Any Type of Cuisine or Specific Place We Should Definitely Avoid? (Optional)
                </Label>
                <p className="text-xs text-[#543A14]/60">
                  Help us avoid cuisines or restaurants you prefer not to visit
                </p>
                <Textarea
                  id="cuisinesToAvoid"
                  value={formData.cuisinesToAvoid}
                  onChange={(e) => setFormData({ ...formData, cuisinesToAvoid: e.target.value })}
                  rows={3}
                  className="text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 resize-none"
                />
              </div>

              {/* Additional Notes */}
              <div className="space-y-3">
                <Label htmlFor="additionalNotes" className="text-sm font-medium text-[#543A14]">
                  Additional Notes (Optional)
                </Label>
                <p className="text-xs text-[#543A14]/60">
                  If there is something we haven't asked and you want to share with us to make your experience better, now is the time
                </p>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  rows={4}
                  className="text-base border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 resize-none"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-6 border-t border-[#F0BB78]/20">
            <div className="flex gap-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 border-[#F0BB78]/50 text-[#543A14] hover:bg-[#F0BB78]/10 h-12 font-medium"
                >
                  Back
                </Button>
              )}
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceedToNextStep()}
                  className="flex-1 bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#543A14] disabled:opacity-50 disabled:cursor-not-allowed h-12 font-medium"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (currentStep === totalSteps && canSubmit() && !isSubmitting) {
                      handleSubmit(e as any)
                    }
                  }}
                  disabled={isSubmitting || !canSubmit()}
                  className="flex-1 bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#543A14] disabled:opacity-50 disabled:cursor-not-allowed h-12 font-medium"
                >
                  {isSubmitting ? "Processing..." : "Proceed to Payment"}
                </Button>
              )}
            </div>

            {submitStatus === "success" && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium text-sm">
                  Thank you! We've received your information and will be in touch soon to activate your free month.
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
      </form>

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
            <style dangerouslySetInnerHTML={{__html: `
              form {
                display: contents;
              }
              .api_fields-wrap {
                grid-column-gap: 1rem;
                grid-row-gap: 1rem;
                flex-flow: column;
                display: flex;
              }
              .api_fields-line {
                grid-column-gap: 1rem;
                grid-row-gap: 1rem;
                justify-content: flex-start;
                display: flex;
              }
              .api_input-wrap {
                grid-column-gap: 0.5rem;
                flex: 1 1 0;
                min-width: 0;
                position: relative;
              }
              .api_input-label {
                color: #543A14;
                opacity: 0.7;
                padding-bottom: 0.25rem;
                font-size: 0.75rem;
                font-weight: 400;
                line-height: 1.3;
              }
              .api_input-container {
                border: 1px solid #F0BB78;
                border-radius: 0.5rem;
                margin-bottom: 0;
                padding: 0.75rem 4rem 0.75rem 1rem;
                background-color: transparent;
                transition: border-color 0.2s, box-shadow 0.2s;
              }
              .api_input-container:focus-within {
                border-color: #F0BB78;
                box-shadow: 0 0 0 3px rgba(240, 187, 120, 0.15);
                outline: none;
              }
              .api_input-container iframe {
                height: 1.25rem !important;
                display: block;
              }
              .api_input-container.no-brand {
                background-image: url("https://allpay.to/images/hfields/card.svg");
                background-position: 95%;
                background-repeat: no-repeat;
                background-size: auto 1.5rem;
              }
              .api_input-container.cvc {
                background-image: url("https://allpay.to/hfields/cvc.svg");
                background-position: 90%;
                background-repeat: no-repeat;
                background-size: auto 1.5rem;
              }
              .api_input-container.visa,
              .api_input-container.mastercard,
              .api_input-container.amex,
              .api_input-container.discover,
              .api_input-container.jcb,
              .api_input-container.diners {
                background-position: 95%;
                background-repeat: no-repeat;
                background-size: auto 2rem;
              }
              .api_input-container.visa {
                background-image: url("https://allpay.to/hfields/visa.svg");
              }
              .api_input-container.mastercard {
                background-image: url("https://allpay.to/hfields/mastercard.svg");
              }
              .api_input-container.amex {
                background-image: url("https://allpay.to/hfields/amex.svg");
              }
              .api_input-container.discover {
                background-image: url("https://allpay.to/hfields/discover.svg");
              }
              .api_input-container.jcb {
                background-image: url("https://allpay.to/hfields/jcb.svg");
              }
              .api_input-container.diners {
                background-image: url("https://allpay.to/hfields/diners.svg");
              }
              .api_input-container.inst {
                padding: 1rem;
              }
              .api_input_dont-apply-css {
                width: 100%;
                box-sizing: border-box;
                display: block;
                border: none;
                outline: none;
                background: transparent;
                color: #543A14;
              }
              .api_input_dont-apply-css::placeholder {
                color: #543A14;
                opacity: 0.5;
              }
              .api_input-error {
                border: solid 1px #dd5e5e;
                background-color: #fff5f5;
              }
              .apple-pay-btn,
              .bit-pay-btn {
                color: #fff;
                cursor: pointer;
                border-radius: 0.5rem;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 3.125rem;
                transition: opacity 0.2s;
                display: flex;
              }
              .apple-pay-btn {
                background: url(https://allpay.to/hfields/apple-pay.svg) #000 no-repeat center;
              }
              .bit-pay-btn {
                background: url(https://allpay.to/hfields/bit-cyan.svg) #03353b no-repeat center;
              }
              .apple-pay-btn:hover,
              .bit-pay-btn:hover {
                opacity: 0.85;
              }
              .apple-pay-btn:active,
              .bit-pay-btn:active {
                opacity: 0.75;
              }
              .apple-pay-btn:focus-visible,
              .bit-pay-btn:focus-visible {
                outline: 3px solid #F0BB78;
                outline-offset: 3px;
              }
              .api_wallets-message {
                color: #543A14;
                opacity: 0.6;
                font-size: 0.75rem;
                text-align: center;
              }
              .api_wallets-divder-wrap {
                position: relative;
                display: flex;
                margin-top: 0.5rem;
                margin-bottom: 0.5rem;
                justify-content: center;
                align-items: center;
              }
              .api_wallets-divider-line {
                width: 100%;
                height: 1px;
                background-color: #F0BB78;
                opacity: 0.3;
              }
              .api_wallets-divider-text {
                position: absolute;
                z-index: 1;
                padding-right: 0.5rem;
                padding-bottom: 2px;
                padding-left: 0.5rem;
                background-color: #FFF0DC;
                color: #543A14;
                opacity: 0.6;
                font-size: 0.875rem;
                line-height: 1;
              }
              .api_fields-line.api_credential {
                display: flex;
                justify-content: center;
              }
              .api_fields-line.api_credential a {
                display: flex;
                justify-content: center;
                align-items: center;
                grid-column-gap: 0.25rem;
                grid-row-gap: 0.25rem;
                color: #543A14;
                opacity: 0.6;
                font-size: 0.75rem;
                text-decoration: none;
                text-wrap: nowrap;
                cursor: pointer;
                transition: color 0.2s, opacity 0.2s;
              }
              .api_fields-line.api_credential a:hover {
                color: #543A14;
                opacity: 0.8;
              }
              .api_fields-line.installments {
                align-items: center;
                font-size: .875rem;
                color: #543A14;
              }
              .is-inactive {
                opacity: 0.35;
                cursor: not-allowed;
                pointer-events: none;
              }
              .api_warning {
                padding: 0.5rem;
                border-style: solid;
                border-width: 1px;
                border-color: #F0BB78;
                border-radius: 0.25rem;
                background-color: rgba(240, 187, 150, 0.15);
                font-size: 0.75rem;
                text-align: center;
                color: #543A14;
              }
            `}} />
            <div className="rounded-lg overflow-hidden mb-4 bg-transparent">
              <iframe
                id={iframeId}
                src={paymentUrl || ""}
                className="w-full h-[200px] border-0"
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

