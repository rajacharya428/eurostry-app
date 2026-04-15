import { UserRole } from '@prisma/client'
import type { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { errorResponse, json } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { serializeProperty } from '@/lib/serializers'

const propertyInclude = {
  owner: true,
  images: {
    orderBy: { sortOrder: 'asc' as const },
  },
  amenities: {
    include: { amenity: true },
  },
}

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth || (auth.user.role !== UserRole.ADMIN && auth.user.role !== UserRole.OWNER)) {
    return errorResponse(403, 'Forbidden')
  }

  const propertyWhere =
    auth.user.role === UserRole.OWNER ? { ownerId: auth.user.id } : undefined

  const [properties, propertyCount, publishedCount, draftCount, archivedCount, inquiries, recentEvents, eventStats, contactMessages] =
    await Promise.all([
      prisma.property.findMany({
        where: propertyWhere,
        include: propertyInclude,
        orderBy: [{ updatedAt: 'desc' }],
        take: 50,
      }),
      prisma.property.count({ where: propertyWhere }),
      prisma.property.count({ where: { ...propertyWhere, status: 'PUBLISHED' } }),
      prisma.property.count({ where: { ...propertyWhere, status: 'DRAFT' } }),
      prisma.property.count({ where: { ...propertyWhere, status: 'ARCHIVED' } }),
      prisma.inquiry.findMany({
        where:
          auth.user.role === UserRole.OWNER
            ? {
                property: {
                  ownerId: auth.user.id,
                },
              }
            : undefined,
        include: {
          property: true,
          user: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.propertyEvent.findMany({
        where:
          auth.user.role === UserRole.OWNER
            ? {
                property: {
                  ownerId: auth.user.id,
                },
              }
            : undefined,
        include: {
          property: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.propertyEvent.groupBy({
        by: ['eventType'],
        where:
          auth.user.role === UserRole.OWNER
            ? {
                property: {
                  ownerId: auth.user.id,
                },
              }
            : undefined,
        _count: {
          _all: true,
        },
      }),
      auth.user.role === UserRole.ADMIN
        ? prisma.contactMessage.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
          })
        : Promise.resolve([]),
    ])

  const eventsByType = Object.fromEntries(
    eventStats.map((item) => [item.eventType, item._count._all]),
  )

  return json({
    summary: {
      propertyCount,
      publishedCount,
      draftCount,
      archivedCount,
      inquiryCount: inquiries.length,
      contactMessageCount: contactMessages.length,
      propertyOpenedCount: eventsByType.PROPERTY_OPENED ?? 0,
      contactClickCount: eventsByType.CONTACT_CLICKED ?? 0,
      bookingClickCount: eventsByType.BOOKING_CLICKED ?? 0,
    },
    properties: properties.map(serializeProperty),
    inquiries,
    contactMessages,
    recentEvents,
  })
}
