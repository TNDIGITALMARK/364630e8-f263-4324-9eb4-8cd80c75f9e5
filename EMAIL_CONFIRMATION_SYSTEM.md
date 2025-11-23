# Email Confirmation System

## Overview

The authentication system now includes a complete email confirmation flow that integrates with Supabase's built-in email verification system. Users who sign up receive a confirmation email and must verify their email address before they can sign in.

## How It Works

### 1. User Registration Flow

```
User submits signup form
  ↓
ZyloClient.signUp() called
  ↓
Tries Control Plane endpoint (if available)
  OR
Falls back to direct Supabase signup
  ↓
Supabase creates user with email_confirmed_at = NULL
  ↓
Supabase sends confirmation email to user
  ↓
Returns user object without session (no auto-login)
  ↓
UI displays "Check your email" message
```

### 2. Email Confirmation Flow

```
User receives email with confirmation link
  ↓
Clicks link in email
  ↓
Redirected to /auth/callback?token_hash=...&type=signup
  ↓
Server verifies token with Supabase
  ↓
Sets email_confirmed_at timestamp
  ↓
Redirects to /auth?confirmed=true&message=Email confirmed!
  ↓
UI displays success message on auth page
  ↓
User can now sign in
```

### 3. Login Flow (Confirmed Users)

```
User submits login form
  ↓
ZyloClient.login() called
  ↓
Supabase checks credentials and email_confirmed_at
  ↓
If email_confirmed_at is NULL → Error: "Email not confirmed"
  ↓
If email_confirmed_at is set → Success, session created
  ↓
User logged in and redirected to dashboard
```

## Implementation Details

### Modified Files

#### 1. `src/lib/zylo/client.ts`

**Added email confirmation handling:**

```typescript
// Check if email confirmation is required
if (signUpData.user && !signUpData.session) {
  // User created but email not confirmed - session won't be available
  console.log('📧 Zylo Client: Email confirmation required');
  throw new Error('CONFIRMATION_REQUIRED');
}
```

**Added email redirect configuration:**

```typescript
const { data: signUpData, error: signUpError } = await this.supabaseClient.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : undefined,
    data: { /* user metadata */ }
  }
});
```

#### 2. `src/app/auth/page.tsx`

**Added confirmation state management:**

```typescript
const [confirmationRequired, setConfirmationRequired] = useState(false);
const [userEmail, setUserEmail] = useState('');
const [successMessage, setSuccessMessage] = useState<string | null>(null);
```

**Added URL parameter handling for callback:**

```typescript
useEffect(() => {
  const confirmed = searchParams.get('confirmed');
  const errorParam = searchParams.get('error');
  const message = searchParams.get('message');

  if (confirmed === 'true' && message) {
    setSuccessMessage(decodeURIComponent(message));
  } else if (errorParam && message) {
    setError(decodeURIComponent(message));
  }
}, [searchParams]);
```

**Added confirmation required UI:**

```typescript
{confirmationRequired ? (
  <div className="space-y-4">
    <Alert className="border-primary bg-primary/10">
      <AlertDescription className="text-sm space-y-2">
        <p className="font-semibold text-primary">Check your email!</p>
        <p>We've sent a confirmation link to <strong>{userEmail}</strong></p>
        <p className="text-xs text-muted-foreground mt-2">
          Click the link in the email to activate your account. Once confirmed, you can sign in.
        </p>
      </AlertDescription>
    </Alert>
    <Button onClick={() => setConfirmationRequired(false)} variant="outline" className="w-full">
      Back to Sign Up
    </Button>
  </div>
) : (
  /* Signup form */
)}
```

**Enhanced login error handling:**

```typescript
if (err.message.includes('Email not confirmed') || err.message.includes('email_not_confirmed')) {
  setError('Please confirm your email address before signing in. Check your inbox for the confirmation link.');
}
```

#### 3. `src/app/auth/callback/route.ts` (NEW)

**Server-side email confirmation handler:**

