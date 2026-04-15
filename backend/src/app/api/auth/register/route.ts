import { AuthProvider, UserRole } from '@prisma/client'
import { NextResponse } from 'next/server'
import {
  attachSessionCookie,
  createSession,
  hashPassword,
  normalizeEmail,
  toSafeUser,
} from '@/lib/auth'
import { errorResponse, json } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validators'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse(400, parsed.error.issues[0]?.message ?? 'Invalid request body')
  }

  const { email, password, firstName, lastName, phone } = parsed.data
  const normalizedEmail = normalizeEmail(email)

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existingUser) {
    return errorResponse(409, 'An account with this email already exists')
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      firstName,
      lastName,
      phone,
      role: UserRole.TENANT,
      passwordHash,
      accounts: {
        create: {
          provider: AuthProvider.CREDENTIALS,
          providerAccountId: normalizedEmail,
        },
      },
    },
  })

  const session = await createSession(user.id)
  const response = json({ user: toSafeUser(user) }, { status: 201 })
  attachSessionCookie(response, session)
  return response
}
