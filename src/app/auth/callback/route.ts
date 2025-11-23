import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Auth Callback Route Handler
 *
 * Handles email confirmation redirects from Supabase
 * When users click the confirmation link in their email, they're redirected here
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') ?? '/';

  console.log('🔐 Auth Callback: Processing email confirmation');
  console.log('   Type:', type);
  console.log('   Token Hash:', token_hash ? 'present' : 'missing');

  if (token_hash && type) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Create a Supabase client for server-side operations
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    try {
      // Verify the token hash
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      });

      if (error) {
        console.error('❌ Auth Callback: Verification failed', error);
        return NextResponse.redirect(
          `${requestUrl.origin}/auth?error=verification_failed&message=${encodeURIComponent(error.message)}`
        );
      }

      console.log('✅ Auth Callback: Email confirmed successfully');

      // Redirect to the app with success message
      return NextResponse.redirect(
        `${requestUrl.origin}/auth?confirmed=true&message=${encodeURIComponent('Email confirmed! You can now sign in.')}`
      );
    } catch (error: any) {
      console.error('❌ Auth Callback: Unexpected error', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/auth?error=unexpected_error&message=${encodeURIComponent('Something went wrong. Please try again.')}`
      );
    }
  }

  // No token hash - redirect to auth page
  console.warn('⚠️ Auth Callback: Missing token_hash or type');
  return NextResponse.redirect(`${requestUrl.origin}/auth`);
}
