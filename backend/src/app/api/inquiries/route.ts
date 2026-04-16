import { UserRole } from '@prisma/client'
import type { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { errorResponse, json } from '@/lib/http'
import { sendInquiryNotification } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'
import { inquiryCreateSchema } from '@/lib/validators'

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) {
    return errorResponse(401, 'Unauthorized')
  }

  const inquiries = await prisma.inquiry.findMany({
    where:
      auth.user.role === UserRole.ADMIN
        ? undefined
        : auth.user.role === UserRole.OWNER
          ? {
              property: {
                ownerId: auth.user.id,
              },
            }
          : {
              userId: auth.user.id,
            },
    include: {
      property: true,
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return json({ inquiries })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = inquiryCreateSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(400, parsed.error.issues[0]?.message ?? 'Invalid request body')
  }

  const auth = await getAuthenticatedUser(request)
  const { propertyId, propertySlug, requestedEndDate, requestedStartDate, ...rest } = parsed.data

  const propertyById = propertyId
    ? await prisma.property.findUnique({
        where: { id: propertyId },
        include: { owner: true },
      })
    : null

  const property = propertyById ?? (propertySlug
    ? await prisma.property.findUnique({
        where: { slug: propertySlug },
        include: { owner: true },
      })
    : null)

  if (!property) {
    return errorResponse(404, 'Property not found')
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      propertyId: property.id,
      userId: auth?.user.id,
      requestedStartDate: requestedStartDate ? new Date(`${requestedStartDate}T12:00:00.000Z`) : undefined,
      requestedEndDate: requestedEndDate ? new Date(`${requestedEndDate}T12:00:00.000Z`) : undefined,
      ...rest,
    },
  })

  const emailResult = await sendInquiryNotification({
    inquiry,
    property: {
      id: property.id,
      slug: property.slug,
      title: property.title,
      location: property.location,
    },
  }).catch(() => ({ delivered: false as const, reason: 'send_failed' as const }))

  return json({ inquiry, notification: emailResult }, { status: 201 })
}
