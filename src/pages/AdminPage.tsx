import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { SiteFooter, SiteHeader } from '../components/SiteChrome'
import { usePageMeta } from '../lib/seo'

type AuthUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'OWNER' | 'TENANT'
}

type BackendProperty = {
  id: string
  slug: string
  title: string
  summary?: string | null
  description: string
  location: string
  mapQuery?: string | null
  transportDetails?: string | null
  city: string
  country: string
  bedrooms: number
  bathrooms: number
  squareMeters: number
  maxGuests?: number | null
  priceCents: number
  rentalType: 'SHORT_TERM' | 'LONG_TERM'
  furnishingStatus: 'FURNISHED' | 'UNFURNISHED'
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  available: boolean
  images: { url: string }[]
  amenities: string[]
  owner: { firstName: string; lastName: string; email: string }
  updatedAt: string
}

type Inquiry = {
  id: string
  name: string
  email: string
  phone?: string | null
  message: string
  type: 'PROPERTY_CONTACT' | 'BOOKING_REQUEST'
  status: 'NEW' | 'CONTACTED' | 'CLOSED'
  createdAt: string
  property: { title: string; slug: string }
}

type ContactMessage = {
  id: string
  name: string
  email: string
  phone?: string | null
  message: string
  createdAt: string
}

type PropertyEvent = {
  id: string
  eventType: 'PROPERTY_OPENED' | 'CONTACT_CLICKED' | 'BOOKING_CLICKED'
  page?: string | null
  createdAt: string
  property?: { title: string; slug: string } | null
}

type DashboardSummary = {
  propertyCount: number
  publishedCount: number
  draftCount: number
  archivedCount: number
  inquiryCount: number
  contactMessageCount: number
  propertyOpenedCount: number
  contactClickCount: number
  bookingClickCount: number
}

type DashboardResponse = {
  summary: DashboardSummary
  properties: BackendProperty[]
  inquiries: Inquiry[]
  contactMessages: ContactMessage[]
  recentEvents: PropertyEvent[]
}

type DashboardForm = {
  title: string
  slug: string
  summary: string
  description: string
  location: string
  mapQuery: string
  transportDetails: string
  city: string
  country: string
  bedrooms: string
  bathrooms: string
  squareMeters: string
  maxGuests: string
  price: string
  imageUrlsText: string
  amenities: string
  rentalType: 'SHORT_TERM' | 'LONG_TERM'
  furnishingStatus: 'FURNISHED' | 'UNFURNISHED'
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  available: boolean
}

const API_BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000')

const emptyForm: DashboardForm = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  location: '',
  mapQuery: '',
  transportDetails: '',
  city: '',
  country: 'France',
  bedrooms: '1',
  bathrooms: '1',
  squareMeters: '35',
  maxGuests: '2',
  price: '',
  imageUrlsText: '',
  amenities: '',
  rentalType: 'LONG_TERM',
  furnishingStatus: 'FURNISHED',
  status: 'DRAFT',
  available: true,
}

function parseImageUrls(value: string) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean)
}

function resolveAssetUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return API_BASE_URL ? `${API_BASE_URL}${url}` : url
}

function mapPropertyToForm(property: BackendProperty): DashboardForm {
  return {
    title: property.title,
    slug: property.slug,
    summary: property.summary ?? '',
    description: property.description,
    location: property.location,
    mapQuery: property.mapQuery ?? '',
    transportDetails: property.transportDetails ?? '',
    city: property.city,
    country: property.country,
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
    squareMeters: String(property.squareMeters),
    maxGuests: String(property.maxGuests ?? 1),
    price: String(Math.round(property.priceCents / 100)),
    imageUrlsText: property.images.map((image) => image.url).join('\n'),
    amenities: property.amenities.join(', '),
    rentalType: property.rentalType,
    furnishingStatus: property.furnishingStatus,
    status: property.status,
    available: property.available,
  }
}

