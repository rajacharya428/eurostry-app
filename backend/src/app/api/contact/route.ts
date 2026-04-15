import { UserRole } from '@prisma/client'
import type { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { errorResponse, json } from '@/lib/http'
import { sendContactNotification } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'
import { contactMessageSchema } from '@/lib/validators'

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth || auth.user.role !== UserRole.ADMIN) {
    return errorResponse(403, 'Forbidden')
  }

  const contactMessages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return json({ contactMessages })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = contactMessageSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse(400, parsed.error.issues[0]?.message ?? 'Invalid request body')
  }

  const contactMessage = await prisma.contactMessage.create({
    data: parsed.data,
  })

  await sendContactNotification({ contactMessage }).catch(() => undefined)

  return json({ contactMessage }, { status: 201 })
}