```typescript
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');

  if (token_hash && type) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/auth?error=verification_failed&message=${encodeURIComponent(error.message)}`
      );
    }

    return NextResponse.redirect(
      `${requestUrl.origin}/auth?confirmed=true&message=${encodeURIComponent('Email confirmed! You can now sign in.')}`
    );
  }

  return NextResponse.redirect(`${requestUrl.origin}/auth`);
}
```

## User Experience

### Signup Experience

1. User fills out signup form with username and password
2. Submits form
3. Loading spinner appears: "Creating account..."
4. Success: UI shows purple alert box with message:
   ```
   Check your email!
   We've sent a confirmation link to xinali@veil.local

   Click the link in the email to activate your account. Once confirmed, you can sign in.
   ```
5. User can click "Back to Sign Up" to try with a different email

### Email Confirmation Experience

1. User receives email from Supabase with subject: "Confirm your signup"
2. Email contains a link: `https://yourapp.com/auth/callback?token_hash=...&type=signup`
3. User clicks the link
4. Browser shows brief loading state as server verifies token
5. Redirected to `/auth` page with success message:
   ```
   Email confirmed! You can now sign in.
   ```
6. Success message appears in purple at top of auth page
7. User can now sign in with their credentials

### Login Experience (Unconfirmed Email)

1. User tries to sign in before confirming email
2. Login fails with clear error message:
   ```
   Please confirm your email address before signing in.
   Check your inbox for the confirmation link.
   ```
3. User checks email, clicks link, returns to sign in

## Supabase Configuration

The email confirmation system relies on Supabase's default settings:

### Email Templates

Supabase automatically sends confirmation emails using the default template. The template can be customized in the Supabase Dashboard:

1. Go to **Authentication** → **Email Templates**
2. Select **Confirm signup** template
3. Customize the email content, subject, and styling
4. The template uses `{{ .ConfirmationURL }}` variable which automatically includes the correct callback URL

### Authentication Settings

Current settings (configured in Supabase Dashboard):

- **Enable email confirmations**: `true` (default)
- **Redirect URL**: `https://yourapp.com/auth/callback`
- **Email confirmation required for sign in**: `true`

## Configuration Requirements

### Environment Variables

Required in `.env` or `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hfndfmtxhqvubnfiwzlz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Supabase Dashboard Configuration

1. **Authentication → URL Configuration**
   - Add your production domain to "Site URL"
   - Add `https://yourapp.com/auth/callback` to "Redirect URLs"

2. **Authentication → Email Templates**
   - Customize the "Confirm signup" template (optional)
   - Ensure `{{ .ConfirmationURL }}` is in the template

3. **Authentication → Providers**
   - Ensure "Email" provider is enabled
   - "Confirm email" should be checked

## Error Handling

### Signup Errors

| Error | User Message | Cause |
|-------|--------------|-------|
| `CONFIRMATION_REQUIRED` | "Check your email!" alert | Normal flow - email confirmation needed |
| User already exists | "An account with this email already exists. Please sign in instead." | Duplicate signup attempt |
| Invalid email | "Invalid email address. Please check your input." | Email format validation failed |
| Weak password | "Password does not meet requirements. Please use a stronger password." | Password too short/weak |

### Login Errors

| Error | User Message | Cause |
|-------|--------------|-------|
| Email not confirmed | "Please confirm your email address before signing in. Check your inbox for the confirmation link." | User hasn't clicked email link yet |
| Invalid credentials | "Login failed. Please check your credentials." | Wrong username/password |

### Callback Errors

| Error | User Message | Cause |
|-------|--------------|-------|
| Verification failed | Redirect to `/auth?error=verification_failed&message=...` | Invalid/expired token |
| Missing token | Redirect to `/auth` | No token_hash in URL |

## Testing

### Test Signup with Email Confirmation

1. Navigate to `/auth`
2. Click "Sign Up" tab
3. Enter username: `testuser`
4. Enter password: `TestPass123`
5. Confirm password: `TestPass123`
6. Click "Create Account"
7. Observe "Check your email!" message appears
8. Check console logs:
   ```
   🚀 Starting signup process...
   📝 Zylo Client: Using direct Supabase signup (fallback)
   ✅ Zylo Client: User signed up via direct Supabase
   📧 Zylo Client: Email confirmation required
   ```

### Test Email Confirmation (Development)

**Note**: In development, Supabase doesn't send real emails. You can:

1. **Use Supabase Inbucket** (if configured):
   - Check Supabase Dashboard → Authentication → Users
   - Find the confirmation link in the user's record