async function readJsonResponse<T>(response: Response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

function validateAdminForm(form: DashboardForm) {
  if (form.title.trim().length < 3) return 'Title must be at least 3 characters.'
  if (!form.slug.trim()) return 'Slug is required.'
  if (!/^[a-z0-9-]+$/.test(form.slug.trim())) return 'Slug can only contain lowercase letters, numbers, and hyphens.'
  if (form.description.trim().length < 10) return 'Description must be at least 10 characters.'
  if (form.location.trim().length < 2) return 'Location is required.'
  if (form.city.trim().length < 2) return 'City is required.'
  if (form.country.trim().length < 2) return 'Country is required.'
  const invalidImageUrl = parseImageUrls(form.imageUrlsText).find(
    (url) => !(url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')),
  )
  if (invalidImageUrl) {
    return `Invalid image URL: ${invalidImageUrl}. Use http://, https://, or uploaded /uploads/... paths.`
  }
  return null
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString()
}

function formatEventLabel(eventType: PropertyEvent['eventType']) {
  if (eventType === 'PROPERTY_OPENED') return 'Apartment opened'
  if (eventType === 'CONTACT_CLICKED') return 'Contact clicked'
  return 'Booking clicked'
}

function percent(value: number, total: number) {
  if (!total) return 0
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)))
}

