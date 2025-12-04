import { Hero } from "@/components/hero"
import { WhyWeDoThis } from "@/components/why-we-do-this"
import { HowItWorks } from "@/components/how-it-works"
import { ContactForm } from "@/components/contact-form"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <WhyWeDoThis />
      <HowItWorks />
      <ContactForm />
      <Footer />
    </main>
  )
}
