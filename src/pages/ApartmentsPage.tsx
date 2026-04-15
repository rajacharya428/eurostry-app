import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SiteFooter, SiteHeader } from '../components/SiteChrome'
import { parseTransportDetails, TransportBadge } from '../components/TransportBadge'
import { trackPropertyEvent } from '../lib/propertyEvents'
import { usePageMeta } from '../lib/seo'
import '../App.css'

type RentalType = 'short' | 'long'
type FurnishingStatus = 'FURNISHED' | 'UNFURNISHED'

type Property = {
  id: string
  slug: string
  title: string
  location: string
  mapQuery?: string
  transportDetails?: string
  city: string
  country: string
  bedrooms: number
  bathrooms: number
  squareMeters: number
  furnishingStatus: FurnishingStatus
  price: number
  rental_type: RentalType
  image_url: string
  description: string
  amenities: string[]
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
  furnishingStatus: FurnishingStatus
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  available: boolean
  images: { url: string }[]
  description: string
  amenities: string[]
}

const API_BASE_URL = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000')

const fallbackProperties: Property[] = [
  {
    id: '8af68080-e5dd-4331-bd8d-c211e0e102eb',
    slug: 'paris-apartment-marais-district',
    title: 'Paris Apartment - Marais District',
    location: 'Paris, France',
    mapQuery: '16 Rue des Francs Bourgeois, 75003 Paris, France',
    transportDetails:
      'Metro 1 Saint-Paul | 5 min walk\nBus 29, 96 | 3 min walk\nChatelet-Les Halles RER | 14 min by metro',
    city: 'Paris',
    country: 'France',
    bedrooms: 2,
    bathrooms: 1,
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
    city: 'Paris',
    country: 'France',
    bedrooms: 0,
    bathrooms: 1,
    squareMeters: 28,
    furnishingStatus: 'FURNISHED',
    price: 85,
    rental_type: 'short',
    image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    description:
      'Sleek modern studio perfect for business travelers, close to the business district.',
    amenities: ['WiFi', 'Workspace', 'Heating'],
  },
  {
    id: 'seed-sunlit-one-bedroom-batignolles',
    slug: 'sunlit-one-bedroom-batignolles',
    title: 'Sunlit One Bedroom - Batignolles',
    location: 'Batignolles, Paris, France',
    mapQuery: 'Batignolles, 75017 Paris, France',
    transportDetails:
      'Metro 13 Brochant | 6 min walk\nBus 66 | 4 min walk\nPont Cardinet train station | 10 min walk',
    city: 'Paris',
    country: 'France',
    bedrooms: 1,
    bathrooms: 1,
    squareMeters: 43,
    furnishingStatus: 'FURNISHED',
    price: 1450,
    rental_type: 'long',
    image_url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800',
    description:
      'Bright one-bedroom apartment with high ceilings, a separate kitchen, and quick metro access for everyday Paris living.',
    amenities: ['WiFi', 'Kitchen', 'Heating'],
  },
  {
    id: 'seed-family-flat-boulogne',
    slug: 'family-flat-boulogne',
    title: 'Family Flat - Boulogne',
    location: 'Boulogne-Billancourt, France',
    mapQuery: 'Boulogne-Billancourt, France',
    transportDetails:
      'Metro 10 Boulogne Jean Jaures | 7 min walk\nBus 52, 72 | 4 min walk\nTram T2 | 11 min walk',
    city: 'Boulogne-Billancourt',
    country: 'France',
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 96,
    furnishingStatus: 'UNFURNISHED',
    price: 2300,
    rental_type: 'long',
    image_url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
    description:
      'Three-bedroom apartment with generous living spaces, balcony access, and storage, ideal for a long-term family setup.',
    amenities: ['WiFi', 'Kitchen', 'Parking', 'Heating'],
  },
  {
    id: 'seed-canal-saint-martin-designer-studio',
    slug: 'canal-saint-martin-designer-studio',
    title: 'Designer Studio - Canal Saint-Martin',
    location: 'Canal Saint-Martin, Paris, France',
    mapQuery: 'Canal Saint-Martin, Paris, France',
    transportDetails:
      'Metro 5 Jacques Bonsergent | 5 min walk\nBus 75 | 3 min walk\nGare de l Est | 12 min walk',
    city: 'Paris',
    country: 'France',
    bedrooms: 0,
    bathrooms: 1,
    squareMeters: 24,
    furnishingStatus: 'FURNISHED',
    price: 110,
    rental_type: 'short',
    image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
    description:
      'Compact but polished studio with custom storage, a work nook, and a fully equipped kitchenette for short city stays.',
    amenities: ['WiFi', 'Workspace', 'Heating'],
  },
  {
    id: 'seed-executive-two-bedroom-levallois',
    slug: 'executive-two-bedroom-levallois',
    title: 'Executive Two Bedroom - Levallois',
    location: 'Levallois-Perret, France',
    mapQuery: 'Levallois-Perret, France',
    transportDetails:
      'Metro 3 Anatole France | 6 min walk\nBus 174 | 3 min walk\nClichy-Levallois train station | 12 min walk',
    city: 'Levallois-Perret',
    country: 'France',
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 58,
    furnishingStatus: 'FURNISHED',
    price: 1750,
    rental_type: 'long',
    image_url: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800',
    description:
      'Two-bedroom executive apartment with modern finishes, strong natural light, and flexible lease terms for business relocations.',
    amenities: ['WiFi', 'Workspace', 'Washer', 'Heating'],
  },
]

