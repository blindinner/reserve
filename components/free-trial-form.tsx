"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
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

interface AddressSuggestion {
  formatted: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  country: string
  postcode?: string
}

export function FreeTrialForm() {
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
    additionalInfo: "",
  })
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const addressInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

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

  // Validate form
  const canSubmit = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.phoneNumber &&
      formData.address &&
      formData.reservationWith &&
      formData.preferredDay &&
      formData.preferredTime &&
      formData.startDateOption &&
      (shouldShowNumberOfPeople ? formData.numberOfPeople : true)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const response = await fetch("/api/free-trial", {
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

      console.log("Form submitted successfully:", data)

      setSubmitStatus("success")
      // Reset form after success
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
          preferredTime: "18:00",
          startDateOption: "",
          additionalInfo: "",
        })
        setSubmitStatus("idle")
      }, 5000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmitStatus("error")
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

  return (
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

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-lg border border-[#F0BB78]/20 p-6 md:p-8 lg:p-10 space-y-8">
          {/* Contact Information */}
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-light text-[#543A14] mb-6">
              Contact Information
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
          </div>

          {/* Reservation Preferences */}
          <div className="pt-6 border-t border-[#F0BB78]/20">
            <h2 className="text-xl md:text-2xl font-serif font-light text-[#543A14] mb-6">
              Reservation Preferences
            </h2>

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
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.startDateOption === "this-week"
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
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.startDateOption === "next-week"
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
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-[#F0BB78]/20">
            <Button
              type="submit"
              disabled={isSubmitting || !canSubmit()}
              className="w-full bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#543A14] disabled:opacity-50 disabled:cursor-not-allowed h-12 font-medium"
            >
              {isSubmitting ? "Submitting..." : "Claim Your Free Month"}
            </Button>

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
    </div>
  )
}

