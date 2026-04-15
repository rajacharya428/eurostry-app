import type { NextRequest } from 'next/server'
import { errorResponse, json } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { propertyEventCreateSchema } from '@/lib/validators'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = propertyEventCreateSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse(400, parsed.error.issues[0]?.message ?? 'Invalid request body')
  }

  const { propertyId, propertySlug, ...rest } = parsed.data

  const property = propertyId
    ? await prisma.property.findUnique({ where: { id: propertyId } })
    : propertySlug
      ? await prisma.property.findUnique({ where: { slug: propertySlug } })
      : null

  const event = await prisma.propertyEvent.create({
    data: {
      propertyId: property?.id,
      ...rest,
    },
    include: {
      property: true,
    },
  })

  return json({ event }, { status: 201 })
}