function resolveAssetUrl(url: string) {
  if (!url) {
    return ''
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  return API_BASE_URL ? `${API_BASE_URL}${url}` : url
}

function mapBackendProperty(property: BackendProperty): Property {
  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    location: property.location,
    mapQuery: property.mapQuery ?? undefined,
    transportDetails: property.transportDetails ?? undefined,
    city: property.city,
    country: property.country,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    squareMeters: property.squareMeters,
    furnishingStatus: property.furnishingStatus,
    price: Math.round(property.priceCents / 100),
    rental_type: property.rentalType === 'SHORT_TERM' ? 'short' : 'long',
    image_url: resolveAssetUrl(property.images[0]?.url ?? ''),
    description: property.description,
    amenities: property.amenities,
  }
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

function formatApartmentType(bedrooms: number) {
  if (bedrooms === 0) {
    return 'Studio'
  }

  return bedrooms === 1 ? '1 Bedroom' : `${bedrooms} Bedrooms`
}

function matchesBedroomType(bedrooms: number, filter: string) {
  switch (filter) {
    case 'studio':
      return bedrooms === 0
    case '1':
      return bedrooms === 1
    case '2':
      return bedrooms === 2
    case '3':
      return bedrooms === 3
    case '4+':
      return bedrooms >= 4
    default:
      return true
  }
}

function buildPropertyInquiryUrl(
  property: Property,
  intent: 'contact' | 'booking',
) {
  trackPropertyEvent({
    propertyId: property.id,
    propertySlug: property.slug,
    eventType: intent === 'booking' ? 'BOOKING_CLICKED' : 'CONTACT_CLICKED',
    page: '/apartments',
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

  return `/contact?${search}`
}

function buildMapEmbedUrl(location: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=15&output=embed`
}


export default function ApartmentsPage() {
  usePageMeta({
    title: 'Apartments',
    description: 'Browse furnished and unfurnished apartments with filters for price, location, size, and rental type.',
    path: '/apartments',
  })

  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState<Property[]>(fallbackProperties)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

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
      page: '/apartments',
    })
  }, [selectedProperty])

  useEffect(() => {
    void fetchProperties()
  }, [])

  const location = searchParams.get('location') ?? ''
  const furnishing = searchParams.get('furnishing') ?? 'ALL'
  const minPrice = searchParams.get('minPrice') ?? ''
  const maxPrice = searchParams.get('maxPrice') ?? ''
  const minSquareMeters = searchParams.get('minSquareMeters') ?? ''
  const maxSquareMeters = searchParams.get('maxSquareMeters') ?? ''
  const bedroomType = searchParams.get('bedroomType') ?? 'ALL'
  const rentalType = searchParams.get('rentalType') ?? 'ALL'

  const filteredProperties = useMemo(() => {
    const locationValue = location.trim().toLowerCase()
    const minPriceValue = minPrice ? Number(minPrice) : null
    const maxPriceValue = maxPrice ? Number(maxPrice) : null
    const minSquareMetersValue = minSquareMeters ? Number(minSquareMeters) : null
    const maxSquareMetersValue = maxSquareMeters ? Number(maxSquareMeters) : null

    return properties.filter((property) => {
      const matchesLocation =
        !locationValue ||
        [property.title, property.location, property.city, property.country].some((value) =>
          value.toLowerCase().includes(locationValue),
        )

      const matchesFurnishing =
        furnishing === 'ALL' || property.furnishingStatus === furnishing

      const matchesRentalType =
        rentalType === 'ALL' ||
        property.rental_type === (rentalType === 'SHORT_TERM' ? 'short' : 'long')

      const matchesPrice =
        (minPriceValue === null || property.price >= minPriceValue) &&
        (maxPriceValue === null || property.price <= maxPriceValue)

      const matchesSquareMeters =
        (minSquareMetersValue === null || property.squareMeters >= minSquareMetersValue) &&
        (maxSquareMetersValue === null || property.squareMeters <= maxSquareMetersValue)

      return (
        matchesLocation &&
        matchesFurnishing &&
        matchesRentalType &&
        matchesPrice &&
        matchesSquareMeters &&
        matchesBedroomType(property.bedrooms, bedroomType)
      )
    })
  }, [
    bedroomType,
    furnishing,
    location,
    maxPrice,
    maxSquareMeters,
    minPrice,
    minSquareMeters,
    properties,
    rentalType,
  ])

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'ALL') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    setSearchParams(next)
  }

  const clearFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const fetchProperties = async () => {
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/properties`)
      const data = await readJsonResponse<{ properties?: BackendProperty[] }>(response)

      if (!response.ok || !data?.properties) {
        throw new Error('Failed to load apartments')
      }

      setProperties(data.properties.map(mapBackendProperty))
      setError(null)
    } catch {
      setError('Using fallback apartments because the backend is unavailable.')
      setProperties(fallbackProperties)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_28%,#f8fafc_100%)] font-sans text-zinc-900 antialiased">
      <SiteHeader />

      <main className="px-6 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Apartment Research
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                Apartments
              </h1>
            </div>
            <button
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium transition-all hover:border-zinc-400"
              onClick={clearFilters}
              type="button"
            >
              Clear Filters
            </button>
          </div>

          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FilterField
                label="Location"
                placeholder="Paris, Marseille, Lyon..."
                value={location}
                onChange={(value) => updateFilter('location', value)}
              />
              <SelectField
                label="Rental Type"
                value={rentalType}
                onChange={(value) => updateFilter('rentalType', value)}
                options={[
                  { label: 'All rentals', value: 'ALL' },
                  { label: 'Short term', value: 'SHORT_TERM' },
                  { label: 'Long term', value: 'LONG_TERM' },
                ]}
              />
              <SelectField
                label="Furnished"
                value={furnishing}
                onChange={(value) => updateFilter('furnishing', value)}
                options={[
                  { label: 'All', value: 'ALL' },
                  { label: 'Meuble', value: 'FURNISHED' },
                  { label: 'Non meuble', value: 'UNFURNISHED' },
                ]}
              />
              <SelectField
                label="Apartment Type"
                value={bedroomType}
                onChange={(value) => updateFilter('bedroomType', value)}
                options={[
                  { label: 'All types', value: 'ALL' },
                  { label: 'Studio', value: 'studio' },
                  { label: '1 bedroom', value: '1' },
                  { label: '2 bedroom', value: '2' },
                  { label: '3 bedroom', value: '3' },
                  { label: '4+ bedroom', value: '4+' },
                ]}
              />
              <FilterField
                label="Min Price"
                placeholder="0"
                type="number"
                value={minPrice}
                onChange={(value) => updateFilter('minPrice', value)}
              />
              <FilterField
                label="Max Price"
                placeholder="5000"
                type="number"
                value={maxPrice}
                onChange={(value) => updateFilter('maxPrice', value)}
              />
              <FilterField
                label="Min m2"
                placeholder="20"
                type="number"
                value={minSquareMeters}
                onChange={(value) => updateFilter('minSquareMeters', value)}
              />
              <FilterField
                label="Max m2"
                placeholder="120"
                type="number"
                value={maxSquareMeters}
                onChange={(value) => updateFilter('maxSquareMeters', value)}
              />
            </div>
          </section>

          {error ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {error}
            </div>
          ) : null}

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="text-lg font-semibold">
              {loading ? 'Loading apartments...' : `${filteredProperties.length} apartments`}
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProperties.map((property) => (
              <article
                className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                key={property.id}
              >
                <button
                  className="block w-full text-left"
                  onClick={() => setSelectedProperty(property)}
                  type="button"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      alt={property.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={property.image_url}
                    />
                    <div className="absolute left-4 top-4 flex gap-2">
                      <Tag
                        label={property.rental_type === 'short' ? 'Short Term' : 'Long Term'}
                        tone={property.rental_type === 'short' ? 'cyan' : 'emerald'}
                      />
                      <Tag
                        label={
                          property.furnishingStatus === 'FURNISHED'
                            ? 'Meuble'
                            : 'Non meuble'
                        }
                        tone="slate"
                      />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold">{property.title}</h3>
                    <div className="mt-2 text-sm text-zinc-500">{property.location}</div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-zinc-600">
                      <div>{formatApartmentType(property.bedrooms)}</div>
                      <div>{property.squareMeters} m2</div>
                      <div>{property.bathrooms} bath</div>
                      <div>{property.price} EUR</div>
                    </div>
                  </div>
                </button>
              </article>
            ))}
          </div>

          {!loading && filteredProperties.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center">
              <h3 className="text-xl font-semibold">No apartments match those filters</h3>
            </div>
          ) : null}
        </div>
      </main>

      <SiteFooter />

      {selectedProperty ? (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedProperty(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative">
              <img
                alt={selectedProperty.title}
                className="h-72 w-full object-cover"
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
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-3xl font-bold">{selectedProperty.title}</h2>
                  <div className="mt-2 text-zinc-500">{selectedProperty.location}</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Tag label={formatApartmentType(selectedProperty.bedrooms)} tone="slate" />
                    <Tag label={`${selectedProperty.squareMeters} m2`} tone="slate" />
                    <Tag
                      label={
                        selectedProperty.furnishingStatus === 'FURNISHED'
                          ? 'Meuble'
                          : 'Non meuble'
                      }
                      tone="slate"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{selectedProperty.price} EUR</div>
                  <div className="text-zinc-500">
                    /{selectedProperty.rental_type === 'short' ? 'night' : 'month'}
                  </div>
                </div>
              </div>

              <p className="mt-6 leading-8 text-zinc-600">{selectedProperty.description}</p>

              <div className="mt-6">
                <h3 className="font-semibold">Amenities</h3>
                <div className="mt-3 flex flex-wrap gap-2">
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
                          <div className="flex items-center gap-3">
                            <TransportBadge title={item.title} />
                            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                              {item.title}
                            </div>
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

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-emerald-500/25"
                  to={buildPropertyInquiryUrl(selectedProperty, 'booking')}
                >
                  Book Now
                </Link>
                <Link
                  className="rounded-xl border border-zinc-200 px-5 py-3 font-medium transition-colors hover:border-zinc-400"
                  to={buildPropertyInquiryUrl(selectedProperty, 'contact')}
                >
                  Contact Apartment
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}


function FilterField({
  label,
  onChange,
  placeholder,
  type = 'text',
  value,
}: {
  label: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
  value: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700">{label}</label>
      <input
        className="w-full rounded-xl border border-zinc-200 p-3.5 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-cyan-500"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
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
      <label className="mb-2 block text-sm font-medium text-zinc-700">{label}</label>
      <select
        className="w-full rounded-xl border border-zinc-200 bg-white p-3.5 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-cyan-500"
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

function Tag({
  label,
  tone,
}: {
  label: string
  tone: 'cyan' | 'emerald' | 'slate'
}) {
  const toneClass =
    tone === 'cyan'
      ? 'bg-cyan-500 text-white'
      : tone === 'emerald'
        ? 'bg-emerald-500 text-white'
        : 'bg-white/90 text-zinc-700'

  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${toneClass}`}>{label}</span>
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
