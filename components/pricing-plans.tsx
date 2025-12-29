"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function PricingPlans() {
  const [selectedPlan, setSelectedPlan] = useState<string>("biweekly")
  // Note: selectedPlan is kept for visual feedback, but cards now navigate directly

  // Pricing calculations (monthly only)
  const planPricing = {
    weekly: { monthly: 0.01 },
    biweekly: { monthly: 25 },
    business: { monthly: 0 }, // Custom pricing
  }


  return (
    <section id="pricing" className="py-32 md:py-40 px-6 md:px-12 lg:px-20 bg-[#FFF0DC]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-[#543A14] mb-6">
            Choose Your Plan
          </h2>
          <p className="text-lg md:text-xl text-[#543A14]/70 max-w-3xl mx-auto mb-12">
            Select how often you'd like us to secure your reservation. You can always adjust this later.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Weekly Plan */}
          <Link
            href={`/onboarding?plan=weekly&billing=monthly`}
            className={`relative p-8 rounded-xl border-3 transition-all text-center group cursor-pointer block ${
              selectedPlan === "weekly"
                ? "border-[#F0BB78] bg-[#F0BB78]/10 shadow-xl scale-105"
                : "border-[#F0BB78]/30 bg-white hover:border-[#F0BB78]/60 hover:shadow-lg hover:scale-[1.02]"
            }`}
            onClick={() => setSelectedPlan("weekly")}
          >
            {selectedPlan === "weekly" && (
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#F0BB78] flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-[#543A14]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-2xl md:text-3xl font-serif font-light text-[#543A14] mb-4">Weekly</h3>
              <div className="mb-4">
                <div className="flex items-baseline justify-center gap-1 mb-3">
                  <span className="text-4xl font-light text-[#543A14]">${planPricing.weekly.monthly}</span>
                  <span className="text-lg text-[#543A14]/70">/month</span>
                </div>
                <div className="bg-[#F0BB78] rounded-lg border-2 border-[#F0BB78] p-3 shadow-md">
                  <div className="text-sm font-bold text-[#543A14] text-center">
                    First month FREE
                  </div>
                </div>
              </div>
              <p className="text-base text-[#543A14]/70 leading-relaxed">
                Every week, same day, same time
              </p>
            </div>
            <div className="pt-4 border-t border-[#F0BB78]/20">
              <p className="text-sm text-[#543A14]/60">Perfect for consistent routine</p>
            </div>
          </Link>

          {/* Biweekly Plan - Popular */}
          <Link
            href={`/onboarding?plan=biweekly&billing=monthly`}
            className={`relative p-8 rounded-xl border-3 transition-all text-center group cursor-pointer block ${
              selectedPlan === "biweekly"
                ? "border-[#F0BB78] bg-[#F0BB78]/10 shadow-xl scale-105"
                : "border-[#F0BB78] bg-[#F0BB78]/5 hover:border-[#F0BB78] hover:shadow-lg hover:scale-[1.02]"
            }`}
            onClick={() => setSelectedPlan("biweekly")}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#543A14] text-white text-xs font-medium rounded-full whitespace-nowrap">
              MOST POPULAR
            </div>
            {selectedPlan === "biweekly" && (
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#F0BB78] flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-[#543A14]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className="mb-4 mt-6">
              <h3 className="text-2xl md:text-3xl font-serif font-light text-[#543A14] mb-4">Biweekly</h3>
              <div className="mb-4">
                <div className="flex items-baseline justify-center gap-1 mb-3">
                  <span className="text-4xl font-light text-[#543A14]">${planPricing.biweekly.monthly}</span>
                  <span className="text-lg text-[#543A14]/70">/month</span>
                </div>
                <div className="bg-[#F0BB78] rounded-lg border-2 border-[#F0BB78] p-3 shadow-md">
                  <div className="text-sm font-bold text-[#543A14] text-center">
                    First month FREE
                  </div>
                </div>
              </div>
              <p className="text-base text-[#543A14]/70 leading-relaxed">
                Every other week, perfectly timed
              </p>
            </div>
            <div className="pt-4 border-t border-[#F0BB78]/30">
              <p className="text-sm text-[#543A14]/60">Ideal balance of frequency</p>
            </div>
          </Link>

          {/* Business Plan */}
          <Link
            href={`/onboarding?plan=business&billing=monthly`}
            className={`relative p-8 rounded-xl border-3 transition-all text-center group cursor-pointer block ${
              selectedPlan === "business"
                ? "border-[#F0BB78] bg-[#F0BB78]/10 shadow-xl scale-105"
                : "border-[#F0BB78]/30 bg-white hover:border-[#F0BB78]/60 hover:shadow-lg hover:scale-[1.02]"
            }`}
            onClick={() => setSelectedPlan("business")}
          >
            {selectedPlan === "business" && (
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#F0BB78] flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-[#543A14]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-2xl md:text-3xl font-serif font-light text-[#543A14] mb-4">Business</h3>
              <div className="mb-4">
                <p className="text-lg text-[#543A14]/70">Contact us</p>
                <p className="text-sm text-[#543A14]/60">for pricing</p>
              </div>
              <p className="text-base text-[#543A14]/70 leading-relaxed">
                Looking to offer this perk to my company
              </p>
            </div>
            <div className="pt-4 border-t border-[#F0BB78]/20">
              <p className="text-sm text-[#543A14]/60">Corporate plans available</p>
            </div>
          </Link>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            size="lg"
            className="bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#543A14] px-12 py-6 text-base font-medium tracking-wide shadow-lg hover:shadow-xl transition-shadow"
            asChild
          >
            <Link href={`/onboarding?plan=${selectedPlan}&billing=monthly`}>
              Continue to Preferences
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

