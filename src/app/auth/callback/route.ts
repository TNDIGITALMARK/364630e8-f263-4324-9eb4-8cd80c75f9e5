import { NextRequest, NextResponse } from 'next/server';

/**
 * Auth Callback Route Handler
 *
 * Simplified callback handler - email confirmation is disabled
 * Users are auto-confirmed on signup and don't need email verification
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get('next') ?? '/';

  console.log('🔐 Auth Callback: Redirecting to app (no email confirmation needed)');

  // Simply redirect to the requested destination or home
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
