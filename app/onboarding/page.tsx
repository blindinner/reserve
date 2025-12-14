import { Suspense } from "react"
import { OnboardingForm } from "@/components/onboarding-form"

function OnboardingContent() {
  return <OnboardingForm />
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#FFF0DC]">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <OnboardingContent />
      </Suspense>
    </div>
  )
}

