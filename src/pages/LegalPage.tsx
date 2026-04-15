import { SiteFooter, SiteHeader } from '../components/SiteChrome'
import { usePageMeta } from '../lib/seo'

const legalContent = {
  privacy: {
    title: 'Privacy Policy',
    description: 'How EUROSTRY collects, uses, and protects personal information on the website and admin tools.',
    sections: [
      {
        heading: 'What We Collect',
        body:
          'We collect information you submit through account registration, apartment inquiries, contact forms, and admin operations. This can include your name, email, phone number, session information, and apartment interest data.',
      },
      {
        heading: 'How We Use It',
        body:
          'We use this information to authenticate accounts, respond to inquiries, manage apartment listings, and operate the platform. Internal analytics such as apartment opens and contact clicks are used to improve listing performance and follow-up workflows.',
      },
      {
        heading: 'Storage and Security',
        body:
          'Data is stored in a PostgreSQL database and protected through password hashing and session cookies. Uploaded media and outbound email notifications may rely on external infrastructure chosen by EUROSTRY during deployment.',
      },
      {
        heading: 'Your Rights',
        body:
          'Users can request access, correction, or deletion of their personal data. Before publishing, this page should be reviewed with your final legal and GDPR requirements.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    description: 'The terms that govern use of the EUROSTRY public site, apartment search experience, and account features.',
    sections: [
      {
        heading: 'Use of the Platform',
        body:
          'EUROSTRY provides apartment discovery, owner services information, and account-based features for leads and operational workflows. Users agree to provide accurate information when contacting or registering.',
      },
      {
        heading: 'Listings and Availability',
        body:
          'Apartment listings, prices, availability, and transport information are provided for informational purposes and may change. Submission of an inquiry or booking request does not create a tenancy or reservation agreement by itself.',
      },
      {
        heading: 'Accounts and Access',
        body:
          'Registered users are responsible for maintaining the confidentiality of their login credentials. Administrative and owner areas are restricted to authorized users only.',
      },
      {
        heading: 'Final Legal Review',
        body:
          'Before publishing, these terms should be reviewed and completed with your business entity details, governing law, and dispute resolution language.',
      },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    description: 'How EUROSTRY uses cookies and session storage to support login, security, and basic website functionality.',
    sections: [
      {
        heading: 'Essential Cookies',
        body:
          'EUROSTRY uses essential cookies to keep users signed in, protect authenticated routes, and maintain secure sessions for admin, owner, and tenant accounts.',
      },
      {
        heading: 'Operational Tracking',
        body:
          'The platform also records internal apartment activity such as property opens, contact clicks, and booking clicks to support operational analytics inside the admin dashboard.',
      },
      {
        heading: 'Third-Party Services',
        body:
          'Depending on your production setup, email providers, cloud media storage, analytics tools, or embedded maps may introduce additional cookies or external requests.',
      },
      {
        heading: 'Before Launch',
        body:
          'You should update this page with your final consent approach and any non-essential analytics or advertising tools you choose to install after deployment.',
      },
    ],
  },
} as const

type LegalVariant = keyof typeof legalContent

export default function LegalPage({ variant }: { variant: LegalVariant }) {
  const content = legalContent[variant]

  usePageMeta({
    title: content.title,
    description: content.description,
    path: `/${variant}`,
  })

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef4f8_100%)] font-sans text-zinc-900 antialiased">
      <SiteHeader />
      <main className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-10">
            <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Legal
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">{content.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600 md:text-lg">
              {content.description}
            </p>
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-800">
              This legal content is a production-ready draft structure, not legal advice. Before publishing,
              replace placeholders and review it with your lawyer or compliance advisor.
            </div>

            <div className="mt-10 space-y-8">
              {content.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">{section.heading}</h2>
                  <p className="mt-3 text-base leading-7 text-zinc-700">{section.body}</p>
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
