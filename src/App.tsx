import type { FormEvent, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { trackPropertyEvent } from './lib/propertyEvents'
import { usePageMeta } from './lib/seo'
import './App.css'

type RentalType = 'short' | 'long'

type Property = {
  id: string
  slug: string
  title: string
  location: string
  mapQuery?: string
  transportDetails?: string
  bedrooms: number
  squareMeters: number
  furnishingStatus: 'FURNISHED' | 'UNFURNISHED'
  price: number
  rental_type: RentalType
  image_url: string
  description: string
  amenities: string[]
}

type ContactForm = {
  name: string
  email: string
  phone: string
  message: string
}

type AuthMode = 'login' | 'register'

type AuthUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'OWNER' | 'TENANT'
}

type AuthForm = {
  firstName: string
  lastName: string
  email: string
  password: string
}

type ApiErrorResponse = {
  error?: string
}

type BackendProperty = {
  id: string
  slug: string
  title: string
  summary?: string | null
  city: string
  country: string
  location: string
  mapQuery?: string | null
  transportDetails?: string | null
  bedrooms: number
  bathrooms: number
  squareMeters: number
  maxGuests?: number | null
  priceCents: number
  currency: string
  rentalType: 'SHORT_TERM' | 'LONG_TERM'
  furnishingStatus: 'FURNISHED' | 'UNFURNISHED'
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  available: boolean
  images: { url: string }[]
  description: string
  amenities: string[]
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

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000')
const emptyDashboardForm: DashboardForm = {
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

const fallbackProperties: Property[] = [
  {
    id: '8af68080-e5dd-4331-bd8d-c211e0e102eb',
    slug: 'paris-apartment-marais-district',
    title: 'Paris Apartment - Marais District',
    location: 'Paris, France',
    mapQuery: '16 Rue des Francs Bourgeois, 75003 Paris, France',
    transportDetails:
      'Metro 1 Saint-Paul | 5 min walk\nBus 29, 96 | 3 min walk\nChatelet-Les Halles RER | 14 min by metro',
    bedrooms: 2,
    squareMeters: 64,
    furnishingStatus: 'UNFURNISHED',
    price: 1200,
    rental_type: 'long',
    image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    description:
      'Beautiful apartment in the heart of Le Marais with modern amenities and classic Parisian charm.',
    amenities: ['WiFi', 'Kitchen', 'Washer', 'Heating'],
  },
  {
    id: '2fd9cd60-f399-46af-89f7-65eceefcb5a5',
    slug: 'modern-studio-la-defense',
    title: 'Modern Studio - La Defense',
    location: 'Paris, France',
    mapQuery: 'La Defense, Courbevoie, France',
    transportDetails:
      'Metro 1 La Defense | 6 min walk\nRER A La Defense | 6 min walk\nTram T2 | 8 min walk',
    bedrooms: 0,
    squareMeters: 28,
    furnishingStatus: 'FURNISHED',
    price: 85,
    rental_type: 'short',
    image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    description:
      'Sleek modern studio perfect for business travelers, close to business district.',
    amenities: ['WiFi', 'Air Conditioning', 'Workspace', 'Gym Access'],
  },
  {
    id: '37856f3d-0880-4195-ad6b-98d303784b34',
    slug: 'charming-flat-montmartre',
    title: 'Charming Flat - Montmartre',
    location: 'Paris, France',
    mapQuery: 'Montmartre, 75018 Paris, France',
    transportDetails:
      'Metro 12 Abbesses | 4 min walk\nBus 40 | 3 min walk\nGare du Nord | 15 min by metro',
    bedrooms: 3,
    squareMeters: 88,
    furnishingStatus: 'UNFURNISHED',
    price: 1800,
    rental_type: 'long',
    image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    description: 'Spacious family apartment with stunning views of Sacre-Coeur.',
    amenities: ['WiFi', 'Kitchen', 'Balcony', 'Parking'],
  },
  {
    id: 'a7dc5b49-2d21-48da-a2f8-cc289eea2322',
    slug: 'luxury-suite-champs-elysees',
    title: 'Luxury Suite - Champs-Elysees',
    location: 'Paris, France',
    mapQuery: 'Avenue des Champs-Elysees, 75008 Paris, France',
    transportDetails:
      'Metro 1 George V | 4 min walk\nBus 73 | 2 min walk\nCharles de Gaulle-Etoile RER | 8 min walk',
    bedrooms: 2,
    squareMeters: 56,
    furnishingStatus: 'FURNISHED',
    price: 150,
    rental_type: 'short',
    image_url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    description:
      'Premium short-stay suite with concierge service near the iconic avenue.',
    amenities: ['WiFi', 'Concierge', 'Room Service', 'Spa Access'],
  },
  {
    id: '87cb3117-75a1-4b0e-9474-be3bf68130ec',
    slug: 'cozy-loft-saint-germain',
    title: 'Cozy Loft - Saint-Germain',
    location: 'Paris, France',
    mapQuery: 'Saint-Germain-des-Pres, 75006 Paris, France',
    transportDetails:
      'Metro 4 Saint-Germain-des-Pres | 5 min walk\nBus 95 | 3 min walk\nRER B Luxembourg | 12 min walk',
    bedrooms: 1,
    squareMeters: 41,
    furnishingStatus: 'FURNISHED',
    price: 950,
    rental_type: 'long',
    image_url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
    description: 'Artist loft in the literary heart of Paris with exposed beams.',
    amenities: ['WiFi', 'Kitchen', 'Heating', 'Bookshelf'],
  },
  {
    id: '509b2044-c359-4730-80e7-cbdccd463274',
    slug: 'executive-apartment-opera',
    title: 'Executive Apartment - Opera',
    location: 'Paris, France',
    mapQuery: 'Opera, 75009 Paris, France',
    transportDetails:
      'Metro 3 Opera | 4 min walk\nBus 20, 21 | 2 min walk\nAuber RER A | 9 min walk',
    bedrooms: 2,
    squareMeters: 52,
    furnishingStatus: 'UNFURNISHED',
    price: 120,
    rental_type: 'short',
    image_url: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800',
    description:
      'Elegant apartment for professionals, walking distance to Palais Garnier.',
    amenities: ['WiFi', 'Workspace', 'Meeting Room', 'Fitness Center'],
  },
]

function mapBackendProperty(property: BackendProperty): Property {
  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    location: property.location,
    mapQuery: property.mapQuery ?? undefined,
    transportDetails: property.transportDetails ?? undefined,
    bedrooms: property.bedrooms,
    squareMeters: property.squareMeters,
    furnishingStatus: property.furnishingStatus,
    price: Math.round(property.priceCents / 100),
    rental_type: property.rentalType === 'SHORT_TERM' ? 'short' : 'long',
    image_url: resolveAssetUrl(property.images[0]?.url ?? ''),
    description: property.description,
    amenities: property.amenities,
  }
}

function mapPropertyToDashboardForm(property: BackendProperty): DashboardForm {
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

function resolveAssetUrl(url: string) {
  if (!url) {
    return ''
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  return API_BASE_URL ? `${API_BASE_URL}${url}` : url
}

function parseImageUrls(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseTransportDetails(value?: string) {
  return (value ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item, index) => {
      const [title, detail] = item.split('|').map((part) => part.trim())
      return {
        id: `${title ?? item}-${index}`,
        title: title || 'Transport',
        detail: detail || item,
      }
    })
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

const faqs = [
  {
    q: 'What areas do you cover?',
    a: 'We primarily operate in Paris and surrounding areas, with plans to expand across major European cities.',
  },
  {
    q: 'How long does the setup process take?',
    a: 'Typically 2-4 weeks from initial consultation to full property readiness, depending on the scope of work needed.',
  },
  {
    q: 'What are your management fees?',
    a: 'Our fees are competitive and depend on the services required. Contact us for a personalized quote.',
  },
  {
    q: 'Can I still access my property?',
    a: 'Absolutely. We coordinate all access with you and ensure your ownership rights are fully respected.',
  },
]

function App() {
  usePageMeta({
    title: 'Home',
    description: 'Discover featured apartments, owner services, and EUROSTRY property management in Paris and beyond.',
    path: '/',
  })

  const [properties, setProperties] = useState<Property[]>(fallbackProperties)
  const [propertiesError, setPropertiesError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | RentalType>('all')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [authForm, setAuthForm] = useState<AuthForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [dashboardProperties, setDashboardProperties] = useState<BackendProperty[]>([])
  const [dashboardForm, setDashboardForm] = useState<DashboardForm>(emptyDashboardForm)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardSaving, setDashboardSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [dashboardDeletingSlug, setDashboardDeletingSlug] = useState<string | null>(null)
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  const [dashboardMessage, setDashboardMessage] = useState<string | null>(null)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const canManageProperties = authUser?.role === 'ADMIN' || authUser?.role === 'OWNER'

  useEffect(() => {
    document.body.style.overflow = selectedProperty ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedProperty])

  useEffect(() => {
    if (!selectedProperty) {
      return
    }

    trackPropertyEvent({
      propertyId: selectedProperty.id,
      propertySlug: selectedProperty.slug,
      eventType: 'PROPERTY_OPENED',
      page: '/',
    })
  }, [selectedProperty])

  useEffect(() => {
    void fetchProperties()
    void fetchCurrentUser()
  }, [])

  useEffect(() => {
    if (canManageProperties && authUser) {
      void fetchDashboardProperties(authUser)
      return
    }

    setDashboardProperties([])
    setDashboardForm(emptyDashboardForm)
    setDashboardError(null)
    setDashboardMessage(null)
    setEditingSlug(null)
  }, [authUser, canManageProperties])

  const filteredProperties =
    activeFilter === 'all'
      ? properties
      : properties.filter((property) => property.rental_type === activeFilter)
  const featuredProperties = filteredProperties.slice(0, 3)

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  const goToApartments = (params?: Record<string, string>) => {
    const search = new URLSearchParams(params ?? {}).toString()
    window.location.href = search ? `/apartments?${search}` : '/apartments'
  }

  const goToOwners = () => {
    setMobileMenuOpen(false)
    window.location.href = '/owners'
  }

  const goToContact = () => {
    setMobileMenuOpen(false)
    window.location.href = '/contact'
  }

  const goToAdmin = () => {
    setMobileMenuOpen(false)
    window.location.href = '/admin'
  }

  const goToPropertyInquiry = (
    property: Property,
    intent: 'contact' | 'booking',
  ) => {
    trackPropertyEvent({
      propertyId: property.id,
      propertySlug: property.slug,
      eventType: intent === 'booking' ? 'BOOKING_CLICKED' : 'CONTACT_CLICKED',
      page: '/',
    })

    const search = new URLSearchParams({
      propertyId: property.id,
      propertySlug: property.slug,
      propertyTitle: property.title,
      propertyLocation: property.location,
      propertyImage: property.image_url,
      propertyPrice: String(property.price),
      propertyRentalType: property.rental_type,
      propertyMapQuery: property.mapQuery ?? property.location,
      propertyTransportDetails: property.transportDetails ?? '',
      intent,
    }).toString()

    setMobileMenuOpen(false)
    window.location.href = `/contact?${search}`
  }

  const buildMapEmbedUrl = (query: string) =>
    `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setSubmitStatus('success')
      setContactForm({ name: '', email: '', phone: '', message: '' })
    } catch {
      setSubmitStatus('error')
    }

    window.setTimeout(() => setSubmitStatus(null), 3000)
  }

  const fetchProperties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/properties`)
      if (!response.ok) {
        throw new Error('Failed to load properties')
      }

      const data = (await response.json()) as { properties: BackendProperty[] }
      setProperties(data.properties.map(mapBackendProperty))
      setPropertiesError(null)
    } catch {
      setPropertiesError('Using fallback property data while the backend is unavailable.')
      setProperties(fallbackProperties)
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include',
      })

      if (!response.ok) {
        setAuthUser(null)
        return
      }

      const data = (await response.json()) as { user: AuthUser }
      setAuthUser(data.user)
    } catch {
      setAuthUser(null)
    }
  }

  const fetchDashboardProperties = async (user: AuthUser) => {
    setDashboardLoading(true)
    setDashboardError(null)

    try {
      const params = new URLSearchParams({ includeDrafts: 'true' })
      if (user.role === 'OWNER') {
        params.set('ownerId', user.id)
      }

      const response = await fetch(`${API_BASE_URL}/api/properties?${params.toString()}`, {
        credentials: 'include',
      })

      const data = await readJsonResponse<{
        error?: string
        properties?: BackendProperty[]
      }>(response)

      if (!response.ok || !data?.properties) {
        throw new Error(data?.error ?? 'Failed to load dashboard properties')
      }

      setDashboardProperties(data.properties)
    } catch (error) {
      setDashboardError(
        error instanceof Error ? error.message : 'Failed to load dashboard properties',
      )
    } finally {
      setDashboardLoading(false)
    }
  }

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthLoading(true)
    setAuthError(null)

    try {
      const endpoint =
        authMode === 'login'
          ? `${API_BASE_URL}/api/auth/login`
          : `${API_BASE_URL}/api/auth/register`

      const payload =
        authMode === 'login'
          ? {
              email: authForm.email,
              password: authForm.password,
            }
          : {
              firstName: authForm.firstName,
              lastName: authForm.lastName,
              email: authForm.email,
              password: authForm.password,
            }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const data = await readJsonResponse<ApiErrorResponse & { user?: AuthUser }>(response)
      if (!response.ok || !data?.user) {
        throw new Error(
          data?.error ??
            'Authentication failed. Check that the backend is running and try again.',
        )
      }

      setAuthUser(data.user)
      setAuthModalOpen(false)
      setShowPassword(false)
      setAuthForm({ firstName: '', lastName: '', email: '', password: '' })

      if (data.user.role === 'ADMIN' || data.user.role === 'OWNER') {
        window.location.href = '/admin'
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => undefined)
    setAuthUser(null)
  }

  const openAuthModal = (mode: AuthMode) => {
    setAuthMode(mode)
    setAuthError(null)
    setShowPassword(false)
    setAuthModalOpen(true)
  }

  const startCreateProperty = () => {
    setEditingSlug(null)
    setDashboardForm(emptyDashboardForm)
    setDashboardError(null)
    setDashboardMessage(null)
  }

  const startEditProperty = (property: BackendProperty) => {
    setEditingSlug(property.slug)
    setDashboardForm(mapPropertyToDashboardForm(property))
    setDashboardError(null)
    setDashboardMessage(null)
    scrollToSection('dashboard')
  }

  const handleDashboardSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!authUser || !canManageProperties) {
      return
    }

    setDashboardSaving(true)
    setDashboardError(null)
    setDashboardMessage(null)

    const payload = {
      title: dashboardForm.title.trim(),
      slug: dashboardForm.slug.trim().toLowerCase(),
      summary: dashboardForm.summary.trim(),
      description: dashboardForm.description.trim(),
      location: dashboardForm.location.trim(),
      mapQuery: dashboardForm.mapQuery.trim(),
      transportDetails: dashboardForm.transportDetails.trim(),
      city: dashboardForm.city.trim(),
      country: dashboardForm.country.trim(),
      bedrooms: Number(dashboardForm.bedrooms),
      bathrooms: Number(dashboardForm.bathrooms),
      squareMeters: Number(dashboardForm.squareMeters),
      maxGuests: Number(dashboardForm.maxGuests),
      priceCents: Math.round(Number(dashboardForm.price) * 100),
      currency: 'EUR',
      rentalType: dashboardForm.rentalType,
      furnishingStatus: dashboardForm.furnishingStatus,
      status: dashboardForm.status,
      available: dashboardForm.available,
      images: parseImageUrls(dashboardForm.imageUrlsText).map((url, index) => ({
        url,
        alt: dashboardForm.title.trim(),
        sortOrder: index,
      })),
      amenities: dashboardForm.amenities
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    }

    try {
      const response = await fetch(
        editingSlug
          ? `${API_BASE_URL}/api/properties/${editingSlug}`
          : `${API_BASE_URL}/api/properties`,
        {
          method: editingSlug ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        },
      )

      const data = await readJsonResponse<ApiErrorResponse>(response)
      if (!response.ok) {
        throw new Error(data?.error ?? 'Failed to save property')
      }

      setDashboardMessage(
        editingSlug ? 'Property updated successfully.' : 'Property created successfully.',
      )
      setEditingSlug(null)
      setDashboardForm(emptyDashboardForm)
      await Promise.all([fetchProperties(), fetchDashboardProperties(authUser)])
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : 'Failed to save property')
    } finally {
      setDashboardSaving(false)
    }
  }

  const handleDeleteProperty = async (property: BackendProperty) => {
    if (!authUser || !canManageProperties) {
      return
    }

    const confirmed = window.confirm(`Delete "${property.title}"? This cannot be undone.`)
    if (!confirmed) {
      return
    }

    setDashboardDeletingSlug(property.slug)
    setDashboardError(null)
    setDashboardMessage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/properties/${property.slug}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await readJsonResponse<ApiErrorResponse>(response)
      if (!response.ok) {
        throw new Error(data?.error ?? 'Failed to delete property')
      }

      setDashboardMessage('Property deleted successfully.')
      if (editingSlug === property.slug) {
        setEditingSlug(null)
        setDashboardForm(emptyDashboardForm)
      }
      await Promise.all([fetchProperties(), fetchDashboardProperties(authUser)])
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : 'Failed to delete property')
    } finally {
      setDashboardDeletingSlug(null)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) {
      return
    }

    setUploadingImages(true)
    setDashboardError(null)
    setDashboardMessage(null)

    try {
      const formData = new FormData()
      for (const file of Array.from(files)) {
        formData.append('files', file)
      }

      const response = await fetch(`${API_BASE_URL}/api/uploads`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const data = await readJsonResponse<{
        error?: string
        uploads?: { url: string }[]
      }>(response)

      if (!response.ok || !data?.uploads) {
        throw new Error(data?.error ?? 'Image upload failed')
      }

      const merged = [...parseImageUrls(dashboardForm.imageUrlsText), ...data.uploads.map((item) => item.url)]
      setDashboardForm((current) => ({
        ...current,
        imageUrlsText: merged.join('\n'),
      }))
      setDashboardMessage('Images uploaded successfully.')
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : 'Image upload failed')
    } finally {
      setUploadingImages(false)
      event.target.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            className="flex items-center gap-3"
            onClick={() => scrollToSection('hero')}
            type="button"
          >
            <img
              alt="EUROSTRY logo"
              className="h-12 w-auto md:h-14"
              src="/eurostry-logo.png"
            />
            <span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              EUROSTRY
            </span>
          </button>

          <nav className="hidden gap-8 text-sm font-medium md:flex">
            <NavButton label="Properties" onClick={() => goToApartments()} />
            <NavButton label="Short Term" onClick={() => scrollToSection('short')} />
            <NavButton label="Long Term" onClick={() => scrollToSection('long')} />
            {canManageProperties ? (
              <NavButton label="Dashboard" onClick={goToAdmin} />
            ) : null}
            <NavButton label="Owners" onClick={goToOwners} />
            <NavButton label="Contact" onClick={goToContact} />
          </nav>

          <div className="hidden gap-3 md:flex">
            {authUser ? (
              <>
                <div className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium">
                  {authUser.firstName} {authUser.lastName} / {authUser.role}
                </div>
                <button
                  className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-800"
                  onClick={handleLogout}
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-medium transition-all hover:border-zinc-400"
                  onClick={() => openAuthModal('login')}
                  type="button"
                >
                  Login
                </button>
                <button
                  className="rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-emerald-500/25"
                  onClick={() => openAuthModal('register')}
                  type="button"
                >
                  Register
                </button>
              </>
            )}
          </div>

          <button
            className="p-2 md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            type="button"
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="animate-fadeIn border-b border-zinc-100 bg-white shadow-lg md:hidden">
            <nav className="flex flex-col gap-4 p-6">
              <MobileNavButton label="Properties" onClick={() => goToApartments()} />
              <MobileNavButton label="Short Term" onClick={() => scrollToSection('short')} />
              <MobileNavButton label="Long Term" onClick={() => scrollToSection('long')} />
              {canManageProperties ? (
                <MobileNavButton label="Dashboard" onClick={goToAdmin} />
              ) : null}
              <MobileNavButton label="Owners" onClick={goToOwners} />
              <MobileNavButton label="Contact" onClick={goToContact} />
              <div className="flex gap-3 border-t border-zinc-100 pt-4">
                {authUser ? (
                  <button
                    className="w-full rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white"
                    onClick={handleLogout}
                    type="button"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <button
                      className="flex-1 rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-medium"
                      onClick={() => openAuthModal('login')}
                      type="button"
                    >
                      Login
                    </button>
                    <button
                      className="flex-1 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2.5 text-sm font-medium text-white"
                      onClick={() => openAuthModal('register')}
                      type="button"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main>
        <section className="relative overflow-hidden px-6 py-24 md:py-32" id="hero">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.1),_transparent_30%)]" />
          <div className="relative mx-auto max-w-5xl text-center">
            <div className="animate-slideUp mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-4 py-2 text-sm text-zinc-600 backdrop-blur-sm">
              <StarIcon className="text-amber-500" />
              Trusted by 500+ property owners across Europe
            </div>
            <h1 className="animate-slideUp animation-delay-100 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Smart Rental &
              <br />
              <span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                Property Management
              </span>
            </h1>
            <p className="animate-slideUp animation-delay-200 mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-zinc-600 md:text-xl">
              EUROSTRY connects property owners, tenants, and investors through a
              modern digital platform.
            </p>
            <div className="animate-slideUp animation-delay-300 mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <button
                className="group flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-8 py-4 text-base font-medium text-white transition-all hover:bg-zinc-800"
                onClick={() => goToApartments()}
                type="button"
              >
                Search Apartments
                <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                className="rounded-full border-2 border-zinc-200 px-8 py-4 text-base font-medium transition-all hover:border-zinc-400"
                onClick={() => scrollToSection('owners')}
                type="button"
              >
                I'm a Property Owner
              </button>
            </div>
            <div className="animate-slideUp animation-delay-400 mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
              <StatCard label="Active Properties" value="250+" />
              <StatCard label="Occupancy Rate" value="98%" />
              <StatCard label="Happy Tenants" value="500+" />
              <StatCard label="Cities Covered" value="15+" />
            </div>
          </div>
        </section>

        <section className="bg-zinc-50 px-6 py-24" id="properties">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-bold md:text-4xl">
                  Featured Properties
                </h2>
                <p className="mt-3 text-zinc-600">
                  A quick look at featured apartments before you jump into the full search page
                </p>
              </div>
              <div className="flex gap-2 rounded-full border border-zinc-200 bg-white p-1">
                <FilterButton active={activeFilter === 'all'} label="All" onClick={() => setActiveFilter('all')} />
                <FilterButton active={activeFilter === 'short'} label="Short Term" onClick={() => setActiveFilter('short')} />
                <FilterButton active={activeFilter === 'long'} label="Long Term" onClick={() => setActiveFilter('long')} />
              </div>
            </div>

            {propertiesError ? (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {propertiesError}
              </div>
            ) : null}

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProperties.map((property) => (
                <article
                  className="group cursor-pointer overflow-hidden rounded-3xl border border-zinc-100 bg-white transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50"
                  key={property.id}
                  onClick={() => setSelectedProperty(property)}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      alt={property.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={property.image_url}
                    />
                    <div className="absolute left-4 top-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium text-white ${
                          property.rental_type === 'short'
                            ? 'bg-cyan-500'
                            : 'bg-emerald-500'
                        }`}
                      >
                        {property.rental_type === 'short' ? 'Short Term' : 'Long Term'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold">{property.title}</h3>
                    <div className="mt-2 flex items-center gap-1 text-sm text-zinc-500">
                      <MapPinIcon />
                      {property.location}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
                      <div className="flex items-center gap-1 text-sm text-zinc-500">
                        <BedIcon />
                        {property.bedrooms === 0
                          ? 'Studio'
                          : `${property.bedrooms} ${property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}`}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-zinc-900">
                          {formatPrice(property.price)}€
                        </div>
                        <div className="text-sm text-zinc-500">
                          /{property.rental_type === 'short' ? 'night' : 'month'}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {selectedProperty ? (
          <div
            className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setSelectedProperty(null)}
          >
            <div
              className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative h-72">
                <img
                  alt={selectedProperty.title}
                  className="h-full w-full object-cover"
                  src={selectedProperty.image_url}
                />
                <button
                  className="absolute right-4 top-4 rounded-full bg-white/90 p-2 transition-colors hover:bg-white"
                  onClick={() => setSelectedProperty(null)}
                  type="button"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        selectedProperty.rental_type === 'short'
                          ? 'bg-cyan-100 text-cyan-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {selectedProperty.rental_type === 'short'
                        ? 'Short Term'
                        : 'Long Term'}
                    </span>
                    <h2 className="mt-3 text-2xl font-bold">
                      {selectedProperty.title}
                    </h2>
                    <div className="mt-2 flex items-center gap-1 text-zinc-500">
                      <MapPinIcon />
                      {selectedProperty.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-zinc-900">
                      {formatPrice(selectedProperty.price)}€
                    </div>
                    <div className="text-zinc-500">
                      /{selectedProperty.rental_type === 'short' ? 'night' : 'month'}
                    </div>
                  </div>
                </div>

                <p className="mt-6 leading-relaxed text-zinc-600">
                  {selectedProperty.description}
                </p>

                <div className="mt-6">
                  <h3 className="mb-3 font-semibold">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity) => (
                      <span
                        className="rounded-full bg-zinc-100 px-3 py-1.5 text-sm text-zinc-600"
                        key={amenity}
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 text-sm text-zinc-500">
                  <span>{selectedProperty.squareMeters} m²</span>
                  <span>
                    {selectedProperty.furnishingStatus === 'FURNISHED'
                      ? 'Furnished'
                      : 'Unfurnished'}
                  </span>
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
                  <div>
                    <h3 className="text-xl font-semibold">Exact location</h3>
                    <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-200">
                      <iframe
                        className="h-72 w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={buildMapEmbedUrl(selectedProperty.mapQuery ?? selectedProperty.location)}
                        title="Apartment location map"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Nearby transportation</h3>
                    <div className="mt-4 grid gap-4">
                      {parseTransportDetails(selectedProperty.transportDetails).length > 0 ? (
                        parseTransportDetails(selectedProperty.transportDetails).map((item) => (
                          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5" key={item.id}>
                            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                              {item.title}
                            </div>
                            <p className="mt-3 text-sm leading-6 text-zinc-600">{item.detail}</p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                          <div className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                            Transport details
                          </div>
                          <p className="mt-3 text-sm leading-6 text-zinc-600">
                            No transport details added yet for this apartment.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 font-medium text-white transition-all hover:shadow-lg"
                    onClick={() => goToPropertyInquiry(selectedProperty, 'booking')}
                    type="button"
                  >
                    Book Now
                  </button>
                  <button
                    className="rounded-xl border border-zinc-200 px-6 py-3 font-medium transition-all hover:border-zinc-400"
                    onClick={() => goToPropertyInquiry(selectedProperty, 'contact')}
                    type="button"
                  >
                    Contact Apartment
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {canManageProperties ? (
          <section className="bg-white px-6 py-24" id="dashboard">
            <div className="mx-auto max-w-7xl">
              <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="inline-flex rounded-full bg-zinc-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">
                    {authUser?.role === 'ADMIN' ? 'Admin Dashboard' : 'Owner Dashboard'}
                  </div>
                  <h2 className="mt-5 text-3xl font-bold md:text-4xl">
                    Manage property inventory
                  </h2>
                  <p className="mt-3 max-w-2xl text-zinc-600">
                    Create drafts, publish listings, update pricing, and keep your
                    active portfolio current from one place.
                  </p>
                </div>
                <button
                  className="rounded-full border border-zinc-200 px-5 py-3 text-sm font-medium transition-all hover:border-zinc-400"
                  onClick={startCreateProperty}
                  type="button"
                >
                  Create New Property
                </button>
              </div>

              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-3xl border border-zinc-100 bg-zinc-50 p-6">
                  <div className="mb-6 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white p-5">
                      <div className="text-sm text-zinc-500">Total Managed</div>
                      <div className="mt-2 text-3xl font-bold">{dashboardProperties.length}</div>
                    </div>
                    <div className="rounded-2xl bg-white p-5">
                      <div className="text-sm text-zinc-500">Published</div>
                      <div className="mt-2 text-3xl font-bold">
                        {
                          dashboardProperties.filter((property) => property.status === 'PUBLISHED')
                            .length
                        }
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white p-5">
                      <div className="text-sm text-zinc-500">Drafts</div>
                      <div className="mt-2 text-3xl font-bold">
                        {dashboardProperties.filter((property) => property.status === 'DRAFT').length}
                      </div>
                    </div>
                  </div>

                  {dashboardError ? (
                    <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {dashboardError}
                    </div>
                  ) : null}
                  {dashboardMessage ? (
                    <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {dashboardMessage}
                    </div>
                  ) : null}

                  <div className="space-y-4">
                    {dashboardLoading ? (
                      <div className="rounded-2xl bg-white p-6 text-sm text-zinc-500">
                        Loading dashboard properties...
                      </div>
                    ) : null}

                    {!dashboardLoading && dashboardProperties.length === 0 ? (
                      <div className="rounded-2xl bg-white p-6 text-sm text-zinc-500">
                        No managed properties yet. Create your first listing on the right.
                      </div>
                    ) : null}

                    {dashboardProperties.map((property) => (
                      <article
                        className="rounded-2xl border border-zinc-200 bg-white p-5"
                        key={property.id}
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold">{property.title}</h3>
                              <StatusBadge status={property.status} />
                              <AvailabilityBadge available={property.available} />
                            </div>
                            <div className="mt-2 text-sm text-zinc-500">{property.location}</div>
                            <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-600">
                              <span>{property.rentalType === 'SHORT_TERM' ? 'Short term' : 'Long term'}</span>
                              <span>{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bedroom${property.bedrooms === 1 ? '' : 's'}`}</span>
                              <span>{property.squareMeters} m²</span>
                              <span>{property.furnishingStatus === 'FURNISHED' ? 'Furnished' : 'Unfurnished'}</span>
                              <span>{Math.round(property.priceCents / 100)} EUR</span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium transition-all hover:border-zinc-400"
                              onClick={() => startEditProperty(property)}
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                              disabled={dashboardDeletingSlug === property.slug}
                              onClick={() => handleDeleteProperty(property)}
                              type="button"
                            >
                              {dashboardDeletingSlug === property.slug ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {editingSlug ? 'Edit Property' : 'Create Property'}
                      </h3>
                      <p className="mt-2 text-sm text-zinc-600">
                        {editingSlug
                          ? 'Update listing content and publishing state.'
                          : 'Draft a new listing for your portfolio.'}
                      </p>
                    </div>
                    {editingSlug ? (
                      <button
                        className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium transition-all hover:border-zinc-400"
                        onClick={startCreateProperty}
                        type="button"
                      >
                        Cancel Edit
                      </button>
                    ) : null}
                  </div>

                  <form className="mt-6 space-y-4" onSubmit={handleDashboardSubmit}>
                    <Field
                      label="Title"
                      value={dashboardForm.title}
                      onChange={(value) =>
                        setDashboardForm((current) => ({ ...current, title: value }))
                      }
                    />
                    <Field
                      label="Slug"
                      value={dashboardForm.slug}
                      onChange={(value) =>
                        setDashboardForm((current) => ({ ...current, slug: value }))
                      }
                    />
                    <Field
                      label="Summary"
                      required={false}
                      value={dashboardForm.summary}
                      onChange={(value) =>
                        setDashboardForm((current) => ({ ...current, summary: value }))
                      }
                    />
                    <TextAreaField
                      label="Description"
                      value={dashboardForm.description}
                      onChange={(value) =>
                        setDashboardForm((current) => ({ ...current, description: value }))
                      }
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Location"
                        value={dashboardForm.location}
                        onChange={(value) =>
                          setDashboardForm((current) => ({ ...current, location: value }))
                        }
                      />
                      <Field
                        label="Exact Map Location"
                        placeholder="16 Rue des Francs Bourgeois, 75003 Paris, France"
                        required={false}
                        value={dashboardForm.mapQuery}
                        onChange={(value) =>
                          setDashboardForm((current) => ({ ...current, mapQuery: value }))
                        }
                      />
                      <Field
                        label="City"
                        value={dashboardForm.city}
                        onChange={(value) =>
                          setDashboardForm((current) => ({ ...current, city: value }))
                        }
                      />
                      <Field
                        label="Country"
                        value={dashboardForm.country}
                        onChange={(value) =>
                          setDashboardForm((current) => ({ ...current, country: value }))
                        }
                      />
                      <Field
                        label="Bedrooms"
                        type="number"
                        value={dashboardForm.bedrooms}
                        onChange={(value) =>
                          setDashboardForm((current) => ({ ...current, bedrooms: value }))
                        }
                      />
                      <Field
                        label="Bathrooms"
                        type="number"
                        value={dashboardForm.bathrooms}
                        onChange={(value) =>
                          setDashboardForm((current) => ({ ...current, bathrooms: value }))
                        }
                      />
                      <Field
                        label="Surface Area (m²)"
                        type="number"
                        value={dashboardForm.squareMeters}
                        onChange={(value) =>
                          setDashboardForm((current) => ({ ...current, squareMeters: value }))
                        }
                      />
                      <Field
                        label="Max Guests"
                        type="number"
                        value={dashboardForm.maxGuests}
                        onChange={(value) =>
                          setDashboardForm((current) => ({ ...current, maxGuests: value }))
                        }
                      />
                      <Field
                        label="Price (EUR)"
                        type="number"
                        value={dashboardForm.price}
                        onChange={(value) =>
                          setDashboardForm((current) => ({ ...current, price: value }))
                        }
                      />
                    </div>

                    <TextAreaField
                      label="Nearby Transport Details"
                      placeholder={
                        'Metro 1 Saint-Paul | 5 min walk\nBus 29, 96 | 3 min walk\nChatelet-Les Halles RER | 14 min by metro'
                      }
                      required={false}
                      value={dashboardForm.transportDetails}
                      onChange={(value) =>
                        setDashboardForm((current) => ({ ...current, transportDetails: value }))
                      }
                    />

                    <div className="rounded-2xl border border-zinc-200 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h4 className="font-semibold text-zinc-900">Apartment Photos</h4>
                          <p className="mt-1 text-sm text-zinc-600">
                            Upload from your computer or paste multiple image URLs, one per line.
                          </p>
                        </div>
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium transition-all hover:border-zinc-400">
                          <input
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            multiple
                            onChange={handleImageUpload}
                            type="file"
                          />
                          {uploadingImages ? 'Uploading...' : 'Upload Photos'}
                        </label>
                      </div>

                      <div className="mt-4">
                        <TextAreaField
                          label="Apartment Image URLs"
                          placeholder="https://example.com/photo-1.jpg&#10;https://example.com/photo-2.jpg"
                          required={false}
                          value={dashboardForm.imageUrlsText}
                          onChange={(value) =>
                            setDashboardForm((current) => ({ ...current, imageUrlsText: value }))
                          }
                        />
                      </div>

                      {parseImageUrls(dashboardForm.imageUrlsText).length > 0 ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {parseImageUrls(dashboardForm.imageUrlsText).map((imageUrl, index) => (
                            <div
                              className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50"
                              key={`${imageUrl}-${index}`}
                            >
                              <img
                                alt={`Apartment photo ${index + 1}`}
                                className="h-36 w-full object-cover"
                                src={resolveAssetUrl(imageUrl)}
                              />
                              <div className="flex items-center justify-between gap-3 p-3">
                                <div className="truncate text-xs text-zinc-500">
                                  Photo {index + 1}
                                </div>
                                <button
                                  className="text-sm font-medium text-red-600 transition-colors hover:text-red-700"
                                  onClick={() => {
                                    const nextImages = parseImageUrls(dashboardForm.imageUrlsText)
                                    nextImages.splice(index, 1)
                                    setDashboardForm((current) => ({
                                      ...current,
                                      imageUrlsText: nextImages.join('\n'),
                                    }))
                                  }}
                                  type="button"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <Field
                      label="Amenities (comma separated)"
                      required={false}
                      value={dashboardForm.amenities}
                      onChange={(value) =>
                        setDashboardForm((current) => ({ ...current, amenities: value }))
                      }
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField
                        label="Rental Type"
                        options={[
                          { label: 'Long Term', value: 'LONG_TERM' },
                          { label: 'Short Term', value: 'SHORT_TERM' },
                        ]}
                        value={dashboardForm.rentalType}
                        onChange={(value) =>
                          setDashboardForm((current) => ({
                            ...current,
                            rentalType: value as DashboardForm['rentalType'],
                          }))
                        }
                      />
                      <SelectField
                        label="Status"
                        options={[
                          { label: 'Draft', value: 'DRAFT' },
                          { label: 'Published', value: 'PUBLISHED' },
                          { label: 'Archived', value: 'ARCHIVED' },
                        ]}
                        value={dashboardForm.status}
                        onChange={(value) =>
                          setDashboardForm((current) => ({
                            ...current,
                            status: value as DashboardForm['status'],
                          }))
                        }
                      />
                      <SelectField
                        label="Furnishing"
                        options={[
                          { label: 'Furnished', value: 'FURNISHED' },
                          { label: 'Unfurnished', value: 'UNFURNISHED' },
                        ]}
                        value={dashboardForm.furnishingStatus}
                        onChange={(value) =>
                          setDashboardForm((current) => ({
                            ...current,
                            furnishingStatus: value as DashboardForm['furnishingStatus'],
                          }))
                        }
                      />
                    </div>

                    <CheckboxField
                      checked={dashboardForm.available}
                      label="Available for booking/inquiries"
                      onChange={(checked) =>
                        setDashboardForm((current) => ({ ...current, available: checked }))
                      }
                    />

                    <button
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-4 font-medium text-white transition-all hover:shadow-lg hover:shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dashboardSaving}
                      type="submit"
                    >
                      {dashboardSaving
                        ? 'Saving...'
                        : editingSlug
                          ? 'Update Property'
                          : 'Create Property'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="px-6 py-24" id="short">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700">
                  <ClockIcon />
                  Flexible stays
                </div>
                <h2 className="text-3xl font-bold md:text-4xl">Short-Term Rentals</h2>
                <p className="mt-6 text-lg leading-relaxed text-zinc-600">
                  Premium short-stay properties for travelers, professionals, and
                  guests who want comfort, flexibility, and reliable support.
                </p>
                <div className="mt-8 space-y-4">
                  <FeatureBox
                    accent="cyan"
                    description="Fully furnished spaces ready for immediate stays"
                    title="Move-in Ready"
                  />
                  <FeatureBox
                    accent="cyan"
                    description="Prime addresses close to business, culture, and transport"
                    title="Prime Locations"
                  />
                  <FeatureBox
                    accent="cyan"
                    description="Dedicated guest support throughout your stay"
                    title="Responsive Assistance"
                  />
                </div>
                <button
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-medium text-white transition-colors hover:bg-cyan-600"
                  onClick={() => goToApartments({ rentalType: 'SHORT_TERM' })}
                  type="button"
                >
                  Search Short-Term Apartments
                  <ArrowRightIcon />
                </button>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-cyan-200/40 to-emerald-200/40 blur-2xl" />
                <img
                  alt="Short term rental"
                  className="relative w-full rounded-3xl shadow-2xl"
                  src="https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-zinc-50 px-6 py-24" id="long">
          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div className="order-2 relative lg:order-1">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-200/40 to-cyan-200/40 blur-2xl" />
                <img
                  alt="Long term rental"
                  className="relative w-full rounded-3xl shadow-2xl"
                  src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
                />
              </div>
              <div className="order-1 lg:order-2">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                  <BedIcon />
                  Stable Housing
                </div>
                <h2 className="text-3xl font-bold md:text-4xl">Long-Term Rentals</h2>
                <p className="mt-6 text-lg leading-relaxed text-zinc-600">
                  Find your home away from home with our carefully curated long-term
                  rental properties.
                </p>
                <div className="mt-8 space-y-4">
                  <FeatureBox
                    accent="emerald"
                    description="All properties inspected and verified for quality"
                    title="Quality Verified"
                  />
                  <FeatureBox
                    accent="emerald"
                    description="No hidden fees, all costs clearly communicated"
                    title="Transparent Pricing"
                  />
                  <FeatureBox
                    accent="emerald"
                    description="Secure contracts and deposit protection"
                    title="Tenant Protection"
                  />
                </div>
                <button
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-600"
                  onClick={() => goToApartments({ rentalType: 'LONG_TERM' })}
                  type="button"
                >
                  Search Long-Term Apartments
                  <ArrowRightIcon />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-zinc-900 px-6 py-24 text-white" id="owners">
          <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
            <div>
              <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-400">
                For Property Owners
              </div>
              <h2 className="mt-6 text-3xl font-bold leading-tight md:text-5xl">
                Let EUROSTRY manage and
                <br />
                <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  operate your property
                </span>
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
                We work with property owners who want a more hands-off solution.
                EUROSTRY can take charge of the property, improve its presentation,
                furnish it, manage day-to-day operations, and optimize the rental
                experience for occupants.
              </p>
              <div className="mt-10 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                {[
                  'Property setup and furnishing',
                  'Day-to-day rental management',
                  'Tenant communication and follow-up',
                  'Maintenance coordination',
                  'Better property presentation',
                  'Structured operational reporting',
                ].map((item) => (
                  <div className="flex items-center gap-2" key={item}>
                    <CheckIcon className="text-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-4 text-sm font-medium text-white shadow-lg transition-all hover:shadow-emerald-500/25"
                  onClick={goToOwners}
                  type="button"
                >
                  Manage My Property with EUROSTRY
                  <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  className="rounded-2xl border border-white/20 px-6 py-4 text-sm font-medium text-white transition hover:bg-white/10"
                  onClick={goToContact}
                  type="button"
                >
                  Request a Consultation
                </button>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-3xl bg-white p-8 text-zinc-900 shadow-2xl">
                <h3 className="text-2xl font-bold">How it works</h3>
                <div className="mt-6 space-y-6">
                  {[
                    {
                      step: 1,
                      title: 'Property Review',
                      desc: 'We assess the apartment, its condition, and its rental potential.',
                    },
                    {
                      step: 2,
                      title: 'Setup & Improvement',
                      desc: 'We prepare, furnish, and organize the space for a stronger rental position.',
                    },
                    {
                      step: 3,
                      title: 'Management',
                      desc: 'EUROSTRY handles operational follow-up, occupant communication, and ongoing coordination.',
                    },
                  ].map((item) => (
                    <div className="flex gap-4" key={item.step}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 font-bold text-white">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-zinc-900">{item.title}</h4>
                        <p className="mt-1 text-sm text-zinc-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white backdrop-blur-sm">
                <h3 className="text-xl font-bold">Owner Portal Preview</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Owners can access a dedicated area to follow property activity,
                  management updates, documents, and performance summaries.
                </p>
                <div className="mt-6 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
                  {[
                    'Income summaries',
                    'Occupancy overview',
                    'Maintenance updates',
                    'Tenant activity',
                  ].map((item) => (
                    <div
                      className="cursor-pointer rounded-2xl bg-white/10 p-4 transition-colors hover:bg-white/15"
                      key={item}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
 
        <section className="bg-white px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-center text-zinc-600">
              Everything you need to know about our services
            </p>
            <div className="mt-12 space-y-4">
              {faqs.map((faq, index) => {
                const expanded = expandedFaq === index
                return (
                  <div
                    className="overflow-hidden rounded-2xl border border-zinc-200"
                    key={faq.q}
                  >
                    <button
                      className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-zinc-50"
                      onClick={() => setExpandedFaq(expanded ? null : index)}
                      type="button"
                    >
                      <span className="font-semibold">{faq.q}</span>
                      {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </button>
                    {expanded ? (
                      <div className="animate-slideDown px-6 pb-6 text-zinc-600">
                        {faq.a}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-cyan-50 via-white to-emerald-50 px-6 py-24">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Client Portal</h2>
            <p className="mt-4 text-lg text-zinc-600">
              Clients can view listings, track applications, and communicate
              directly.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  title: 'Browse Listings',
                  desc: 'Access all available properties with detailed information and photos',
                  icon: GridIcon,
                },
                {
                  title: 'Direct Communication',
                  desc: 'Chat directly with property managers and resolve queries quickly',
                  icon: MailIcon,
                },
                {
                  title: 'Track Applications',
                  desc: 'Monitor your rental applications and booking status in real-time',
                  icon: CalendarIcon,
                },
              ].map((card) => (
                <div
                  className="rounded-3xl border border-zinc-100 bg-white p-8 transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50"
                  key={card.title}
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500">
                    <card.icon className="text-white" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold">{card.title}</h3>
                  <p className="mt-3 text-sm text-zinc-600">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-zinc-50 px-6 py-24" id="contact">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold md:text-4xl">Get in Touch</h2>
                <p className="mt-4 text-zinc-600">
                  Have questions? We&apos;d love to hear from you. Send us a
                  message and we&apos;ll respond as soon as possible.
                </p>
                <div className="mt-8 space-y-4">
                  <ContactRow
                    icon={<MailIcon className="text-zinc-600" />}
                    label="Email"
                    value="contact@eurostrygroup.com"
                  />
                  <ContactRow
                    icon={<PhoneIcon className="text-zinc-600" />}
                    label="Phone"
                    value="+33 1 23 45 67 89"
                  />
                  <ContactRow
                    icon={<MapPinIcon className="text-zinc-600" />}
                    label="Address"
                    value="122 Avenue Daumesnil, 75012 Paris"
                  />
                </div>
              </div>

              <form
                className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm"
                onSubmit={handleContactSubmit}
              >
                <div className="grid gap-5">
                  <Field
                    label="Name"
                    value={contactForm.name}
                    onChange={(value) =>
                      setContactForm((current) => ({ ...current, name: value }))
                    }
                  />
                  <Field
                    label="Email"
                    type="email"
                    value={contactForm.email}
                    onChange={(value) =>
                      setContactForm((current) => ({ ...current, email: value }))
                    }
                  />
                  <Field
                    label="Phone"
                    value={contactForm.phone}
                    onChange={(value) =>
                      setContactForm((current) => ({ ...current, phone: value }))
                    }
                  />
                  <TextAreaField
                    label="Message"
                    value={contactForm.message}
                    onChange={(value) =>
                      setContactForm((current) => ({ ...current, message: value }))
                    }
                  />
                </div>
                <button
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-4 font-medium text-white transition-all hover:shadow-lg hover:shadow-emerald-500/25"
                  type="submit"
                >
                  Send Message
                </button>
                {submitStatus === 'success' ? (
                  <div className="animate-fadeIn mt-4 rounded-xl bg-emerald-50 p-4 text-center text-emerald-700">
                    Message sent successfully! We&apos;ll get back to you soon.
                  </div>
                ) : null}
                {submitStatus === 'error' ? (
                  <div className="animate-fadeIn mt-4 rounded-xl bg-red-50 p-4 text-center text-red-700">
                    Failed to send your message. Check that the backend is running.
                  </div>
                ) : null}
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-zinc-900 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <img
                  alt="EUROSTRY logo"
                  className="h-12 w-auto md:h-14"
                  src="/eurostry-logo.png"
                />
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
                <FooterButton label="Properties" onClick={() => goToApartments()} />
                <FooterButton label="For Owners" onClick={goToOwners} />
                <FooterButton label="Contact" onClick={goToContact} />
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Legal</h4>
              <div className="space-y-3 text-zinc-400">
                <a className="block transition-colors hover:text-white" href="/privacy">
                  Privacy Policy
                </a>
                <a className="block transition-colors hover:text-white" href="/terms">
                  Terms of Service
                </a>
                <a className="block transition-colors hover:text-white" href="/cookies">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-800 pt-8 md:flex-row">
            <div className="text-sm text-zinc-500">
              Copyright EUROSTRY 2026. All rights reserved.
            </div>
            <div className="flex gap-4">
              <SocialCircle>
                <TwitterIcon />
              </SocialCircle>
              <SocialCircle>
                <LinkedInIcon />
              </SocialCircle>
              <SocialCircle>
                <InstagramIcon />
              </SocialCircle>
            </div>
          </div>
        </div>
      </footer>

      {authModalOpen ? (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setAuthModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-8 text-zinc-900 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {authMode === 'login' ? 'Login' : 'Create account'}
                </h2>
                <p className="mt-2 text-sm text-zinc-600">
                  {authMode === 'login'
                    ? 'Access your EUROSTRY account.'
                    : 'Register to save your details and access the portal.'}
                </p>
              </div>
              <button
                className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                onClick={() => setAuthModalOpen(false)}
                type="button"
              >
                <CloseIcon />
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleAuthSubmit}>
              {authMode === 'register' ? (
                <>
                  <Field
                    label="First Name"
                    value={authForm.firstName}
                    onChange={(value) =>
                      setAuthForm((current) => ({ ...current, firstName: value }))
                    }
                  />
                  <Field
                    label="Last Name"
                    value={authForm.lastName}
                    onChange={(value) =>
                      setAuthForm((current) => ({ ...current, lastName: value }))
                    }
                  />
                </>
              ) : null}
              <Field
                label="Email"
                type="email"
                value={authForm.email}
                onChange={(value) =>
                  setAuthForm((current) => ({ ...current, email: value }))
                }
              />
              <Field
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={authForm.password}
                onChange={(value) =>
                  setAuthForm((current) => ({ ...current, password: value }))
                }
              />
              <div className="flex justify-end">
                <button
                  className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
                  onClick={() => setShowPassword((current) => !current)}
                  type="button"
                >
                  {showPassword ? 'Hide password' : 'Show password'}
                </button>
              </div>

              {authError ? (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  {authError}
                </div>
              ) : null}

              <button
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={authLoading}
                type="submit"
              >
                {authLoading
                  ? 'Please wait...'
                  : authMode === 'login'
                    ? 'Login'
                    : 'Register'}
              </button>
            </form>

            <button
              className="mt-4 text-sm text-zinc-600 transition-colors hover:text-zinc-900"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login')
                setAuthError(null)
              }}
              type="button"
            >
              {authMode === 'login'
                ? 'Need an account? Register'
                : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function NavButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      className="text-zinc-600 transition-colors hover:text-zinc-900"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

function MobileNavButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      className="py-2 text-left text-zinc-600 hover:text-zinc-900"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

function FooterButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      className="block transition-colors hover:text-white"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
        active ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-zinc-900">{value}</div>
      <div className="mt-1 text-sm text-zinc-500">{label}</div>
    </div>
  )
}

function FeatureBox({
  accent,
  description,
  title,
}: {
  accent: 'cyan' | 'emerald'
  description: string
  title: string
}) {
  const accentStyles =
    accent === 'cyan'
      ? 'bg-cyan-100 text-cyan-600'
      : 'bg-emerald-100 text-emerald-600'

  return (
    <div className="flex items-start gap-4 rounded-2xl bg-white p-4">
      <div className={`rounded-lg p-2 ${accentStyles}`}>
        <CheckIcon />
      </div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="mt-1 text-sm text-zinc-600">{description}</p>
      </div>
    </div>
  )
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-200">
        {icon}
      </div>
      <div>
        <div className="text-sm text-zinc-500">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  )
}

function StatusBadge({
  status,
}: {
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}) {
  const styles =
    status === 'PUBLISHED'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'ARCHIVED'
        ? 'bg-zinc-200 text-zinc-700'
        : 'bg-amber-100 text-amber-700'

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {status}
    </span>
  )
}

function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        available ? 'bg-cyan-100 text-cyan-700' : 'bg-rose-100 text-rose-700'
      }`}
    >
      {available ? 'Available' : 'Unavailable'}
    </span>
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
      <label className="mb-2 block text-sm font-medium text-zinc-700">
        {label}
      </label>
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
      <label className="mb-2 block text-sm font-medium text-zinc-700">
        {label}
      </label>
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
  onChange: (value: boolean) => void
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

function TextAreaField({
  label,
  onChange,
  placeholder = 'How can we help?',
  required = true,
  value,
}: {
  label: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  value: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700">
        {label}
      </label>
      <textarea
        className="min-h-32 w-full resize-none rounded-xl border border-zinc-200 p-4 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        value={value}
      />
    </div>
  )
}

function SocialCircle({ children }: { children: ReactNode }) {
  return (
    <a
      className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 transition-colors hover:bg-zinc-700"
      href="#"
    >
      {children}
    </a>
  )
}

function IconWrapper({
  children,
  className = '',
  viewBox = '0 0 24 24',
}: {
  children: ReactNode
  className?: string
  viewBox?: string
}) {
  return (
    <svg
      aria-hidden="true"
      className={`h-5 w-5 ${className}`.trim()}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox={viewBox}
    >
      {children}
    </svg>
  )
}

function ArrowRightIcon({ className = '' }: { className?: string }) {
  return (
    <IconWrapper className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </IconWrapper>
  )
}

function BedIcon({ className = '' }: { className?: string }) {
  return (
    <IconWrapper className={className}>
      <path d="M3 11V5h6a3 3 0 0 1 3 3v3" />
      <path d="M3 17v-3h18v3" />
      <path d="M4 17v2" />
      <path d="M20 17v2" />
      <path d="M12 11h6a3 3 0 0 1 3 3" />
    </IconWrapper>
  )
}

function CalendarIcon({ className = '' }: { className?: string }) {
  return (
    <IconWrapper className={className}>
      <rect height="16" rx="2" width="18" x="3" y="4" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </IconWrapper>
  )
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <IconWrapper className={className}>
      <path d="m5 12 5 5L20 7" />
    </IconWrapper>
  )
}

function ChevronDownIcon() {
  return (
    <IconWrapper>
      <path d="m6 9 6 6 6-6" />
    </IconWrapper>
  )
}

function ChevronUpIcon() {
  return (
    <IconWrapper>
      <path d="m18 15-6-6-6 6" />
    </IconWrapper>
  )
}

function ClockIcon({ className = '' }: { className?: string }) {
  return (
    <IconWrapper className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </IconWrapper>
  )
}

function CloseIcon() {
  return (
    <IconWrapper>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </IconWrapper>
  )
}

function GridIcon({ className = '' }: { className?: string }) {
  return (
    <IconWrapper className={className}>
      <rect height="7" rx="1" width="7" x="3" y="3" />
      <rect height="7" rx="1" width="7" x="14" y="3" />
      <rect height="7" rx="1" width="7" x="3" y="14" />
      <rect height="7" rx="1" width="7" x="14" y="14" />
    </IconWrapper>
  )
}

function InstagramIcon() {
  return (
    <IconWrapper>
      <rect height="16" rx="4" width="16" x="4" y="4" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M17.5 6.5h.01" />
    </IconWrapper>
  )
}

function LinkedInIcon() {
  return (
    <IconWrapper viewBox="0 0 24 24">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect height="12" width="4" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </IconWrapper>
  )
}

function MailIcon({ className = '' }: { className?: string }) {
  return (
    <IconWrapper className={className}>
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <path d="m4 7 8 6 8-6" />
    </IconWrapper>
  )
}

function MapPinIcon({ className = '' }: { className?: string }) {
  return (
    <IconWrapper className={className}>
      <path d="M12 21s-6-5.33-6-11a6 6 0 1 1 12 0c0 5.67-6 11-6 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </IconWrapper>
  )
}

function MenuIcon() {
  return (
    <IconWrapper>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </IconWrapper>
  )
}

function PhoneIcon({ className = '' }: { className?: string }) {
  return (
    <IconWrapper className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72l.34 2.71a2 2 0 0 1-.57 1.69L7.1 9.9a16 16 0 0 0 7 7l1.78-1.78a2 2 0 0 1 1.69-.57l2.71.34A2 2 0 0 1 22 16.92z" />
    </IconWrapper>
  )
}

function StarIcon({ className = '' }: { className?: string }) {
  return (
    <IconWrapper className={className}>
      <path d="m12 3 2.8 5.68 6.27.91-4.54 4.43 1.07 6.25L12 17.77l-5.6 2.5 1.07-6.25-4.54-4.43 6.27-.91L12 3Z" />
    </IconWrapper>
  )
}

function TwitterIcon() {
  return (
    <IconWrapper viewBox="0 0 24 24">
      <path d="M22 5.92c-.72.32-1.5.53-2.32.62a4.06 4.06 0 0 0 1.78-2.24 8.1 8.1 0 0 1-2.57.98A4.04 4.04 0 0 0 12 8.03c0 .32.03.63.1.93A11.46 11.46 0 0 1 3.64 4.7a4.03 4.03 0 0 0 1.25 5.39 4 4 0 0 1-1.83-.5v.05A4.05 4.05 0 0 0 6.3 13.6a4.1 4.1 0 0 1-1.82.07 4.04 4.04 0 0 0 3.78 2.8A8.1 8.1 0 0 1 2 18.18a11.44 11.44 0 0 0 6.18 1.81c7.42 0 11.48-6.15 11.48-11.48l-.01-.52A8.2 8.2 0 0 0 22 5.92Z" />
    </IconWrapper>
  )
}

function formatPrice(price: number) {
  return String(price)
}

export default App
