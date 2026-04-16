import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

function getAllowedOrigins() {
  const configuredOrigins = [
    process.env.FRONTEND_APP_URL,
    process.env.VITE_SITE_URL,
    process.env.SITE_URL,
    'https://eurostrygroup.com',
    'https://www.eurostrygroup.com',
    'https://eurostry-app.vercel.app',
  ]

  return configuredOrigins.filter((value): value is string => Boolean(value))
}

function applyCorsHeaders(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigins = getAllowedOrigins()

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Vary', 'Origin')

  return response
}

export function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return applyCorsHeaders(new NextResponse(null, { status: 204 }), request)
  }

  return applyCorsHeaders(NextResponse.next(), request)
}

export const config = {
  matcher: ['/api/:path*'],
}
