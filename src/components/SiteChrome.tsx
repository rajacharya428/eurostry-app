import { Link } from 'react-router-dom'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link className="flex items-center gap-3" to="/">
          <img alt="EUROSTRY logo" className="h-12 w-auto md:h-14" src="/eurostry-logo.png" />
          <span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-xl font-bold tracking-tight text-transparent">
            EUROSTRY
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-zinc-700">
          <NavLink label="Home" to="/" />
          <NavLink label="Apartments" to="/apartments" />
          <NavLink label="Owners" to="/owners" />
          <NavLink label="Contact" to="/contact" />
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-zinc-900 px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <img alt="EUROSTRY logo" className="h-12 w-auto md:h-14" src="/eurostry-logo.png" />
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                EUROSTRY
              </span>
            </div>
            <p className="mt-4 max-w-md text-zinc-400">
              Smart rental and property management platform connecting owners,
              tenants, and investors across Europe.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Quick Links</h4>
            <div className="space-y-3 text-zinc-400">
              <FooterLink label="Home" to="/" />
              <FooterLink label="Apartments" to="/apartments" />
              <FooterLink label="For Owners" to="/owners" />
              <FooterLink label="Contact" to="/contact" />
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Legal</h4>
            <div className="space-y-3 text-zinc-400">
              <FooterLink label="Privacy Policy" to="/privacy" />
              <FooterLink label="Terms of Service" to="/terms" />
              <FooterLink label="Cookie Policy" to="/cookies" />
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-zinc-800 pt-8 text-sm text-zinc-500">
          Copyright EUROSTRY 2026. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

function NavLink({ label, to }: { label: string; to: string }) {
  return (
    <Link
      className="rounded-full border border-zinc-200 px-4 py-2 transition-all hover:border-zinc-400 hover:text-zinc-950"
      to={to}
    >
      {label}
    </Link>
  )
}

function FooterLink({ label, to }: { label: string; to: string }) {
  return (
    <Link className="block transition-colors hover:text-white" to={to}>
      {label}
    </Link>
  )
}
