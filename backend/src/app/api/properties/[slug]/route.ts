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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params
  const includeDrafts = new URL(request.url).searchParams.get('includeDrafts') === 'true'
  const auth = includeDrafts ? await requireUser(request) : null

  const property = await prisma.property.findUnique({
    where: { slug },
    include: propertyInclude,
  })

  if (!property) {
    return errorResponse(404, 'Property not found')
  }

  const canSeeDraft =
    auth &&
    (auth.user.role === UserRole.ADMIN ||
      (auth.user.role === UserRole.OWNER && property.ownerId === auth.user.id))

  if (property.status !== PropertyStatus.PUBLISHED && !canSeeDraft) {
    return errorResponse(404, 'Property not found')
  }

  return json({ property: serializeProperty(property) })
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await requireUser(request)
  if (!auth) {
    return errorResponse(401, 'Unauthorized')
  }

  const { slug } = await context.params
  const existing = await prisma.property.findUnique({ where: { slug } })
  if (!existing) {
    return errorResponse(404, 'Property not found')
  }

  const isOwner = existing.ownerId === auth.user.id
  if (!isOwner && auth.user.role !== UserRole.ADMIN) {
    return errorResponse(403, 'Forbidden')
  }

  const body = await request.json().catch(() => null)
  const parsed = propertyCreateSchema.partial().safeParse(body)
  if (!parsed.success) {
    return errorResponse(400, parsed.error.issues[0]?.message ?? 'Invalid request body')
  }

  const data = parsed.data
  const {
    images,
    amenities,
    status,
    ...rest
  } = data
  const amenityLinks =
    amenities &&
    (await Promise.all(
      amenities.map(async (name) => {
        const amenity = await prisma.amenity.upsert({
          where: { name },
          update: {},
          create: { name },
        })
        return { amenityId: amenity.id }
      }),
    ))

  const property = await prisma.property.update({
    where: { slug },
    data: {
      ...rest,
      status,
      publishedAt:
        status === PropertyStatus.PUBLISHED && !existing.publishedAt
          ? new Date()
          : existing.publishedAt,
      images: images
        ? {
            deleteMany: {},
            create: images.map((image) => ({
              url: image.url,
              alt: image.alt,
              sortOrder: image.sortOrder,
            })),
          }
        : undefined,
      amenities: amenityLinks
        ? {
            deleteMany: {},
            create: amenityLinks,
          }
        : undefined,
    },
    include: propertyInclude,
  })

  return json({ property: serializeProperty(property) })
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const auth = await requireUser(request)
  if (!auth) {
    return errorResponse(401, 'Unauthorized')
  }

  const { slug } = await context.params
  const existing = await prisma.property.findUnique({ where: { slug } })
  if (!existing) {
    return errorResponse(404, 'Property not found')
  }

  const isOwner = existing.ownerId === auth.user.id
  if (!isOwner && auth.user.role !== UserRole.ADMIN) {
    return errorResponse(403, 'Forbidden')
  }

  await prisma.property.delete({ where: { slug } })
  return json({ success: true })
}
