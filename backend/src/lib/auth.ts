import { randomBytes } from 'node:crypto'
import type { Session, User, UserRole } from '@prisma/client'
import { compare, hash } from 'bcryptjs'
import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const SESSION_COOKIE = 'eurostry_session'
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7

function getCookieSettings(expires: Date) {
  const secure = process.env.NODE_ENV === 'production'
  // Production currently uses the Vercel backend URL from a separate frontend origin,
  // so the session cookie must be sent in cross-site requests.
  const sameSite = secure ? 'none' : 'lax'

  return {
    name: process.env.AUTH_COOKIE_NAME ?? SESSION_COOKIE,
    httpOnly: true,
    sameSite: sameSite as 'lax' | 'none',
    secure,
    path: '/',
    domain: process.env.AUTH_COOKIE_DOMAIN || undefined,
    expires,
  }
}

export type SafeUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  phone: string | null
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phone: user.phone,
    imageUrl: user.imageUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export async function hashPassword(password: string) {
  return hash(password, 12)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash)
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function createSession(userId: string) {
  const token = randomBytes(48).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  await prisma.session.deleteMany({
    where: {
      OR: [{ userId, expiresAt: { lt: new Date() } }],
    },
  })

  const session = await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  })

  return session
}

export function attachSessionCookie(response: NextResponse, session: Session) {
  response.cookies.set({
    ...getCookieSettings(session.expiresAt),
    value: session.token,
  })
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    ...getCookieSettings(new Date(0)),
    value: '',
  })
}

function extractBearerToken(request: NextRequest) {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) {
    return null
  }
  return header.slice(7)
}

export function getSessionToken(request: NextRequest) {
  const cookieName = process.env.AUTH_COOKIE_NAME ?? SESSION_COOKIE
  return request.cookies.get(cookieName)?.value ?? extractBearerToken(request)
}

export async function getAuthenticatedUser(request: NextRequest) {
  const token = getSessionToken(request)
  if (!token) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session) {
    return null
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } }).catch(() => undefined)
    return null
  }

  return { session, user: session.user }
}

export async function requireUser(request: NextRequest) {
  return getAuthenticatedUser(request)
}
