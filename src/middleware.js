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

  // Protected routes
  const protectedRoutes = ['/home', '/dashboard'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // If trying to access protected route without token
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login/role-selection', request.url));
  }

  // If logged in and trying to access login/signup, redirect to home
  if (token && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
