import { Link } from 'react-router-dom'
import { SiteFooter, SiteHeader } from '../components/SiteChrome'
import { usePageMeta } from '../lib/seo'
import '../App.css'

const ownerBenefits = [
  'Property setup and furnishing strategy',
  'Listing positioning and pricing guidance',
  'Tenant communication and onboarding support',
  'Maintenance coordination and issue follow-up',
  'Monthly visibility on occupancy and performance',
  'Flexible furnished and unfurnished rental strategies',
]

const ownerProcess = [
  {
    step: '01',
    title: 'Property Review',
    description:
      'We assess the apartment, target tenant profile, furnishing needs, and the strongest positioning for the local market.',
  },
  {
    step: '02',
    title: 'Setup Plan',
    description:
      'We build a clear launch plan covering photos, furnishing, pricing, listing structure, and operational expectations.',
  },
  {
    step: '03',
    title: 'Launch and Operation',
    description:
      'The apartment goes live with a managed workflow for inquiries, visits, occupancy, and ongoing operational support.',
  },
]

const ownerFaqs = [
  {
    question: 'Can you help with both furnished and unfurnished apartments?',
    answer:
      'Yes. We support both strategies and help decide which setup fits the location, budget, and target tenant best.',
  },
  {
    question: 'Do I need to prepare the apartment before contacting you?',
    answer:
      'No. An empty apartment, a partially finished one, or an already occupied unit can all be reviewed and planned from where they are today.',
  },
  {
    question: 'Is this only for Paris?',
    answer:
      'Paris is the current core market, but the structure is designed to expand across more French and European cities.',
  },
]

export default function OwnersPage() {
  usePageMeta({
    title: 'Owners',
    description: 'Learn how EUROSTRY helps property owners launch, manage, and grow apartment performance.',
    path: '/owners',
  })

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0f172a_0%,#111827_55%,#f8fafc_55%,#f8fafc_100%)] font-sans text-zinc-900 antialiased">
      <SiteHeader />

      <main>
        <section className="px-6 py-20 text-white md:py-24">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                For Property Owners
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
                A dedicated owner journey,
                <span className="block bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  not just a landing page section
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                This page is built to explain how EUROSTRY works with owners in a
                more realistic way: strategy, setup, operations, and the practical
                steps of getting an apartment ready for the market.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  className="rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-4 text-sm font-medium text-white shadow-lg transition-all hover:shadow-emerald-500/25"
                  to="/contact"
                >
                  Request an Owner Consultation
                </Link>
                <Link
                  className="rounded-2xl border border-white/20 px-6 py-4 text-sm font-medium text-white transition hover:bg-white/10"
                  to="/apartments"
                >
                  View Example Apartments
                </Link>
              </div>
            </div>

            <div className="grid gap-5">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                <div className="text-sm uppercase tracking-[0.18em] text-slate-300">
                  Why Owners Use EUROSTRY
                </div>
                <div className="mt-5 grid gap-3">
                  {ownerBenefits.map((benefit) => (
                    <div className="flex items-center gap-3" key={benefit}>
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                        +
                      </span>
                      <span className="text-slate-100">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <MetricCard label="Target Response" value="48h" />
                <MetricCard label="Typical Setup" value="2-4 wks" />
                <MetricCard label="Modes Covered" value="Short + Long" />
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-3xl">
              <h2 className="text-3xl font-bold md:text-4xl">How the owner process works</h2>
              <p className="mt-4 text-lg text-zinc-600">
                This is the deeper version of the owner experience: assessment,
                operational setup, and launch support in a structured sequence.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {ownerProcess.map((item) => (
                <div
                  className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm"
                  key={item.step}
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
                    Step {item.step}
                  </div>
                  <h3 className="mt-4 text-2xl font-bold">{item.title}</h3>
                  <p className="mt-4 leading-7 text-zinc-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-6 py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl bg-slate-950 p-8 text-white">
              <h2 className="text-3xl font-bold">What owners usually need help with</h2>
              <div className="mt-6 space-y-4 text-slate-300">
                <p>Choosing furnished vs unfurnished strategy</p>
                <p>Getting the apartment photo-ready and market-ready</p>
                <p>Positioning the rent correctly for the neighborhood</p>
                <p>Handling visits, inquiries, and tenant communication</p>
                <p>Coordinating maintenance without losing responsiveness</p>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8">
              <h2 className="text-3xl font-bold">Owner FAQ</h2>
              <div className="mt-6 space-y-4">
                {ownerFaqs.map((faq) => (
                  <div className="rounded-2xl border border-zinc-200 bg-white p-5" key={faq.question}>
                    <h3 className="font-semibold">{faq.question}</h3>
                    <p className="mt-3 leading-7 text-zinc-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-white backdrop-blur-sm">
      <div className="text-3xl font-bold">{value}</div>
      <div className="mt-2 text-sm text-slate-300">{label}</div>
    </div>
  )
}
