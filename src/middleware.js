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
    '/forgot-password',
    '/reset-password',
    '/employee/personal-details',
    '/employee/personal-summary',
    '/employee/work-experience',
    '/employee/availability',
    '/employer/personal-details',
    '/employer/business-details',
    '/employer/business-summary',
    '/employer/availability',
  ];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Protected routes - removed for now since we're using localStorage for tokens
  // The home page will handle the redirect if user is not authenticated
  const protectedRoutes = [];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // If trying to access protected route without token
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login/role-selection', request.url));
  }

  // Don't redirect if user has token in cookies and accessing login pages
  if (token && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
