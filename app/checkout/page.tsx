"use client"

import { Suspense } from "react"
import { CheckoutContent } from "@/components/checkout-content"

function CheckoutPageContent() {
  return <CheckoutContent />
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#FFF0DC]">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <CheckoutPageContent />
      </Suspense>
    </div>
  )
}

