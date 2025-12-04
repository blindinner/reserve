export function Footer() {
  return (
    <footer className="border-t border-[#F0BB78]/30 py-12 px-6 md:px-12 lg:px-20 bg-[#FFF0DC]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-light tracking-wider mb-2 text-[#543A14]">Rendeza</h3>
            <p className="text-[#543A14]/75">Personalized dining experiences for discerning professionals</p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-6 text-sm text-[#543A14]/80">
              <a href="#" className="hover:text-[#543A14] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-[#543A14] transition-colors">
                Terms of Service
              </a>
              <a href="#contact" className="hover:text-[#543A14] transition-colors">
                Contact
              </a>
            </div>
            <p className="text-sm text-[#543A14]/70">© {new Date().getFullYear()} Rendeza. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
