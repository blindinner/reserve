const steps = [
  {
    number: "01",
    title: "Share Your Location",
    description: "Tell us where you are, and we'll curate the perfect dining experiences in your area.",
  },
  {
    number: "02",
    title: "Handpicked Selection",
    description: "We select from our exclusive collection of premier restaurants, each chosen for excellence.",
  },
  {
    number: "03",
    title: "Seamless Scheduling",
    description:
      "Your reservation automatically repeats—every Monday at 8:00 PM, for example—with calendar invites sent in advance.",
  },
  {
    number: "04",
    title: "Thoughtful Reminders",
    description: "We ensure you never miss a reservation with timely reminders before each dinner.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-32 md:py-40 px-6 md:px-12 lg:px-20 bg-[#543A14]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-24 md:mb-32">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-16 bg-[#F0BB78]/30"></div>
            <span className="text-sm tracking-[0.2em] uppercase text-[#F0BB78] font-light">Process</span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-light mb-8 tracking-tight text-[#FFF0DC] leading-[1.05]">
            How It Works
          </h2>
          <p className="text-xl md:text-2xl text-[#FFF0DC]/90 max-w-2xl leading-relaxed font-light">
            A concierge service designed for those who refuse to compromise on what truly matters.
          </p>
        </div>

        {/* Steps - More Editorial Layout */}
        <div className="space-y-24 md:space-y-32">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Elegant divider line */}
              {index > 0 && (
                <div className="absolute -top-12 left-0 right-0 md:left-20 md:right-auto">
                  <div className="h-px w-20 bg-[#F0BB78]/20"></div>
                </div>
              )}
              
              <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-16">
                {/* Number - Elegant positioning */}
                <div className="md:w-20 flex-shrink-0">
                  <div className="text-6xl md:text-7xl font-extralight text-[#FFF0DC]/10 tracking-tight leading-none">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 md:pt-2">
                  <h3 className="text-2xl md:text-3xl font-light mb-5 tracking-tight text-[#FFF0DC]">
                    {step.title}
                  </h3>
                  <p className="text-lg md:text-xl text-[#FFF0DC]/85 leading-relaxed font-light max-w-2xl">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Closing Statement - More Sophisticated */}
        <div className="mt-32 md:mt-40 pt-16 border-t border-[#F0BB78]/20">
          <div className="max-w-3xl">
            <p className="text-2xl md:text-3xl font-light leading-relaxed text-[#FFF0DC]">
              <span className="italic">Set it once, enjoy it forever.</span>
              <span className="block mt-4 text-xl text-[#FFF0DC]/80 font-light">
                Weekly, bi-weekly, or monthly—your table awaits on autopilot.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
