import { PropertyStatus, UserRole } from '@prisma/client'
import type { NextRequest } from 'next/server'
import { requireUser } from '@/lib/auth'
import { errorResponse, json } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { serializeProperty } from '@/lib/serializers'
import { propertyCreateSchema } from '@/lib/validators'

const propertyInclude = {
  owner: true,
  images: {
    orderBy: { sortOrder: 'asc' as const },
  },
  amenities: {
    include: { amenity: true },
  },
}

function parseOptionalNumber(value: string | null) {
  if (value === null || value.trim() === '') {
    return undefined
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rentalTypeParam = searchParams.get('rentalType')
  const city = searchParams.get('city') ?? undefined
  const location = searchParams.get('location') ?? undefined
  const available = searchParams.get('available')
  const ownerId = searchParams.get('ownerId') ?? undefined
  const furnishingStatusParam = searchParams.get('furnishingStatus')
  const minPrice = parseOptionalNumber(searchParams.get('minPrice'))
  const maxPrice = parseOptionalNumber(searchParams.get('maxPrice'))
  const minSquareMeters = parseOptionalNumber(searchParams.get('minSquareMeters'))
  const maxSquareMeters = parseOptionalNumber(searchParams.get('maxSquareMeters'))
  const bedrooms = parseOptionalNumber(searchParams.get('bedrooms'))
  const includeDrafts = searchParams.get('includeDrafts') === 'true'
  const rentalType =
    rentalTypeParam === 'SHORT_TERM' || rentalTypeParam === 'LONG_TERM'
      ? rentalTypeParam
      : undefined
  const furnishingStatus =
    furnishingStatusParam === 'FURNISHED' || furnishingStatusParam === 'UNFURNISHED'
      ? furnishingStatusParam
      : undefined

  const auth = includeDrafts ? await requireUser(request) : null
  const canSeeDrafts = auth && auth.user.role !== UserRole.TENANT

  if (includeDrafts && !canSeeDrafts) {
    return errorResponse(403, 'Forbidden')
  }

  if (
    includeDrafts &&
    auth?.user.role === UserRole.OWNER &&
    ownerId &&
    ownerId !== auth.user.id
  ) {
    return errorResponse(403, 'Owners can only view their own properties')
  }

  const ownerFilter =
    includeDrafts && auth?.user.role === UserRole.OWNER
      ? auth.user.id
      : ownerId

  const properties = await prisma.property.findMany({
    where: {
      rentalType,
      city,
      furnishingStatus,
      ownerId: ownerFilter,
      available: available === null ? undefined : available === 'true',
      bedrooms,
      priceCents:
        minPrice !== undefined || maxPrice !== undefined
          ? {
              gte: minPrice,
              lte: maxPrice,
            }
          : undefined,
      squareMeters:
        minSquareMeters !== undefined || maxSquareMeters !== undefined
          ? {
              gte: minSquareMeters,
              lte: maxSquareMeters,
            }
          : undefined,
      OR: location
        ? [
            { location: { contains: location, mode: 'insensitive' } },
            { city: { contains: location, mode: 'insensitive' } },
            { country: { contains: location, mode: 'insensitive' } },
            { title: { contains: location, mode: 'insensitive' } },
          ]
        : undefined,
      status:
        includeDrafts && canSeeDrafts ? undefined : PropertyStatus.PUBLISHED,
    },
    include: propertyInclude,
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  })

  return json({ properties: properties.map(serializeProperty) })
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(request)
  if (!auth) {
    return errorResponse(401, 'Unauthorized')
  }

  if (auth.user.role !== UserRole.ADMIN && auth.user.role !== UserRole.OWNER) {
    return errorResponse(403, 'Only owners or admins can create properties')
  }

  const body = await request.json().catch(() => null)
  const parsed = propertyCreateSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(400, parsed.error.issues[0]?.message ?? 'Invalid request body')
  }

  const data = parsed.data
  const property = await prisma.property.create({
    data: {
      ownerId: auth.user.id,
      slug: data.slug,
      title: data.title,
      summary: data.summary,
      description: data.description,
      location: data.location,
      mapQuery: data.mapQuery,
      transportDetails: data.transportDetails,
      city: data.city,
      country: data.country,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      squareMeters: data.squareMeters,
      maxGuests: data.maxGuests,
      priceCents: data.priceCents,
      currency: data.currency,
      rentalType: data.rentalType,
      furnishingStatus: data.furnishingStatus,
      status: data.status,
      available: data.available,
      publishedAt:
        data.status === PropertyStatus.PUBLISHED ? new Date() : null,
      images: {
        create: data.images.map((image) => ({
          url: image.url,
          alt: image.alt,
          sortOrder: image.sortOrder,
        })),
      },
      amenities: {
        create: await Promise.all(
          data.amenities.map(async (name) => {
            const amenity = await prisma.amenity.upsert({
              where: { name },
              update: {},
              create: { name },
            })
            return { amenityId: amenity.id }
          }),
        ),
      },
    },
    include: propertyInclude,
  })

  return json({ property: serializeProperty(property) }, { status: 201 })
}
