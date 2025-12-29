"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Script from "next/script"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

// Declare AllpayPayment type
declare global {
    interface Window {
        AllpayPayment: any
    }
}

export function CheckoutContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [orderData, setOrderData] = useState<any>(null)
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
    const allpayRef = useRef<any>(null)
    const iframeId = "allpay-payment-iframe-checkout"

    // Load order data from localStorage (set by forms before redirecting)
    useEffect(() => {
        const storedOrderData = localStorage.getItem("checkout_order_data")
        if (storedOrderData) {
            try {
                const data = JSON.parse(storedOrderData)
                setOrderData(data)
                // Create payment with the stored data
                createPayment(data)
            } catch (error) {
                console.error("Error parsing order data:", error)
                setSubmitStatus("error")
                setIsLoading(false)
            }
        } else {
            // No order data found, redirect back
            router.push("/")
        }
    }, [])

    const createPayment = async (data: any) => {
        try {
            setIsLoading(true)
            const response = await fetch("/api/allpay/create-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderId: data.orderId,
                    plan: data.plan,
                    billingFrequency: data.billingFrequency,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                    amount: data.amount,
                }),
            })

            const paymentData = await response.json()

            if (!response.ok) {
                console.error("Payment API Error:", paymentData)
                throw new Error(paymentData.error || "Failed to create payment")
            }

            if (paymentData.paymentUrl) {
                setPaymentUrl(paymentData.paymentUrl)
            } else {
                throw new Error("No payment URL received")
            }
        } catch (error) {
            console.error("Error creating payment:", error)
            setSubmitStatus("error")
        } finally {
            setIsLoading(false)
        }
    }

    // Initialize Allpay when payment URL is ready
    useEffect(() => {
        if (paymentUrl && typeof window !== "undefined" && window.AllpayPayment && !allpayRef.current) {
            try {
                allpayRef.current = new window.AllpayPayment({
                    iframeId: iframeId,
                    onSuccess: function () {
                        // Clear stored order data
                        localStorage.removeItem("checkout_order_data")
                        router.push(`/payment/success?order_id=${orderData?.orderId || ""}`)
                    },
                    onError: function (error_n: number, error_msg: string) {
                        console.error("Payment error:", error_n, error_msg)
                        setSubmitStatus("error")
                    },
                })
            } catch (err) {
                console.error("Error initializing Allpay:", err)
                setSubmitStatus("error")
            }
        }
    }, [paymentUrl, orderData, router])

    // Pricing calculations
    const planPricing = {
        weekly: { monthly: 0.01, annual: 0.12 },
        biweekly: { monthly: 25, annual: 250 },
    }

    const getCurrentPrice = (plan: string) => {
        if (plan === "weekly" || plan === "biweekly") {
            return orderData?.billingFrequency === "monthly"
                ? planPricing[plan as "weekly" | "biweekly"].monthly
                : planPricing[plan as "weekly" | "biweekly"].annual
        }
        return 0
    }

    const getMonthlyEquivalent = (plan: string) => {
        if (plan === "weekly" || plan === "biweekly") {
            if (orderData?.billingFrequency === "annual") {
                return Math.round(planPricing[plan as "weekly" | "biweekly"].annual / 12)
            }
        }
        return planPricing[plan as "weekly" | "biweekly"]?.monthly || 0
    }

    const getSavings = (plan: string) => {
        if (plan === "weekly" || plan === "biweekly") {
            if (orderData?.billingFrequency === "annual") {
                const monthlyTotal = planPricing[plan as "weekly" | "biweekly"].monthly * 12
                const annualPrice = planPricing[plan as "weekly" | "biweekly"].annual
                return monthlyTotal - annualPrice
            }
        }
        return 0
    }

    const planLabels: Record<string, string> = {
        weekly: "Weekly",
        biweekly: "Biweekly",
        business: "Business",
    }

    const planLabel = orderData?.plan ? planLabels[orderData.plan] || orderData.plan : ""

    if (!orderData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[#543A14] mb-4">Loading checkout...</p>
                </div>
            </div>
        )
    }

    const amount = orderData.amount || getCurrentPrice(orderData.plan)
    const savings = getSavings(orderData.plan)
    const monthlyEquivalent = getMonthlyEquivalent(orderData.plan)

    return (
        <>
            {/* Load Allpay Hosted Fields script */}
            <Script
                src="https://allpay.to/js/allpay-hf.js"
                strategy="afterInteractive"
                onLoad={() => {
                    if (paymentUrl && typeof window !== "undefined" && window.AllpayPayment && !allpayRef.current) {
                        try {
                            allpayRef.current = new window.AllpayPayment({
                                iframeId: iframeId,
                                onSuccess: function () {
                                    localStorage.removeItem("checkout_order_data")
                                    router.push(`/payment/success?order_id=${orderData?.orderId || ""}`)
                                },
                                onError: function (error_n: number, error_msg: string) {
                                    console.error("Payment error:", error_n, error_msg)
                                    setSubmitStatus("error")
                                },
                            })
                        } catch (err) {
                            console.error("Error initializing Allpay:", err)
                        }
                    }
                }}
            />

            <div className="min-h-screen bg-[#FFF0DC] py-8 px-4 md:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/"
                            className="text-2xl md:text-3xl font-serif text-[#543A14] uppercase tracking-wide inline-block mb-4 hover:opacity-80 transition-opacity"
                        >
                            RENDEZA
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-serif font-light text-[#543A14] mb-2">
                            Complete Your Purchase
                        </h1>
                        <p className="text-base text-[#543A14]/70">
                            Review your order and complete payment
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                        {/* Left Column: Order Summary */}
                        <div className="order-2 lg:order-1">
                            <div className="bg-white rounded-xl shadow-lg border border-[#F0BB78]/20 p-6 md:p-8 h-full flex flex-col">
                                <h2 className="text-xl md:text-2xl font-serif font-light text-[#543A14] mb-2">
                                    Order Summary
                                </h2>
                                <p className="text-sm text-[#543A14]/70 mb-6">
                                    Review your subscription details
                                </p>

                                {/* Plan Summary */}
                                <div className="bg-[#FFF0DC]/50 rounded-lg border border-[#F0BB78]/30 p-5 mb-6">
                                    <h3 className="text-sm font-medium text-[#543A14] mb-4 uppercase tracking-wide">
                                        Your Plan
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#543A14]/70 text-sm">Plan</span>
                                            <span className="text-[#543A14] font-medium">{planLabel}</span>
                                        </div>
                                        {orderData.plan !== "business" && (
                                            <>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[#543A14]/70 text-sm">Billing</span>
                                                    <span className="text-[#543A14] font-medium text-sm">
                                                        {orderData.billingFrequency === "annual"
                                                            ? "Annual (2 months free)"
                                                            : "Monthly"}
                                                    </span>
                                                </div>
                                                {orderData.billingFrequency === "annual" && savings > 0 && (
                                                    <div className="flex justify-between items-center pt-2 border-t border-[#F0BB78]/20">
                                                        <span className="text-[#543A14]/70 text-sm">Monthly equivalent</span>
                                                        <span className="text-[#543A14] font-medium text-sm">
                                                            ${monthlyEquivalent}/month
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="bg-[#FFF0DC]/50 rounded-lg border border-[#F0BB78]/30 p-5">
                                    <h3 className="text-sm font-medium text-[#543A14] mb-4 uppercase tracking-wide">
                                        Price Breakdown
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-[#543A14]/70">Subscription</span>
                                            <span className="text-[#543A14] font-medium">
                                                ${amount}
                                                {orderData.billingFrequency === "monthly" ? "/month" : "/year"}
                                            </span>
                                        </div>
                                        {orderData.billingFrequency === "annual" && savings > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>You save</span>
                                                <span className="font-medium">${savings}</span>
                                            </div>
                                        )}
                                        {orderData.plan !== "business" && (
                                            <div className="pt-3 border-t border-[#F0BB78]/20">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[#543A14] font-medium">Total</span>
                                                    <span className="text-[#543A14] font-medium text-lg">
                                                        ${amount}
                                                        <span className="text-sm font-normal ml-1">
                                                            {orderData.billingFrequency === "monthly" ? "/month" : "/year"}
                                                        </span>
                                                    </span>
                                                </div>
                                                {orderData.plan !== "business" && (
                                                    <p className="text-xs text-[#543A14]/60 mt-2">
                                                        First month free
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Back Link */}
                                <div className="mt-6">
                                    <Link
                                        href="/"
                                        className="text-sm text-[#543A14]/70 hover:text-[#543A14] underline"
                                    >
                                        ← Back to home
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Payment Details */}
                        <div className="order-1 lg:order-2">
                            <div className="bg-white rounded-xl shadow-lg border border-[#F0BB78]/20 p-6 md:p-8 h-full flex flex-col">
                                <h2 className="text-xl md:text-2xl font-serif font-light text-[#543A14] mb-2">
                                    Payment Details
                                </h2>
                                <p className="text-sm text-[#543A14]/70 mb-6">
                                    Choose preferable payment option
                                </p>

                                <div className="flex-1 flex flex-col">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center flex-1">
                                            <div className="text-center">
                                                <div className="w-12 h-12 border-4 border-[#F0BB78] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                                <p className="text-[#543A14]/70">Loading payment form...</p>
                                            </div>
                                        </div>
                                    ) : paymentUrl ? (
                                        <>
                                            <div className="bg-white rounded-lg border border-[#F0BB78]/30 overflow-hidden shadow-sm mb-6">
                                                <iframe
                                                    id={iframeId}
                                                    src={paymentUrl}
                                                    className="w-full h-[200px] border-0"
                                                    title="Payment form"
                                                />
                                            </div>

                                            <div className="flex items-center justify-center mb-4">
                                                <p className="text-xs text-[#543A14]/60">
                                                    Powered by{" "}
                                                    <span className="font-medium text-[#543A14]">allpay</span>
                                                </p>
                                            </div>

                                            <Button
                                                onClick={() => {
                                                    if (allpayRef.current && typeof allpayRef.current.pay === "function") {
                                                        setIsSubmitting(true)
                                                        allpayRef.current.pay()
                                                    } else {
                                                        setSubmitStatus("error")
                                                        setTimeout(() => setSubmitStatus("idle"), 5000)
                                                    }
                                                }}
                                                disabled={isSubmitting}
                                                className="w-full bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#543A14] h-14 font-medium shadow-lg hover:shadow-xl transition-shadow text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? "Processing..." : `Pay $${amount} ${orderData.billingFrequency === "monthly" ? "/month" : "/year"}`}
                                            </Button>

                                            {submitStatus === "error" && (
                                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                                    <p className="text-red-800 font-medium text-sm">
                                                        Sorry, there was an error processing your payment. Please try again.
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center flex-1 flex items-center justify-center">
                                            <div>
                                                <p className="text-[#543A14]/70 mb-4">Unable to load payment form</p>
                                                <Button
                                                    onClick={() => router.push("/")}
                                                    variant="outline"
                                                    className="border-[#F0BB78]/50 text-[#543A14] hover:bg-[#F0BB78]/10"
                                                >
                                                    Return to Home
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

