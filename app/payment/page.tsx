"use client"

import { useEffect, useRef, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Script from "next/script"
import Link from "next/link"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    AllpayPayment: any
  }
}

function PaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentUrl = searchParams.get("payment_url")
  const orderId = searchParams.get("order_id")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const allpayRef = useRef<any>(null)
  const iframeId = "allpay-payment-iframe"

  const initializeAllpay = () => {
    if (typeof window !== "undefined" && window.AllpayPayment && paymentUrl && !allpayRef.current) {
      try {
        // Initialize Allpay Hosted Fields
        allpayRef.current = new window.AllpayPayment({
          iframeId: iframeId,
          onSuccess: function () {
            // Redirect to success page
            router.push(`/payment/success?order_id=${orderId || ""}`)
          },
          onError: function (error_n: number, error_msg: string) {
            console.error("Payment error:", error_n, error_msg)
            setError(`Payment error: ${error_n} (${error_msg})`)
            setIsLoading(false)
          },
        })
        setIsLoading(false)
      } catch (err) {
        console.error("Error initializing Allpay:", err)
        setError("Failed to initialize payment form")
        setIsLoading(false)
      }
    }
  }

  // Try to initialize if script is already loaded
  useEffect(() => {
    if (typeof window !== "undefined" && window.AllpayPayment) {
      initializeAllpay()
    }
  }, [paymentUrl, orderId])

  const handlePay = () => {
    if (allpayRef.current && typeof allpayRef.current.pay === "function") {
      allpayRef.current.pay()
    } else {
      setError("Payment system not ready. Please wait a moment and try again.")
    }
  }

  if (!paymentUrl) {
    return (
      <div className="min-h-screen bg-[#FFF0DC] flex items-center justify-center px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg border border-[#F0BB78]/20 p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-serif font-light text-[#543A14] mb-4">
              Payment Link Missing
            </h1>
            <p className="text-lg text-[#543A14]/70 mb-6">
              The payment link is missing. Please return to checkout.
            </p>
            <Button asChild className="bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#543A14] px-8 py-6 text-base font-medium">
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Load Allpay Hosted Fields script */}
      <Script
        src="https://allpay.to/js/allpay-hf.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Allpay script loaded")
          initializeAllpay()
        }}
        onError={() => {
          setError("Failed to load payment system")
          setIsLoading(false)
        }}
      />

      <div className="min-h-screen bg-[#FFF0DC] flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-[#F0BB78]/20 p-8 md:p-12">
            {/* Header */}
            <div className="mb-8 text-center">
              <Link
                href="/"
                className="text-2xl md:text-3xl font-serif text-[#543A14] uppercase tracking-wide inline-block mb-4 hover:opacity-80 transition-opacity"
              >
                RENDEZA
              </Link>
              <h1 className="text-3xl md:text-4xl font-serif font-light text-[#543A14] mb-2">
                Complete Your Payment
              </h1>
              <p className="text-lg text-[#543A14]/70">
                Enter your payment details securely below
              </p>
            </div>

            {/* Payment Form */}
            <div className="space-y-6">
              {/* Allpay iframe */}
              <div className="bg-[#FFF0DC]/30 rounded-lg border border-[#F0BB78]/30 p-6">
                <div className="mb-4">
                  <label className="text-sm font-medium text-[#543A14] mb-2 block">
                    Payment Details
                  </label>
                </div>
                <iframe
                  id={iframeId}
                  src={paymentUrl}
                  className="w-full h-[500px] border border-[#F0BB78]/30 rounded-md"
                  title="Payment form"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Pay Button */}
              <div className="pt-4">
                <Button
                  onClick={handlePay}
                  disabled={isLoading || !!error}
                  className="w-full bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#543A14] px-8 py-6 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Loading payment form..." : "Complete Payment"}
                </Button>
              </div>

              {/* Back link */}
              <div className="text-center pt-4">
                <Link
                  href="/"
                  className="text-sm text-[#543A14]/70 hover:text-[#543A14] transition-colors"
                >
                  Cancel and return to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF0DC] flex items-center justify-center px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg border border-[#F0BB78]/20 p-8 md:p-12">
              <p className="text-lg text-[#543A14]/70">Loading payment form...</p>
            </div>
          </div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  )
}

