export function WhyWeDoThis() {
  return (
    <section id="why" className="py-32 md:py-40 px-6 md:px-12 lg:px-20 bg-[#FFF0DC]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-24 md:mb-32">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-16 bg-[#543A14]/30"></div>
            <span className="text-sm tracking-[0.2em] uppercase text-[#543A14]/70 font-light">Purpose</span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-light mb-8 tracking-tight text-[#543A14] leading-[1.05]">
            Why We Do This
          </h2>
          <p className="text-xl md:text-2xl text-[#543A14]/80 max-w-2xl leading-relaxed font-light">
            Life moves fast, and sometimes it feels like there's never enough time for the people who matter most.
          </p>
        </div>

        {/* Main Content - Editorial Layout */}
        <div className="space-y-24 md:space-y-32">
          {/* First Paragraph */}
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-16">
              <div className="md:w-20 flex-shrink-0">
                <div className="text-6xl md:text-7xl font-extralight text-[#543A14]/8 tracking-tight leading-none">
                  01
                </div>
              </div>
              <div className="flex-1 md:pt-2">
                <p className="text-2xl md:text-3xl font-light mb-5 tracking-tight text-[#543A14] max-w-3xl">
                  That's why we created this service—to ensure you always have a moment reserved, every single week, 
                  at the same time and on the same day.
                </p>
                <p className="text-lg md:text-xl text-[#543A14]/75 leading-relaxed font-light max-w-2xl">
                  Picture every Monday at 8 PM, or whatever schedule works for you.
                </p>
              </div>
            </div>
          </div>

          {/* Second Paragraph */}
          <div className="relative">
            <div className="absolute -top-12 left-0 right-0 md:left-20 md:right-auto">
              <div className="h-px w-20 bg-[#543A14]/15"></div>
            </div>
            <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-16">
              <div className="md:w-20 flex-shrink-0">
                <div className="text-6xl md:text-7xl font-extralight text-[#543A14]/8 tracking-tight leading-none">
                  02
                </div>
              </div>
              <div className="flex-1 md:pt-2">
                <p className="text-2xl md:text-3xl font-light mb-5 tracking-tight text-[#543A14] max-w-3xl">
                  We know how easy it is to let weeks slip by without truly connecting with your spouse, your children, 
                  your family, or whoever holds that special place in your life.
                </p>
                <p className="text-lg md:text-xl text-[#543A14]/75 leading-relaxed font-light max-w-2xl">
                  By automatically reserving that time slot in your calendar, we remove the burden of planning and decision-making. 
                  The table is set. The reservation is confirmed. All you need to do is show up and be present.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Closing Statement - More Sophisticated */}
        <div className="mt-32 md:mt-40 pt-16 border-t border-[#543A14]/15">
          <div className="max-w-3xl">
            <p className="text-2xl md:text-3xl font-light leading-relaxed text-[#543A14]">
              <span className="italic">We're reserving a special time for you every week—so you're never disconnected from your loved ones.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

