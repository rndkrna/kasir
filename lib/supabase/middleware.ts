import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run on login page to avoid redirect loops
  if (request.nextUrl.pathname.startsWith('/auth/login')) {
    return supabaseResponse
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl;

  // Protection for protected routes
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/riwayat') || 
    pathname.startsWith('/laporan') || 
    pathname.startsWith('/menu-management');

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Role based access
  if (user) {
    const role = user.user_metadata?.role;

    // Admin only routes
    const isAdminOnlyRoute = 
      pathname.startsWith('/laporan') || 
      pathname.startsWith('/menu-management');

    if (isAdminOnlyRoute && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
