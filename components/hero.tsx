import { Button } from "@/components/ui/button"
import Image from "next/image"

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
        <div className="flex items-center justify-start max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-light tracking-[0.15em] text-white uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">Rendeza</h1>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 px-6 md:px-12 text-center max-w-5xl mx-auto">
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-6 leading-[1.1] tracking-tight text-balance drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          Your Table, Every Week
        </h2>
        <p className="text-lg md:text-xl text-white mb-12 leading-relaxed max-w-3xl mx-auto font-light text-pretty drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          An ongoing concierge service that secures your dedicated dining reservation—same day, same time—so you never
          have to think about it again.
        </p>
        <Button
          size="sm"
          className="bg-[#F0BB78] hover:bg-[#F0BB78]/90 text-[#543A14] px-8 py-5 text-sm font-medium tracking-wide"
          asChild
        >
          <a href="#contact">Begin Your Experience</a>
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
