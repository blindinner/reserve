import { Hero } from "@/components/hero"
import { WhyWeDoThis } from "@/components/why-we-do-this"
import { HowItWorks } from "@/components/how-it-works"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <WhyWeDoThis />
      <HowItWorks />
      <Footer />
    </main>
  )
}
