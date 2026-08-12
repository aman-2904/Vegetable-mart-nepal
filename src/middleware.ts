import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // First, run the Supabase middleware to refresh session
  const response = await updateSession(request)
  
  // Now handle route protection manually inside middleware 
  // because we need the session status *after* it's potentially refreshed
  
  const path = request.nextUrl.pathname;
  
  // Create a client purely for checking auth status in middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          // Ignore, handled by updateSession
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Protect /admin routes
  if (path.startsWith('/admin') && !path.startsWith('/admin/register')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profile?.role !== 'admin') {
      // If customer tries to access admin, send to shop
      return NextResponse.redirect(new URL('/shop', request.url))
    }
  }

  // 2. Protect auth routes (don't allow logged-in users to see login/register)
  if (['/login', '/register', '/admin/register', '/forgot-password'].includes(path)) {
    if (user) {
      // Fetch role to know where to send them
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else {
        return NextResponse.redirect(new URL('/shop', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
