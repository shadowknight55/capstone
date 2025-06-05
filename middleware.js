import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

// List of admin emails who can access admin routes
const ADMIN_EMAILS = [
  'admin@school.edu',
  'testadmin@gmail.com'  // Adding test admin email
];

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Debug: log the token and path
  console.log('MIDDLEWARE TOKEN:', token, 'PATH:', pathname);

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login/student', '/login/teacher', '/api/auth'];
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    const url = new URL('/', req.url);
    return NextResponse.redirect(url);
  }

  // Admin routes protection
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/admin')) {
    // Check both admin role and admin email list
    if (token.role !== 'admin' || !ADMIN_EMAILS.includes(token.email)) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return NextResponse.next();
  }

  // Role-based access control
  if (pathname.startsWith('/teacher') && token.role !== 'teacher') {
    const url = new URL('/', req.url);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/student') && token.role !== 'student') {
    const url = new URL('/', req.url);
    return NextResponse.redirect(url);
  }

  // Protect API routes
  if (pathname.startsWith('/api/teacher') && token.role !== 'teacher') {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/teacher/:path*',
    '/student/:path*',
    '/api/teacher/:path*',
    '/api/student/:path*',
    '/api/admin/:path*',
    '/admin/:path*'
  ]
}; 