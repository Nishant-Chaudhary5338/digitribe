import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE_NAME = 'digitribe_theme'

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname !== '/') return NextResponse.next()

  const theme = request.cookies.get(COOKIE_NAME)?.value

  if (theme === 'studio') {
    return NextResponse.redirect(new URL('/dtc', request.url))
  }
  if (theme === 'garden') {
    return NextResponse.redirect(new URL('/saas', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/',
}
