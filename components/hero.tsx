import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/luxury-fine-dining-restaurant-interior-elegant-amb.jpg"
          alt="Elegant restaurant interior"
          fill
          priority
          quality={90}
          className="object-cover animate-subtle-zoom"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/65" />
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-8 md:px-12 lg:px-20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white uppercase tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            RENDEZA
          </h1>
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              href="/#why"
              className="text-white/90 hover:text-white text-sm md:text-base font-light transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
            >
              Why
            </Link>
            <Link
              href="/#how"
              className="text-white/90 hover:text-white text-sm md:text-base font-light transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
            >
              How
            </Link>
            <Button
              size="sm"
              className="bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#543A14] px-4 md:px-6 py-2 text-sm font-medium tracking-wide shadow-lg"
              asChild
            >
              <Link href="/free-trial">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 px-6 md:px-12 text-center max-w-5xl mx-auto">
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light text-white mb-6 leading-[1.1] tracking-tight text-balance drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          Quality Time, On Automatic
        </h2>
        <p className="text-lg md:text-xl text-white mb-12 leading-relaxed max-w-3xl mx-auto font-light text-pretty drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          The subscription service for automatic reservations with the people you love. We handle the planning. You show up for the moments.
        </p>
        <Button
          size="sm"
          className="bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#543A14] px-8 py-5 text-sm font-medium tracking-wide"
          asChild
        >
          <Link href="/free-trial">Begin Your Experience</Link>
        </Button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 border border-white/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
