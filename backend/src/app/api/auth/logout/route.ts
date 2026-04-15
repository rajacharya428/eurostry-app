import type { NextRequest } from 'next/server'
import { clearSessionCookie, getSessionToken } from '@/lib/auth'
import { json } from '@/lib/http'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const token = getSessionToken(request)

  if (token) {
    await prisma.session.deleteMany({ where: { token } })
  }

  const response = json({ success: true })
  clearSessionCookie(response)
  return response
}