export default function AdminPage() {
  usePageMeta({
    title: 'Admin Dashboard',
    description: 'Internal EUROSTRY administration dashboard for apartment operations, leads, and analytics.',
    path: '/admin',
    robots: 'noindex,nofollow',
  })

  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [form, setForm] = useState<DashboardForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    void loadPage()
  }, [])

  const analytics = useMemo(() => {
    if (!data) return null
    const publicationTotal = data.summary.publishedCount + data.summary.draftCount + data.summary.archivedCount
    const directLeads = data.inquiries.filter((entry) => entry.type === 'PROPERTY_CONTACT').length
    const bookingLeads = data.inquiries.filter((entry) => entry.type === 'BOOKING_REQUEST').length
    const activityBars = [
      { label: 'Views', count: data.summary.propertyOpenedCount, tone: 'from-cyan-400 to-sky-500' },
      { label: 'Contacts', count: data.summary.contactClickCount, tone: 'from-emerald-400 to-teal-500' },
      { label: 'Bookings', count: data.summary.bookingClickCount, tone: 'from-amber-400 to-orange-500' },
      { label: 'Messages', count: data.summary.contactMessageCount, tone: 'from-fuchsia-400 to-violet-500' },
    ]

    return {
      publicationTotal,
      directLeads,
      bookingLeads,
      leadTotal: data.summary.inquiryCount + data.summary.contactMessageCount,
      publishedPercent: percent(data.summary.publishedCount, publicationTotal),
      contactRate: percent(data.summary.contactClickCount, Math.max(data.summary.propertyOpenedCount, 1)),
      bookingRate: percent(data.summary.bookingClickCount, Math.max(data.summary.propertyOpenedCount, 1)),
      activeProperties: data.properties.filter((property) => property.available).length,
      shortTermProperties: data.properties.filter((property) => property.rentalType === 'SHORT_TERM').length,
      longTermProperties: data.properties.filter((property) => property.rentalType === 'LONG_TERM').length,
      avgPrice:
        data.properties.length > 0
          ? Math.round(data.properties.reduce((sum, property) => sum + property.priceCents, 0) / data.properties.length / 100)
          : 0,
      recentProperties: [...data.properties].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4),
      activityBars,
      maxActivity: Math.max(...activityBars.map((item) => item.count), 1),
    }
  }, [data])

  async function loadPage() {
    setLoading(true)
    setError(null)
    try {
      const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' })
      if (!meResponse.ok) throw new Error('Login as admin or owner to open the admin page.')
      const meData = await readJsonResponse<{ user?: AuthUser }>(meResponse)
      if (!meData?.user || (meData.user.role !== 'ADMIN' && meData.user.role !== 'OWNER')) {
        throw new Error('This page is only available for admin and owner accounts.')
      }
      setAuthUser(meData.user)

      const dashboardResponse = await fetch(`${API_BASE_URL}/api/admin/dashboard`, { credentials: 'include' })
      const dashboardData = await readJsonResponse<DashboardResponse & { error?: string }>(dashboardResponse)
      if (!dashboardResponse.ok || !dashboardData?.summary) {
        throw new Error(dashboardData?.error ?? 'Failed to load admin dashboard.')
      }
      setData(dashboardData)
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Failed to load admin dashboard.')
    } finally {
      setLoading(false)
    }
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files?.length) return
    const formData = new FormData()
    for (const file of files) formData.append('files', file)
    setUploadingImages(true)
    setMessage(null)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/uploads`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const payload = await readJsonResponse<{ uploads?: { url: string }[]; error?: string }>(response)
      if (!response.ok || !payload?.uploads) throw new Error(payload?.error ?? 'Image upload failed')
      const merged = [...parseImageUrls(form.imageUrlsText), ...payload.uploads.map((item) => item.url)]
      setForm((current) => ({ ...current, imageUrlsText: merged.join('\n') }))
      setMessage('Images uploaded successfully.')
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Image upload failed')
    } finally {
      setUploadingImages(false)
      event.target.value = ''
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    const validationError = validateAdminForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim().toLowerCase(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      mapQuery: form.mapQuery.trim(),
      transportDetails: form.transportDetails.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      squareMeters: Number(form.squareMeters),
      maxGuests: Number(form.maxGuests),
      priceCents: Math.round(Number(form.price) * 100),
      currency: 'EUR',
      rentalType: form.rentalType,
      furnishingStatus: form.furnishingStatus,
      status: form.status,
      available: form.available,
      images: parseImageUrls(form.imageUrlsText).map((url, index) => ({ url, alt: form.title.trim(), sortOrder: index })),
      amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean),
    }

    try {
      const response = await fetch(
        editingSlug ? `${API_BASE_URL}/api/properties/${editingSlug}` : `${API_BASE_URL}/api/properties`,
        {
          method: editingSlug ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        },
      )
      const dataResponse = await readJsonResponse<{ error?: string }>(response)
      if (!response.ok) throw new Error(dataResponse?.error ?? 'Failed to save property')
      setMessage(editingSlug ? 'Property updated successfully.' : 'Property created successfully.')
      setEditingSlug(null)
      setForm(emptyForm)
      await loadPage()
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Failed to save property')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(property: BackendProperty) {
    const confirmed = window.confirm(`Delete "${property.title}"? This cannot be undone.`)
    if (!confirmed) return
    setDeletingSlug(property.slug)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/properties/${property.slug}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const payload = await readJsonResponse<{ error?: string }>(response)
      if (!response.ok) throw new Error(payload?.error ?? 'Failed to delete property')
      setMessage('Property deleted successfully.')
      if (editingSlug === property.slug) {
        setEditingSlug(null)
        setForm(emptyForm)
      }
      await loadPage()
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : 'Failed to delete property')
    } finally {
      setDeletingSlug(null)
    }
  }

  const suggestionIdeas = [
    'Add unread states and follow-up notes for each inquiry.',
    'Add apartment performance history by week.',
    'Add owner assignment and internal tags.',
    'Add CSV export for inquiries and contacts.',
    'Add alerts for high-traffic apartments with weak conversion.',
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#17355e_0%,#101828_28%,#eef4f8_29%,#f8fafc_100%)] font-sans text-zinc-900 antialiased">
      <SiteHeader />
      <main className="px-6 py-10 md:py-14">
        <div className="mx-auto max-w-7xl">
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white shadow-[0_40px_120px_rgba(15,23,42,0.45)]">
            <div className="grid gap-8 p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
              <div>
                <div className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                  {authUser?.role === 'ADMIN' ? 'Administration Dashboard' : 'Owner Operations Dashboard'}
                </div>
                <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
                  Watch listings, leads, and apartment performance from one control center
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                  The admin page now starts with analytics first, so you can understand what is
                  happening before going into edits.
                </p>
                {analytics ? (
                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <HeroStat label="Average price" value={`${analytics.avgPrice} EUR`} note="Current average listing price" />
                    <HeroStat label="Active listings" value={String(analytics.activeProperties)} note={`${analytics.shortTermProperties} short-term and ${analytics.longTermProperties} long-term`} />
                    <HeroStat label="Lead volume" value={String(analytics.leadTotal)} note={`${analytics.directLeads} contacts and ${analytics.bookingLeads} booking requests`} />
                  </div>
                ) : null}
              </div>

              {analytics ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <DarkCard eyebrow="Publication mix" title={`${analytics.publishedPercent}% live`} body="Visible inventory ratio on the public site.">
                    <RadialGauge label="Published" size={152} strokeWidth={12} tone="cyan" value={analytics.publishedPercent} />
                  </DarkCard>
                  <DarkCard eyebrow="Contact conversion" title={`${analytics.contactRate}% contact rate`} body="Apartment opens that become contact clicks.">
                    <RadialGauge label="Contact" size={152} strokeWidth={12} tone="emerald" value={analytics.contactRate} />
                  </DarkCard>
                </div>
              ) : null}
            </div>
          </section>

          {loading ? <Panel className="mt-10 text-center">Loading administration page...</Panel> : null}
          {!loading && error ? <Panel className="mt-10 text-center text-red-700">{error}</Panel> : null}

          {!loading && !error && data && analytics ? (
            <>
              <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricPanel accent="cyan" label="Managed apartments" value={String(data.summary.propertyCount)} meta={`${data.summary.publishedCount} published and ${data.summary.draftCount} draft`} />
                <MetricPanel accent="emerald" label="Client conversations" value={String(analytics.leadTotal)} meta={`${data.summary.inquiryCount} apartment inquiries and ${data.summary.contactMessageCount} contact messages`} />
                <MetricPanel accent="amber" label="Apartment opens" value={String(data.summary.propertyOpenedCount)} meta={`${data.summary.contactClickCount} contact clicks and ${data.summary.bookingClickCount} booking clicks`} />
                <MetricPanel accent="violet" label="Available now" value={String(analytics.activeProperties)} meta={`${data.summary.archivedCount} archived listings`} />
              </section>

              {message ? <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">{message}</div> : null}

              <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <Panel>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Analytics overview</div>
                      <h2 className="mt-2 text-2xl font-bold text-zinc-950">Performance at a glance</h2>
                    </div>
                    <div className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-600">
                      Signed in as {authUser ? `${authUser.firstName} ${authUser.lastName}` : '...'}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
                    <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <RadialSummaryCard label="Published" note={`${data.summary.publishedCount} live apartments`} tone="cyan" value={analytics.publishedPercent} />
                        <RadialSummaryCard label="Booking rate" note={`${data.summary.bookingClickCount} booking clicks`} tone="amber" value={analytics.bookingRate} />
                        <RadialSummaryCard label="Contact rate" note={`${data.summary.contactClickCount} contact clicks`} tone="emerald" value={analytics.contactRate} />
                        <RadialSummaryCard label="Lead intent" note={`${analytics.bookingLeads} booking requests`} tone="violet" value={percent(analytics.bookingLeads, Math.max(data.summary.inquiryCount, 1))} />
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-[1.75rem] border border-zinc-200 bg-zinc-50 p-6">
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Client engagement</div>
                        <div className="mt-5 space-y-5">
                          {analytics.activityBars.map((bar) => (
                            <BarMetric count={bar.count} key={bar.label} label={bar.label} maxValue={analytics.maxActivity} tone={bar.tone} />
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <CompactInsightCard label="Short-term mix" value={`${percent(analytics.shortTermProperties, Math.max(data.summary.propertyCount, 1))}%`} note={`${analytics.shortTermProperties} short-term apartments`} />
                        <CompactInsightCard label="Long-term mix" value={`${percent(analytics.longTermProperties, Math.max(data.summary.propertyCount, 1))}%`} note={`${analytics.longTermProperties} long-term apartments`} />
                      </div>
                    </div>
                  </div>
                </Panel>

                <Panel>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Recently updated</div>
                  <h2 className="mt-2 text-2xl font-bold text-zinc-950">Latest apartment updates</h2>
                  <div className="mt-6 space-y-4">
                    {analytics.recentProperties.map((property) => (
                      <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-4" key={property.id}>
                        <div className="flex items-start gap-4">
                          <img alt={property.title} className="h-20 w-20 rounded-2xl object-cover" src={resolveAssetUrl(property.images[0]?.url ?? '')} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="font-semibold text-zinc-950">{property.title}</div>
                              <Badge tone="slate" value={property.status} />
                            </div>
                            <div className="mt-1 text-sm text-zinc-500">{property.location}</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge tone="cyan" value={property.rentalType === 'SHORT_TERM' ? 'Short term' : 'Long term'} />
                              <Badge tone="emerald" value={property.available ? 'Available' : 'Unavailable'} />
                            </div>
                            <div className="mt-3 text-xs uppercase tracking-[0.2em] text-zinc-400">{formatDateTime(property.updatedAt)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </section>

              <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
                <Panel>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Apartment operations</div>
                      <h2 className="mt-2 text-2xl font-bold text-zinc-950">Property inventory</h2>
                    </div>
                    <button
                      className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium transition-all hover:border-zinc-400"
                      onClick={() => {
                        setEditingSlug(null)
                        setForm(emptyForm)
                        setMessage(null)
                        setError(null)
                      }}
                      type="button"
                    >
                      New apartment
                    </button>
                  </div>
                  <div className="mt-6 space-y-4">
                    {data.properties.map((property) => (
                      <div className="rounded-[1.5rem] border border-zinc-200 p-5" key={property.id}>
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="text-lg font-semibold text-zinc-950">{property.title}</div>
                              <Badge tone="slate" value={property.status} />
                            </div>
                            <div className="mt-1 text-sm text-zinc-500">{property.location}</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge tone="cyan" value={property.rentalType === 'SHORT_TERM' ? 'Short term' : 'Long term'} />
                              <Badge tone="emerald" value={property.available ? 'Available' : 'Unavailable'} />
                              <Badge tone="violet" value={`${Math.round(property.priceCents / 100)} EUR`} />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium transition-all hover:border-zinc-400"
                              onClick={() => {
                                setEditingSlug(property.slug)
                                setForm(mapPropertyToForm(property))
                                setMessage(null)
                                setError(null)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-all hover:border-red-300"
                              disabled={deletingSlug === property.slug}
                              onClick={() => handleDelete(property)}
                              type="button"
                            >
                              {deletingSlug === property.slug ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Apartment editor</div>
                      <h2 className="mt-2 text-2xl font-bold text-zinc-950">{editingSlug ? 'Edit apartment' : 'Insert new apartment'}</h2>
                    </div>
                    {editingSlug ? (
                      <button
                        className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium transition-all hover:border-zinc-400"
                        onClick={() => {
                          setEditingSlug(null)
                          setForm(emptyForm)
                        }}
                        type="button"
                      >
                        Cancel edit
                      </button>
                    ) : null}
                  </div>

                  <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <Field label="Title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value, slug: editingSlug ? current.slug : slugify(value) }))} />
                    <Field label="Slug" helperText={editingSlug ? 'You can edit the slug manually if needed.' : 'Auto-generated from the title. You can still adjust it.'} value={form.slug} onChange={(value) => setForm((current) => ({ ...current, slug: slugify(value) }))} />
                    <Field label="Summary" required={false} value={form.summary} onChange={(value) => setForm((current) => ({ ...current, summary: value }))} />
                    <TextAreaField label="Description" value={form.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Location" value={form.location} onChange={(value) => setForm((current) => ({ ...current, location: value }))} />
                      <Field label="Exact Map Location" required={false} value={form.mapQuery} onChange={(value) => setForm((current) => ({ ...current, mapQuery: value }))} />
                      <Field label="City" value={form.city} onChange={(value) => setForm((current) => ({ ...current, city: value }))} />
                      <Field label="Country" value={form.country} onChange={(value) => setForm((current) => ({ ...current, country: value }))} />
                      <Field label="Bedrooms" type="number" value={form.bedrooms} onChange={(value) => setForm((current) => ({ ...current, bedrooms: value }))} />
                      <Field label="Bathrooms" type="number" value={form.bathrooms} onChange={(value) => setForm((current) => ({ ...current, bathrooms: value }))} />
                      <Field label="Surface Area (m2)" type="number" value={form.squareMeters} onChange={(value) => setForm((current) => ({ ...current, squareMeters: value }))} />
                      <Field label="Max Guests" type="number" value={form.maxGuests} onChange={(value) => setForm((current) => ({ ...current, maxGuests: value }))} />
                      <Field label="Price (EUR)" type="number" value={form.price} onChange={(value) => setForm((current) => ({ ...current, price: value }))} />
                    </div>

                    <TextAreaField
                      label="Nearby Transport Details"
                      helperText="Use one line per station or line, for example: Metro 1 Saint-Paul | 5 min walk"
                      required={false}
                      placeholder={'Metro 1 Saint-Paul | 5 min walk\nBus 29, 96 | 3 min walk\nChatelet-Les Halles RER | 14 min by metro'}
                      value={form.transportDetails}
                      onChange={(value) => setForm((current) => ({ ...current, transportDetails: value }))}
                    />

                    <div className="rounded-[1.5rem] border border-zinc-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-zinc-950">Apartment photos</h3>
                          <p className="mt-1 text-sm text-zinc-600">Upload from your computer or paste image URLs, one per line.</p>
                        </div>
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium transition-all hover:border-zinc-400">
                          <input accept="image/jpeg,image/png,image/webp" className="hidden" multiple onChange={handleImageUpload} type="file" />
                          {uploadingImages ? 'Uploading...' : 'Upload photos'}
                        </label>
                      </div>

                      <div className="mt-4">
                        <TextAreaField
                          label="Apartment Image URLs"
                          helperText="Use uploaded /uploads/... paths or full http:// / https:// image URLs."
                          required={false}
                          placeholder={'https://example.com/photo-1.jpg\nhttps://example.com/photo-2.jpg'}
                          value={form.imageUrlsText}
                          onChange={(value) => setForm((current) => ({ ...current, imageUrlsText: value }))}
                        />
                      </div>

                      {parseImageUrls(form.imageUrlsText).length > 0 ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {parseImageUrls(form.imageUrlsText).map((imageUrl, index) => (
                            <img alt={`Apartment preview ${index + 1}`} className="h-32 w-full rounded-2xl object-cover" key={`${imageUrl}-${index}`} src={resolveAssetUrl(imageUrl)} />
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <Field label="Amenities (comma separated)" required={false} value={form.amenities} onChange={(value) => setForm((current) => ({ ...current, amenities: value }))} />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField
                        label="Rental Type"
                        value={form.rentalType}
                        options={[{ label: 'Long Term', value: 'LONG_TERM' }, { label: 'Short Term', value: 'SHORT_TERM' }]}
                        onChange={(value) => setForm((current) => ({ ...current, rentalType: value as DashboardForm['rentalType'] }))}
                      />
                      <SelectField
                        label="Status"
                        value={form.status}
                        options={[{ label: 'Draft', value: 'DRAFT' }, { label: 'Published', value: 'PUBLISHED' }, { label: 'Archived', value: 'ARCHIVED' }]}
                        onChange={(value) => setForm((current) => ({ ...current, status: value as DashboardForm['status'] }))}
                      />
                      <SelectField
                        label="Furnishing"
                        value={form.furnishingStatus}
                        options={[{ label: 'Furnished', value: 'FURNISHED' }, { label: 'Unfurnished', value: 'UNFURNISHED' }]}
                        onChange={(value) => setForm((current) => ({ ...current, furnishingStatus: value as DashboardForm['furnishingStatus'] }))}
                      />
                      <CheckboxField checked={form.available} label="Available now" onChange={(checked) => setForm((current) => ({ ...current, available: checked }))} />
                    </div>

                    <button className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-4 font-medium text-white transition-all hover:shadow-lg hover:shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60" disabled={saving} type="submit">
                      {saving ? 'Saving...' : editingSlug ? 'Update apartment' : 'Create apartment'}
                    </button>
                  </form>
                </Panel>
              </section>

              <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
                <Panel>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Apartment messages</div>
                      <h2 className="mt-2 text-2xl font-bold text-zinc-950">Client inquiries</h2>
                    </div>
                    <Badge tone="violet" value={`${data.inquiries.length} total`} />
                  </div>
                  <div className="mt-6 space-y-4">
                    {data.inquiries.length === 0 ? <EmptyState value="No apartment inquiries yet." /> : data.inquiries.map((inquiry) => (
                      <div className="rounded-[1.5rem] border border-zinc-200 p-5" key={inquiry.id}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="font-semibold text-zinc-950">{inquiry.name}</div>
                          <div className="flex flex-wrap gap-2">
                            <Badge tone="slate" value={inquiry.status} />
                            <Badge tone={inquiry.type === 'BOOKING_REQUEST' ? 'amber' : 'emerald'} value={inquiry.type === 'BOOKING_REQUEST' ? 'Booking request' : 'Apartment contact'} />
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-zinc-500">{inquiry.email} {inquiry.phone ? ` / ${inquiry.phone}` : ''}</div>
                        <div className="mt-2 text-sm text-zinc-600">Apartment: {inquiry.property.title}</div>
                        <p className="mt-3 text-sm leading-6 text-zinc-700">{inquiry.message}</p>
                        <div className="mt-3 text-xs text-zinc-500">{formatDateTime(inquiry.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">General outreach</div>
                      <h2 className="mt-2 text-2xl font-bold text-zinc-950">Contact messages</h2>
                    </div>
                    <Badge tone="cyan" value={`${data.contactMessages.length} total`} />
                  </div>
                  <div className="mt-6 space-y-4">
                    {data.contactMessages.length === 0 ? <EmptyState value="No contact messages yet." /> : data.contactMessages.map((contact) => (
                      <div className="rounded-[1.5rem] border border-zinc-200 p-5" key={contact.id}>
                        <div className="font-semibold text-zinc-950">{contact.name}</div>
                        <div className="mt-2 text-sm text-zinc-500">{contact.email} {contact.phone ? ` / ${contact.phone}` : ''}</div>
                        <p className="mt-3 text-sm leading-6 text-zinc-700">{contact.message}</p>
                        <div className="mt-3 text-xs text-zinc-500">{formatDateTime(contact.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </section>

              <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.92fr]">
                <Panel>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">Live activity</div>
                      <h2 className="mt-2 text-2xl font-bold text-zinc-950">Recent client activity</h2>
                    </div>
                    <div className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-600">Notification feed</div>
                  </div>
                  <div className="mt-6 space-y-4">
                    {data.recentEvents.length === 0 ? <EmptyState value="No tracked activity yet." /> : data.recentEvents.map((activity) => (
                      <div className="flex items-start gap-4 rounded-[1.5rem] border border-zinc-200 p-5" key={activity.id}>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-xs font-semibold text-white">
                          {activity.eventType === 'PROPERTY_OPENED' ? 'Open' : activity.eventType === 'CONTACT_CLICKED' ? 'Lead' : 'Book'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="font-semibold text-zinc-950">{formatEventLabel(activity.eventType)}</div>
                            <Badge tone="cyan" value={activity.page ?? 'public site'} />
                          </div>
                          <div className="mt-2 text-sm text-zinc-600">{activity.property?.title ?? 'Unknown property'}</div>
                          <div className="mt-3 text-xs text-zinc-500">{formatDateTime(activity.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Next upgrades</div>
                  <h2 className="mt-2 text-2xl font-bold">Ideas to add next</h2>
                  <div className="mt-6 space-y-4">
                    {suggestionIdeas.map((idea) => (
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5" key={idea}>
                        {idea}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function Panel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] ${className}`.trim()}>
      {children}
    </div>
  )
}