2. **Disable email confirmation** (for testing):
   - In Supabase Dashboard → Authentication → Providers → Email
   - Uncheck "Confirm email"
   - Users will be auto-confirmed on signup

3. **Manual confirmation** (via SQL):
   ```sql
   UPDATE auth.users
   SET email_confirmed_at = NOW()
   WHERE email = 'testuser@veil.app';
   ```

### Test Login Before Confirmation

1. Try to sign in with unconfirmed account
2. Observe error: "Please confirm your email address before signing in..."
3. Confirm email (via one of the methods above)
4. Try login again - should succeed

### Test Callback URL

To test the callback handler manually:

```bash
# This would normally come from the email link
curl "http://localhost:4006/auth/callback?token_hash=VALID_TOKEN&type=signup"
```

Expected: Redirect to `/auth?confirmed=true&message=Email confirmed! You can now sign in.`

## Production Considerations

### Email Deliverability

1. **Configure Custom SMTP** (recommended for production):
   - Supabase Dashboard → Project Settings → Authentication
   - Add custom SMTP credentials (SendGrid, AWS SES, etc.)
   - Improves deliverability and avoids spam filters

2. **Domain Configuration**:
   - Use a custom domain email (no-reply@yourdomain.com)
   - Configure SPF, DKIM, DMARC records

3. **Email Templates**:
   - Customize templates to match your brand
   - Include clear instructions
   - Add support contact information

### Security

1. **Token Expiry**:
   - Confirmation tokens expire after 24 hours (Supabase default)
   - Users can request a new confirmation email

2. **Rate Limiting**:
   - Implement rate limiting on signup endpoint
   - Prevent abuse/spam accounts

3. **Email Validation**:
   - Consider adding email format validation
   - Check for disposable email domains (optional)

### Monitoring

Track these metrics:

- Signup conversion rate (signups → confirmed emails)
- Time to confirmation (how long users take to confirm)
- Failed confirmation attempts
- Unconfirmed account cleanup (delete after X days)

## Troubleshooting

### "Check your email" shows but no email received

**Causes:**
1. Email went to spam folder
2. Supabase email service rate limited
3. Invalid email address
4. SMTP not configured in production

**Solutions:**
1. Check spam/junk folder
2. Wait a few minutes and try again
3. Use a valid email format
4. Configure custom SMTP in Supabase Dashboard

### Confirmation link doesn't work

**Causes:**
1. Token expired (24 hours)
2. Wrong callback URL configuration
3. User already confirmed
4. Network/server error

**Solutions:**
1. Request new confirmation email (implement resend feature)
2. Check Redirect URLs in Supabase Dashboard
3. Check if user is already confirmed in database
4. Check server logs for errors

### Login works without email confirmation

**Causes:**
1. Email confirmation disabled in Supabase
2. User manually confirmed in database
3. Using old session/token

**Solutions:**
1. Enable "Confirm email" in Supabase Dashboard
2. Check user's `email_confirmed_at` in database
3. Clear browser storage and try again

## Future Enhancements

### Resend Confirmation Email

Add a button to resend confirmation email:

```typescript
async function resendConfirmation(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  });

  if (error) {
    console.error('Failed to resend confirmation', error);
  } else {
    console.log('Confirmation email resent!');
  }
}
```

### Email Verification Status Check

Add an API endpoint to check verification status:

```typescript
// pages/api/auth/check-verification.ts
export default async function handler(req, res) {
  const { email } = req.query;

  const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);

  return res.json({
    verified: !!user?.email_confirmed_at,
    email: user?.email
  });
}
```

### Automatic Cleanup

Implement a cron job to delete unconfirmed accounts after 7 days:

```sql
DELETE FROM auth.users
WHERE email_confirmed_at IS NULL
AND created_at < NOW() - INTERVAL '7 days';
```

## Summary

The email confirmation system is now fully functional and provides:

✅ Secure user registration with email verification
✅ Clear user feedback at every step
✅ Graceful error handling for edge cases
✅ Professional UX with loading states and success messages
✅ Server-side token verification for security
✅ Proper integration with Supabase auth system

Users must confirm their email before signing in, ensuring valid email addresses and reducing spam accounts.
