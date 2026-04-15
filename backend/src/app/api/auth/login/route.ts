import { NextResponse } from 'next/server'
import {
  attachSessionCookie,
  createSession,
  normalizeEmail,
  toSafeUser,
  verifyPassword,
} from '@/lib/auth'
import { errorResponse } from '@/lib/http'
import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validators'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse(400, parsed.error.issues[0]?.message ?? 'Invalid request body')
  }

  const { email, password } = parsed.data
  const normalizedEmail = normalizeEmail(email)
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

  if (!user?.passwordHash) {
    return errorResponse(401, 'Invalid email or password')
  }

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) {
    return errorResponse(401, 'Invalid email or password')
  }

  const session = await createSession(user.id)
  const response = NextResponse.json({ user: toSafeUser(user) })
  attachSessionCookie(response, session)
  return response
}
