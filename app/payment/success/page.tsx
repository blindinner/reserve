"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verify payment and update order status
    // Allpay doesn't send webhooks for initial payments, only for recurring charges
    const verifyPayment = async () => {
      if (orderId) {
        try {
          const response = await fetch("/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId }),
          })

          if (response.ok) {
            console.log("Payment verified and order status updated")
          } else {
            console.error("Failed to verify payment")
          }
        } catch (error) {
          console.error("Error verifying payment:", error)
        }
      }
      setIsLoading(false)
    }

    verifyPayment()
  }, [orderId])

  return (
    <div className="min-h-screen bg-[#FFF0DC] flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-xl shadow-lg border border-[#F0BB78]/20 p-8 md:p-12">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-light text-[#543A14] mb-4">
            Payment Successful!
          </h1>

          <p className="text-lg text-[#543A14]/70 mb-6">
            Thank you for your subscription. Your reservation service is now active.
          </p>

          {orderId && (
            <div className="bg-[#FFF0DC]/50 rounded-lg border border-[#F0BB78]/30 p-4 mb-6">
              <p className="text-sm text-[#543A14]/60 mb-1">Order ID</p>
              <p className="text-base font-mono text-[#543A14]">{orderId}</p>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-base text-[#543A14]/70">
              We'll send you a confirmation email shortly with all the details about your subscription and first reservation.
            </p>

            <div className="pt-6">
              <Button
                asChild
                className="bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#543A14] px-8 py-6 text-base font-medium"
              >
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FFF0DC] flex items-center justify-center px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg border border-[#F0BB78]/20 p-8 md:p-12">
            <p className="text-lg text-[#543A14]/70">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}

