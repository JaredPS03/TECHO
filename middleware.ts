import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple rate limiting store in memory (Note: In production with multiple instances, use Redis)
const rateLimit = new Map()

export function middleware(request: NextRequest) {
  // Get IP
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown'
  
  // Rate limiting logic for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const now = Date.now()
    const windowStart = now - 60000 // 1 minute window
    
    // Clean up old entries
    const userRequests = rateLimit.get(ip) || []
    const recentRequests = userRequests.filter((time: number) => time > windowStart)
    
    // Strict limit on login (5 per minute) to prevent brute force
    if (request.nextUrl.pathname.startsWith('/api/admin/login')) {
      if (recentRequests.length >= 5) {
        return new NextResponse(
          JSON.stringify({ error: 'Too many login attempts. Please try again later.' }),
          { status: 429, headers: { 'content-type': 'application/json' } }
        )
      }
    } 
    // Standard limit for other APIs (100 per minute)
    else if (recentRequests.length >= 100) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { 'content-type': 'application/json' } }
      )
    }
    
    recentRequests.push(now)
    rateLimit.set(ip, recentRequests)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
