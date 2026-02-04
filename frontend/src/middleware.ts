import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Get the session/token from cookies
  // Note: Ensure your AuthContext saves the token in a cookie named 'pb_auth' or similar
  const session = request.cookies.get('pb_auth')?.value;
  const { pathname } = request.nextUrl;

  // 2. Define public paths (Login page and assets)
  const isAuthPage = pathname.startsWith('/auth/login');
  const isPublicAsset = pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/);

  // 3. Logic: If no session and trying to access dashboard -> Redirect to Login
  if (!session && !isAuthPage && !isPublicAsset) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 4. Logic: If logged in and trying to access login page -> Redirect to Dashboard
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// MATCH ALL DASHBOARD ROUTES
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/auth/login',
  ],
};