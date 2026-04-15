import type { Property, PropertyImage, User, Amenity } from '@prisma/client'
import { toSafeUser } from '@/lib/auth'

type PropertyWithRelations = Property & {
  owner: User
  images: PropertyImage[]
  amenities: { amenity: Amenity }[]
}

export function serializeProperty(property: PropertyWithRelations) {
  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    summary: property.summary,
    description: property.description,
    location: property.location,
    mapQuery: property.mapQuery,
    transportDetails: property.transportDetails,
    city: property.city,
    country: property.country,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    squareMeters: property.squareMeters,
    maxGuests: property.maxGuests,
    priceCents: property.priceCents,
    currency: property.currency,
    rentalType: property.rentalType,
    furnishingStatus: property.furnishingStatus,
    status: property.status,
    available: property.available,
    publishedAt: property.publishedAt,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    owner: toSafeUser(property.owner),
    images: property.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      sortOrder: image.sortOrder,
    })),
    amenities: property.amenities.map(({ amenity }) => amenity.name),
  }
}
