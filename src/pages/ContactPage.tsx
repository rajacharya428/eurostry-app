import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SiteFooter, SiteHeader } from '../components/SiteChrome'
import { parseTransportDetails, TransportBadge } from '../components/TransportBadge'
import { usePageMeta } from '../lib/seo'
import '../App.css'

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000')

type ContactForm = {
  name: string
  email: string
  phone: string
  message: string
  requestedStartDate: string
  requestedEndDate: string
}

type PropertyDetails = {
  id: string
  slug: string
  title: string
  location: string
  mapQuery?: string | null
  transportDetails?: string | null
  description: string
  amenities: string[]
  images: { url: string }[]
  priceCents: number
  rentalType: 'SHORT_TERM' | 'LONG_TERM'
}

const contactReasons = [
  'Ask about apartment availability',
  'Request owner consultation',
  'Discuss furnished vs unfurnished strategy',
  'Plan a relocation or rental search',
]

function buildMapEmbedUrl(location: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=15&output=embed`
}


async function readJsonResponse<T>(response: Response) {
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export default function ContactPage() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    message: '',
    requestedStartDate: '',
    requestedEndDate: '',
  })
  const [status, setStatus] = useState<'success' | 'error' | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null)

  const propertyId = searchParams.get('propertyId') ?? ''
  const propertySlug = searchParams.get('propertySlug') ?? ''
  const propertyTitle = searchParams.get('propertyTitle') ?? ''
  const propertyLocation = searchParams.get('propertyLocation') ?? ''
  const propertyImage = searchParams.get('propertyImage') ?? ''
  const propertyPrice = searchParams.get('propertyPrice') ?? ''
  const propertyRentalType = searchParams.get('propertyRentalType') ?? ''
  const propertyMapQuery = searchParams.get('propertyMapQuery') ?? ''
  const propertyTransportDetails = searchParams.get('propertyTransportDetails') ?? ''
  const intent = searchParams.get('intent') === 'booking' ? 'booking' : 'contact'
  const hasPropertyInquiry = Boolean(propertyId || propertySlug)

  usePageMeta({
    title: hasPropertyInquiry ? `${intent === 'booking' ? 'Book' : 'Contact'} Apartment` : 'Contact',
    description: hasPropertyInquiry
      ? 'Send an apartment-specific inquiry or booking request through EUROSTRY.'
      : 'Contact EUROSTRY for apartment search, owner services, or relocation support.',
    path: hasPropertyInquiry ? `/contact?propertySlug=${propertySlug}` : '/contact',
  })

  useEffect(() => {
    if (!hasPropertyInquiry || !propertySlug) {
      return
    }

    void (async () => {
      const response = await fetch(`${API_BASE_URL}/api/properties/${propertySlug}`).catch(() => null)
      if (!response?.ok) {
        return
      }

      const data = await readJsonResponse<{ property?: PropertyDetails }>(response)
      if (data?.property) {
        setPropertyDetails(data.property)
      }
    })()
  }, [hasPropertyInquiry, propertySlug])

  useEffect(() => {
    if (!hasPropertyInquiry) {
      return
    }

    setForm((current) => {
      if (current.message.trim()) {
        return current
      }

      return {
        ...current,
        message:
          intent === 'booking'
            ? `I would like to book ${propertyDetails?.title ?? propertyTitle}. Please share the next steps and availability.`
            : `I am interested in ${propertyDetails?.title ?? propertyTitle}. Please contact me with more details.`,
      }
    })
  }, [hasPropertyInquiry, intent, propertyDetails?.title, propertyTitle])

  const activeProperty = propertyDetails ?? {
    id: propertyId,
    slug: propertySlug,
    title: propertyTitle,
    location: propertyLocation,
    mapQuery: propertyMapQuery,
    transportDetails: propertyTransportDetails,
    description: '',
    amenities: [],
    images: propertyImage ? [{ url: propertyImage }] : [],
    priceCents: propertyPrice ? Number(propertyPrice) * 100 : 0,
    rentalType: propertyRentalType === 'short' ? 'SHORT_TERM' : 'LONG_TERM',
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setStatus(null)

    try {
      const endpoint = hasPropertyInquiry ? `${API_BASE_URL}/api/inquiries` : `${API_BASE_URL}/api/contact`
      const payload = hasPropertyInquiry
        ? {
            propertyId: propertyId || undefined,
            propertySlug: propertySlug || undefined,
            name: form.name,
            email: form.email,
            phone: form.phone || undefined,
            message: form.message,
            type: intent === 'booking' ? 'BOOKING_REQUEST' : 'PROPERTY_CONTACT',
            requestedStartDate: form.requestedStartDate || undefined,
            requestedEndDate: form.requestedEndDate || undefined,
          }
        : {
            name: form.name,
            email: form.email,
            phone: form.phone,
            message: form.message,
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setForm({
        name: '',
        email: '',
        phone: '',
        message: hasPropertyInquiry
          ? intent === 'booking'
            ? `I would like to book ${activeProperty.title}. Please share the next steps and availability.`
            : `I am interested in ${activeProperty.title}. Please contact me with more details.`
          : '',
        requestedStartDate: '',
        requestedEndDate: '',
      })
      setStatus('success')
    } catch {
      setStatus('error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={`min-h-screen font-sans text-zinc-900 antialiased ${
        hasPropertyInquiry
          ? 'bg-[linear-gradient(180deg,#0f172a_0%,#111827_58%,#f8fafc_58%,#f8fafc_100%)]'
          : 'bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_32%,#f8fafc_100%)]'
      }`}
    >
      <SiteHeader />

      <main className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          {hasPropertyInquiry ? (
            <>
              <div>
                  <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                    {intent === 'booking' ? 'Booking Request' : 'Apartment Contact'}
                  </div>
                  <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-5xl">
                    {intent === 'booking'
                      ? 'Book this apartment with a dedicated request form'
                      : 'Contact us about this apartment'}
                  </h1>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                    This page is linked to the selected apartment, so your message,
                    requested dates, and apartment reference stay together in one lead.
                  </p>

                  <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-sm">
                    {activeProperty.images[0]?.url ? (
                      <img
                        alt={activeProperty.title}
                        className="h-80 w-full object-cover"
                        src={activeProperty.images[0].url}
                      />
                    ) : null}
                    <div className="p-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            intent === 'booking'
                              ? 'bg-cyan-500 text-white'
                              : 'bg-emerald-500 text-white'
                          }`}
                        >
                          {intent === 'booking' ? 'Booking flow' : 'Contact flow'}
                        </span>
                        <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-slate-200">
                          {activeProperty.rentalType === 'SHORT_TERM' ? 'Short Term' : 'Long Term'}
                        </span>
                      </div>
                      <div className="mt-4 text-3xl font-bold text-white">{activeProperty.title}</div>
                      <div className="mt-2 text-slate-300">{activeProperty.location}</div>
                      <div className="mt-3 text-lg font-semibold text-cyan-300">
                        {Math.round(activeProperty.priceCents / 100)} EUR{' '}
                        {activeProperty.rentalType === 'SHORT_TERM' ? '/ night' : '/ month'}
                      </div>

                      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                        <InfoLine dark label="Apartment ID" value={activeProperty.id || 'Not provided'} />
                        <InfoLine dark label="Apartment Slug" value={activeProperty.slug || 'Not provided'} />
                      </div>
                    </div>
                  </div>
              </div>

              <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1fr]">
                <form className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm" onSubmit={handleSubmit}>
                  <h2 className="text-2xl font-bold">
                    {intent === 'booking' ? 'Send booking request' : 'Send apartment inquiry'}
                  </h2>
                  <p className="mt-3 text-zinc-600">
                    This form is already linked to the apartment shown on this page.
                  </p>

                  <div className="mt-6 grid gap-5">
                    <Field label="Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
                    <Field label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
                    <Field label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
                    <div className="grid gap-5 md:grid-cols-2">
                      <Field
                        label={intent === 'booking' ? 'Preferred start date' : 'Preferred move-in date'}
                        type="date"
                        value={form.requestedStartDate}
                        onChange={(value) => setForm((current) => ({ ...current, requestedStartDate: value }))}
                      />
                      <Field
                        label={intent === 'booking' ? 'Preferred end date' : 'Preferred end date'}
                        required={intent === 'booking'}
                        type="date"
                        value={form.requestedEndDate}
                        onChange={(value) => setForm((current) => ({ ...current, requestedEndDate: value }))}
                      />
                    </div>
                    <TextAreaField
                      label="Message"
                      value={form.message}
                      onChange={(value) => setForm((current) => ({ ...current, message: value }))}
                      placeholder="Tell us your timeline, availability questions, and the details you want to confirm."
                    />
                  </div>

                  <button
                    className={`mt-6 w-full rounded-xl py-4 font-medium text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 ${
                      intent === 'booking'
                        ? 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:shadow-cyan-500/25'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-emerald-500/25'
                    }`}
                    disabled={submitting}
                    type="submit"
                  >
                    {submitting ? 'Sending...' : intent === 'booking' ? 'Send Booking Request' : 'Send Apartment Inquiry'}
                  </button>

                  {status === 'success' ? (
                    <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-center text-emerald-700">
                      Inquiry sent successfully. The apartment reference was included.
                    </div>
                  ) : null}
                  {status === 'error' ? (
                    <div className="mt-4 rounded-xl bg-red-50 p-4 text-center text-red-700">
                      Failed to send your message. Check that the backend is running.
                    </div>
                  ) : null}
                </form>

                <div className="rounded-3xl bg-slate-950 p-8 text-white">
                  <h2 className="text-2xl font-bold">Apartment details</h2>
                  {activeProperty.description ? (
                    <p className="mt-4 leading-7 text-slate-300">{activeProperty.description}</p>
                  ) : null}

                  {activeProperty.images.length > 0 ? (
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {activeProperty.images.map((image, index) => (
                        <img
                          alt={`${activeProperty.title} photo ${index + 1}`}
                          className="h-40 w-full rounded-2xl object-cover"
                          key={`${image.url}-${index}`}
                          src={image.url}
                        />
                      ))}
                    </div>
                  ) : null}

                  {activeProperty.amenities.length > 0 ? (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold">Amenities</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activeProperty.amenities.map((amenity) => (
                          <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-slate-200" key={amenity}>
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-8 overflow-hidden rounded-3xl border border-white/10">
                    <iframe
                      className="h-72 w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={buildMapEmbedUrl(activeProperty.mapQuery ?? activeProperty.location)}
                      title="Apartment location map"
                    />
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-semibold">Nearby transportation</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {parseTransportDetails(activeProperty.transportDetails).length > 0 ? (
                        parseTransportDetails(activeProperty.transportDetails).map((item) => (
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-5" key={item.id}>
                            <div className="flex items-center gap-3">
                              <TransportBadge title={item.title} />
                              <div className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300">
                                {item.title}
                              </div>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                          <div className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300">
                            Transport details
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-300">
                            No transport details added yet for this apartment.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
                <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
                  Contact EUROSTRY
                </div>
                <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
                  Simple contact details and one clear form
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">
                  Use this page for owner questions, relocation requests, or general contact.
                </p>

                <div className="mt-8 space-y-4 text-zinc-700">
                  <p><span className="font-semibold">Email:</span> contact@eurostrygroup.com</p>
                  <p><span className="font-semibold">Phone:</span> +33 1 23 45 67 89</p>
                  <p><span className="font-semibold">Address:</span> 122 Avenue Daumesnil, 75012 Paris</p>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {contactReasons.map((reason) => (
                    <div className="rounded-2xl bg-zinc-50 p-4 text-sm font-medium text-zinc-700" key={reason}>
                      {reason}
                    </div>
                  ))}
                </div>
              </div>

              <form className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm" onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold">Send a Message</h2>
                <p className="mt-3 text-zinc-600">
                  Share the essential details and we can respond with the right next step.
                </p>

                <div className="mt-6 grid gap-5">
                  <Field label="Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
                  <Field label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
                  <Field label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
                  <TextAreaField
                    label="Message"
                    value={form.message}
                    onChange={(value) => setForm((current) => ({ ...current, message: value }))}
                    placeholder="Tell us what you need and your preferred timeline."
                  />
                </div>

                <button
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-4 font-medium text-white transition-all hover:shadow-lg hover:shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={submitting}
                  type="submit"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>

                {status === 'success' ? (
                  <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-center text-emerald-700">
                    Message sent successfully. We will get back to you soon.
                  </div>
                ) : null}
                {status === 'error' ? (
                  <div className="mt-4 rounded-xl bg-red-50 p-4 text-center text-red-700">
                    Failed to send your message. Check that the backend is running.
                  </div>
                ) : null}
              </form>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function Field({
  label,
  onChange,
  placeholder,
  required = true,
  type = 'text',
  value,
}: {
  label: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  type?: string
  value: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700">{label}</label>
      <input
        className="w-full rounded-xl border border-zinc-200 p-4 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </div>
  )
}

function TextAreaField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700">{label}</label>
      <textarea
        className="min-h-36 w-full resize-none rounded-xl border border-zinc-200 p-4 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
        value={value}
      />
    </div>
  )
}

function InfoLine({
  dark = false,
  label,
  value,
}: {
  dark?: boolean
  label: string
  value: string
}) {
  return (
    <div className={`rounded-2xl p-4 ${dark ? 'bg-white/5' : 'bg-zinc-50'}`}>
      <div className={`text-xs font-semibold uppercase tracking-[0.16em] ${dark ? 'text-slate-400' : 'text-zinc-500'}`}>
        {label}
      </div>
      <div className={`mt-2 break-all font-medium ${dark ? 'text-white' : 'text-zinc-800'}`}>{value}</div>
    </div>
  )
}
