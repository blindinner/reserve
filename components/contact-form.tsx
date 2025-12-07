"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AddressSuggestion {
  formatted: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  country: string
  postcode?: string
}

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    message: "",
  })
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData({ ...formData, location: value })

    // Debounce API calls
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchAddressSuggestions(value)
    }, 150)
  }

  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    setFormData({ ...formData, location: suggestion.formatted })
    setShowSuggestions(false)
    setSuggestions([])
  }

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
        name: "",
        email: "",
        location: "",
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
    <section id="contact" className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-[#FFF0DC]">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 text-balance text-[#543A14]">Begin Your Journey</h2>
          <p className="text-xl md:text-2xl text-[#543A14]/80 leading-relaxed text-pretty">
            Share a few details, and we'll craft a personalized dining experience for you.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-lg font-light text-[#543A14]">
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-14 text-lg border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-lg font-light text-[#543A14]">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-14 text-lg border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20"
              />
            </div>
          </div>

          <div className="space-y-3 relative">
            <Label htmlFor="location" className="text-lg font-light text-[#543A14]">
              Your Address
            </Label>
            <div className="relative">
              <Input
                ref={inputRef}
                id="location"
                placeholder="Start typing your address..."
                value={formData.location}
                onChange={handleLocationChange}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                required
                className="h-14 text-lg border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20"
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

          <div className="space-y-3">
            <Label htmlFor="message" className="text-lg font-light text-[#543A14]">
              Tell Us About Your Preferences
            </Label>
            <Textarea
              id="message"
              placeholder="Preferred cuisine, dietary restrictions, ideal reservation time (e.g., every Monday at 8:00 PM), or any special requests..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={6}
              className="text-lg border-[#F0BB78]/50 focus:border-[#F0BB78] focus:ring-[#F0BB78]/20 resize-none"
            />
          </div>

          <div className="text-center pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#543A14] text-lg px-12 py-6 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Submit Inquiry"}
            </Button>
            
            {submitStatus === "success" && (
              <p className="text-sm text-green-600 mt-6">
                Thank you! Your inquiry has been sent. We'll respond within 24 hours.
              </p>
            )}
            
            {submitStatus === "error" && (
              <p className="text-sm text-red-600 mt-6">
                Sorry, there was an error sending your message. Please try again later.
              </p>
            )}
            
            {submitStatus === "idle" && (
              <p className="text-sm text-[#543A14]/70 mt-6">
                We'll respond within 24 hours to discuss your personalized service.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
