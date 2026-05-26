import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/issues/new', '/profile/edit'];

export function middleware(request: NextRequest) {
  // Check both cookie and localStorage-synced cookie for auth token.
  // The authStore sets 'access_token' as a cookie so that edge middleware can read it.
  const token =
    request.cookies.get('access_token')?.value ||
    request.cookies.get('craq_authenticated')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/issues/new', '/profile/edit'],
};