function HeroStat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</div>
      <div className="mt-3 text-3xl font-bold text-white">{value}</div>
      <div className="mt-2 text-sm leading-6 text-slate-300">{note}</div>
    </div>
  )
}

function DarkCard({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string
  title: string
  body: string
  children: ReactNode
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</div>
      <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
      <div className="mt-4 flex justify-center">{children}</div>
    </div>
  )
}

function MetricPanel({
  accent,
  label,
  value,
  meta,
}: {
  accent: 'cyan' | 'emerald' | 'amber' | 'violet'
  label: string
  value: string
  meta: string
}) {
  const accentStyles =
    accent === 'emerald'
      ? 'from-emerald-400/20 to-teal-500/10 text-emerald-700'
      : accent === 'amber'
        ? 'from-amber-400/20 to-orange-500/10 text-amber-700'
        : accent === 'violet'
          ? 'from-fuchsia-400/20 to-violet-500/10 text-violet-700'
          : 'from-cyan-400/20 to-sky-500/10 text-cyan-700'

  return (
    <div className="rounded-[1.75rem] border border-zinc-200 bg-white p-6 shadow-[0_16px_60px_rgba(15,23,42,0.08)]">
      <div className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${accentStyles}`}>
        {label}
      </div>
      <div className="mt-4 text-4xl font-bold tracking-tight text-zinc-950">{value}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-500">{meta}</div>
    </div>
  )
}

function RadialSummaryCard({
  label,
  note,
  tone,
  value,
}: {
  label: string
  note: string
  tone: 'cyan' | 'emerald' | 'amber' | 'violet'
  value: number
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-4">
        <RadialGauge label={label} size={92} strokeWidth={9} tone={tone} value={value} />
        <div>
          <div className="text-sm font-semibold text-white">{label}</div>
          <div className="mt-1 text-xs leading-5 text-slate-300">{note}</div>
        </div>
      </div>
    </div>
  )
}

function RadialGauge({
  value,
  size,
  strokeWidth,
  label,
  tone,
}: {
  value: number
  size: number
  strokeWidth: number
  label: string
  tone: 'cyan' | 'emerald' | 'amber' | 'violet'
}) {
  const safeValue = Math.max(0, Math.min(100, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (safeValue / 100) * circumference
  const colors =
    tone === 'emerald'
      ? { progress: '#34d399', track: 'rgba(52, 211, 153, 0.18)' }
      : tone === 'amber'
        ? { progress: '#f59e0b', track: 'rgba(245, 158, 11, 0.2)' }
        : tone === 'violet'
          ? { progress: '#8b5cf6', track: 'rgba(139, 92, 246, 0.18)' }
          : { progress: '#22d3ee', track: 'rgba(34, 211, 238, 0.2)' }

  return (
    <div className="relative shrink-0" style={{ height: size, width: size }}>
      <svg className="-rotate-90" height={size} width={size}>
        <circle cx={size / 2} cy={size / 2} fill="none" r={radius} stroke={colors.track} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke={colors.progress}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xl font-bold text-white">{safeValue}%</div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{label}</div>
      </div>
    </div>
  )
}

function BarMetric({
  count,
  label,
  maxValue,
  tone,
}: {
  count: number
  label: string
  maxValue: number
  tone: string
}) {
  const width = `${Math.max(12, percent(count, Math.max(maxValue, 1)))}%`
  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-zinc-700">{label}</span>
        <span className="text-zinc-500">{count}</span>
      </div>
      <div className="mt-2 h-3 rounded-full bg-zinc-200">
        <div className={`h-3 rounded-full bg-gradient-to-r ${tone}`} style={{ width }} />
      </div>
    </div>
  )
}

function CompactInsightCard({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">{label}</div>
      <div className="mt-3 text-3xl font-bold text-zinc-950">{value}</div>
      <div className="mt-2 text-sm leading-6 text-zinc-500">{note}</div>
    </div>
  )
}

function Badge({
  tone,
  value,
}: {
  tone: 'slate' | 'emerald' | 'cyan' | 'amber' | 'violet'
  value: string
}) {
  const styles =
    tone === 'emerald'
      ? 'bg-emerald-100 text-emerald-700'
      : tone === 'cyan'
        ? 'bg-cyan-100 text-cyan-700'
        : tone === 'amber'
          ? 'bg-amber-100 text-amber-700'
          : tone === 'violet'
            ? 'bg-violet-100 text-violet-700'
            : 'bg-zinc-200 text-zinc-700'
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>{value}</span>
}

function EmptyState({ value }: { value: string }) {
  return <div className="rounded-[1.5rem] border border-dashed border-zinc-300 p-8 text-center text-zinc-500">{value}</div>
}

function Field({
  helperText,
  label,
  onChange,
  placeholder,
  required = true,
  type = 'text',
  value,
}: {
  helperText?: string
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
      {helperText ? <div className="mt-2 text-xs text-zinc-500">{helperText}</div> : null}
    </div>
  )
}

function TextAreaField({
  helperText,
  label,
  onChange,
  placeholder = '',
  required = true,
  value,
}: {
  helperText?: string
  label: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  value: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700">{label}</label>
      <textarea
        className="min-h-32 w-full resize-none rounded-xl border border-zinc-200 p-4 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        value={value}
      />
      {helperText ? <div className="mt-2 text-xs text-zinc-500">{helperText}</div> : null}
    </div>
  )
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  value: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700">{label}</label>
      <select
        className="w-full rounded-xl border border-zinc-200 bg-white p-4 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function CheckboxField({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 text-sm font-medium text-zinc-700">
      <input
        checked={checked}
        className="h-4 w-4 accent-emerald-500"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      {label}
    </label>
  )
}
