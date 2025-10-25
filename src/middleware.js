import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login', 
    '/signup', 
    '/signup/role-selection', 
    '/signup/subscription',
    '/job-hunter/personal-details',
    '/job-hunter/personal-summary',
    '/job-hunter/work-experience',
    '/job-hunter/availability',
  ];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Protected routes
  const protectedRoutes = ['/dashboard', '/job-hunter/search-jobs'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // If trying to access protected route without token
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in and trying to access login/signup, redirect to appropriate dashboard
  if (token && (pathname === '/login' || pathname === '/signup')) {
    const decoded = verifyToken(token);
    if (decoded) {
      if (decoded.role === 'job-hunter') {
        return NextResponse.redirect(new URL('/job-hunter/search-jobs', request.url));
      } else if (decoded.role === 'head-hunter') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
