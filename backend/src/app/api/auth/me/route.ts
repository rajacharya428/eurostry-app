import type { NextRequest } from 'next/server'
import { getAuthenticatedUser, toSafeUser } from '@/lib/auth'
import { errorResponse, json } from '@/lib/http'

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser(request)
  if (!auth) {
    return errorResponse(401, 'Unauthorized')
  }

  return json({ user: toSafeUser(auth.user) })
}
