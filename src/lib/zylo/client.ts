import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { browserAPI } from '@/components/client-safe';
import { ZyloConfig, TokenResponse, TokenType, TokenStatus } from './types';

/**
 * Zylo Client - Manages 3-tier token cycling for Supabase authentication
 *
 * Token Priority (highest to lowest):
 * 1. USER_SCOPED - User authenticated + CP exchange successful
 * 2. SCOPED_ANON - CP reachable, tenant/project-scoped public access
 * 3. FALLBACK_ANON - CP unavailable, degraded mode with env anon key
 */
export class ZyloClient {
  private supabaseClient: SupabaseClient;
  private config: ZyloConfig;
  private currentTokenType: TokenType = 'FALLBACK_ANON';
  private tokenExpiry: number | null = null;
  private reexchangeTimer: ReturnType<typeof setTimeout> | null = null;
  private upgradeTimer: ReturnType<typeof setTimeout> | null = null;

  // Storage keys
  private readonly TOKEN_KEY = 'zylo_token';
  private readonly TOKEN_EXPIRY_KEY = 'zylo_token_expiry';
  private readonly TOKEN_TYPE_KEY = 'zylo_token_type';

  constructor(config: ZyloConfig) {
    this.config = config;

    // Initialize Supabase client with fallback anon key
    this.supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: false, // We handle token refresh manually
      },
    });
  }

  /**
   * Boot the client - called on app initialization
   * Attempts to get scoped anon token, falls back to env anon key
   */
  async boot(): Promise<void> {
    console.log('🚀 Zylo Client: Booting...');

    // Proactively ensure tenant_users table exists (non-blocking)
    this.ensureTenantUsersTableExists().catch((error) => {
      console.warn('⚠️ Zylo Client: Failed to ensure tenant_users table exists', error);
      // Don't fail boot if this fails - defensive checks in services will handle it
    });

    // Try to restore token from storage first
    const stored = this.loadStoredToken();
    if (stored && !this.isTokenExpired(stored.expiry)) {
      console.log('✅ Zylo Client: Restored token from storage');
      await this.setToken(stored.token, null);
      this.currentTokenType = stored.type;
      this.tokenExpiry = stored.expiry;
      this.scheduleReexchange();
      return;
    }

    // Try to get scoped anon token from CP
    try {
      const tokenResponse = await this.exchangeForScopedAnonToken();
      await this.setToken(tokenResponse.access_token, tokenResponse.expires_in);
      this.currentTokenType = 'SCOPED_ANON';
      this.scheduleReexchange();
      console.log('✅ Zylo Client: Using SCOPED_ANON token');
    } catch (error) {
      console.warn('⚠️ Zylo Client: CP unavailable, falling back to SUPABASE_ANON_KEY', error);
      await this.setToken(this.config.supabaseAnonKey, null);
      this.currentTokenType = 'FALLBACK_ANON';
      this.scheduleUpgradeAttempt();
    }
  }

  /**
   * Sign up a new tenant user
   * Uses direct Supabase authentication as fallback when Control Plane endpoints unavailable
   */
  async signUp(
    email: string,
    password: string,
    userData?: {
      full_name?: string;
      username?: string;
      avatar_url?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    console.log('📝 Zylo Client: Signing up new user...');

    try {
      // Try Control Plane endpoint first (preferred method)
      const endpoint = '/api/supabase/tenant-users/signup';
      const body: any = {
        email,
        password,
        ...userData,
      };

      if (this.config.signedAppContext && this.config.signedAppContext.trim()) {
        body.signedContext = this.config.signedAppContext;
      } else {
        body.tenantId = this.config.tenantId;
        body.projectId = this.config.projectId;
      }

      const fullUrl = `${this.config.controlPlaneUrl}${endpoint}`;
      console.log('🌐 Zylo Client: Attempting Control Plane signup:', fullUrl);

      try {
        const res = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'accept': 'application/json',
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(10000),
        });

        if (res.ok) {
          console.log('✅ Zylo Client: User signed up via Control Plane');
          await this.login(email, password);
          return;
        } else if (res.status === 404) {
          console.warn('⚠️ Zylo Client: Control Plane signup endpoint not available, using fallback');
          // Fall through to fallback method
        } else {
          const errorData = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(errorData.error || `Signup failed: ${res.status}`);
        }
      } catch (networkError: any) {
        if (networkError.name === 'AbortError') {
          console.warn('⚠️ Zylo Client: Control Plane timeout, using fallback signup');
        } else if (networkError.message.includes('Signup failed')) {
          throw networkError; // Re-throw actual API errors
        } else {
          console.warn('⚠️ Zylo Client: Control Plane unreachable, using fallback signup');
        }
        // Fall through to fallback method
      }

      // Fallback: Direct Supabase signup
      console.log('📝 Zylo Client: Using direct Supabase signup (fallback)');

      const { data: signUpData, error: signUpError } = await this.supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
          data: {
            full_name: userData?.full_name,
            username: userData?.username,
            avatar_url: userData?.avatar_url,
            tenant_id: this.config.tenantId,
            project_id: this.config.projectId,
            ...userData?.metadata,
          },
          // Disable email confirmation requirement
          emailConfirm: false,
        },
      });

      if (signUpError) {
        console.error('❌ Zylo Client: Direct Supabase signup failed', signUpError);
        throw signUpError;
      }

      if (!signUpData.user) {
        throw new Error('Signup succeeded but no user data returned');
      }

      console.log('✅ Zylo Client: User signed up via direct Supabase');

      // User is auto-confirmed and logged in (email confirmation disabled)
      if (signUpData.session) {
        console.log('✅ Zylo Client: User logged in with session');
        await this.setToken(signUpData.session.access_token, signUpData.session.expires_in || null);
        this.currentTokenType = 'USER_SCOPED';
        this.scheduleReexchange();
        return;
      }

      // Fallback: try to login (for cases where signup succeeded but we need to authenticate)
      await this.login(email, password);
    } catch (error: any) {
      console.error('❌ Zylo Client: Signup failed', error);

      // Provide user-friendly error messages
      if (error.message.includes('User already registered')) {
        throw new Error('An account with this username already exists. Please sign in instead.');
      } else if (error.message.includes('Invalid email')) {
        throw new Error('Invalid username. Please use only letters and numbers.');
      } else if (error.message.includes('Password')) {
        throw new Error('Password does not meet requirements. Please use a stronger password.');
      } else {
        throw new Error(error.message || 'Account creation failed. Please try again.');
      }
    }
  }

  /**
   * Login user and upgrade to user-scoped token
   * Modified to support tenant user authentication
   */
  async login(email: string, password: string): Promise<void> {
    console.log('🔐 Zylo Client: Logging in user...');

    // Step 1: Authenticate with Supabase
    const { data, error } = await this.supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Zylo Client: Supabase auth failed', error);
      throw error;
    }

    const supabaseUserToken = data.session?.access_token;
    if (!supabaseUserToken) {
      throw new Error('No user token returned from Supabase');
    }

    // Step 2: Try to exchange for tenant-user-scoped token with CP
    try {
      const tokenResponse = await this.exchangeForTenantUserScopedToken(supabaseUserToken);
      await this.setToken(tokenResponse.access_token, tokenResponse.expires_in);
      this.currentTokenType = 'USER_SCOPED';
      this.scheduleReexchange();
      console.log('✅ Zylo Client: Upgraded to USER_SCOPED token');
    } catch (error) {
      console.warn('⚠️ Zylo Client: CP exchange failed, keeping current token', error);
      // User is authenticated in Supabase but using degraded token
    }
  }

  /**
   * Logout user and downgrade to scoped anon
   */
  async logout(): Promise<void> {
    console.log('👋 Zylo Client: Logging out...');

    // Sign out from Supabase
    await this.supabaseClient.auth.signOut();

    // Clear timers
    this.clearReexchangeTimer();
    this.clearUpgradeTimer();

    // Reboot to get scoped anon or fallback
    await this.boot();
  }

  /**
   * Exchange for scoped anon token
   */
  private async exchangeForScopedAnonToken(): Promise<TokenResponse> {
    const endpoint = '/api/supabase/boot';

    const body: any = {};

    // Use signed context if available, otherwise use raw IDs
    if (this.config.signedAppContext && this.config.signedAppContext.trim()) {
      body.signedContext = this.config.signedAppContext;
    } else {
      body.tenantId = this.config.tenantId;
      body.projectId = this.config.projectId;
    }

    const fullUrl = `${this.config.controlPlaneUrl}${endpoint}`;

    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(body),
      // Add timeout for boot requests (15 seconds)
      signal: AbortSignal.timeout(15000),
    }).catch((networkError) => {
      console.error('❌ Network error contacting Control Plane:', networkError);
      throw new Error('Control Plane unreachable');
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`CP /api/supabase/boot failed: ${res.status} ${res.statusText} - ${errorText}`);
    }

    return await res.json();
  }

  /**
   * Exchange for user-scoped token (legacy platform users)
   */
  private async exchangeForUserScopedToken(userToken: string): Promise<TokenResponse> {
    const endpoint = '/api/supabase/exchange-token';

    const body: any = {};

    if (this.config.signedAppContext && this.config.signedAppContext.trim()) {
      body.signedContext = this.config.signedAppContext;
    } else {
      body.tenantId = this.config.tenantId;
      body.projectId = this.config.projectId;
    }

    const res = await fetch(`${this.config.controlPlaneUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`CP /api/supabase/exchange-token failed: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  }

  /**
   * Exchange for tenant-user-scoped token
   * This is the token exchange for tenant application users
   */
  private async exchangeForTenantUserScopedToken(userToken: string): Promise<TokenResponse> {
    const endpoint = '/api/supabase/tenant-users/exchange-token';

    const body: any = {};

    if (this.config.signedAppContext && this.config.signedAppContext.trim()) {
      body.signedContext = this.config.signedAppContext;
    } else {
      body.tenantId = this.config.tenantId;
      body.projectId = this.config.projectId;
    }

    const fullUrl = `${this.config.controlPlaneUrl}${endpoint}`;

    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    }).catch((networkError) => {
      console.error('❌ Network error during token exchange:', networkError);
      throw new Error('Unable to complete authentication. Please try again.');
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `CP /api/supabase/tenant-users/exchange-token failed: ${res.status} ${res.statusText} - ${errorText}`
      );
    }

    return await res.json();
  }

  /**
   * Proactively ensure tenant_users table exists
   * Called on boot to check/create table before any user operations
   */
  private async ensureTenantUsersTableExists(): Promise<void> {
    const endpoint = '/api/supabase/tenant-users/ensure-table';

    const body: any = {};

    if (this.config.signedAppContext && this.config.signedAppContext.trim()) {
      body.signedContext = this.config.signedAppContext;
    } else {
      body.tenantId = this.config.tenantId;
      body.projectId = this.config.projectId;
    }

    const fullUrl = `${this.config.controlPlaneUrl}${endpoint}`;

    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000), // 30 seconds for table creation
    }).catch((networkError) => {
      console.error('❌ Network error ensuring tenant_users table:', networkError);
      throw new Error('Unable to initialize user system. Please try again.');
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `CP /api/supabase/tenant-users/ensure-table failed: ${res.status} ${res.statusText} - ${errorText}`
      );
    }

    const result = await res.json();
    console.log('✅ Zylo Client: tenant_users table verified', result);
  }

  /**
   * Set token in Supabase client and storage
   */
  private async setToken(token: string, expiresIn: number | null): Promise<void> {
    // Update Supabase session
    await this.supabaseClient.auth.setSession({
      access_token: token,
      refresh_token: '', // We don't use refresh tokens
    });

    // Store token and expiry
    if (expiresIn !== null) {
      const expiryTime = Date.now() + expiresIn * 1000;
      this.tokenExpiry = expiryTime;
      browserAPI.localStorage.setItem(this.TOKEN_KEY, token);
      browserAPI.localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
      browserAPI.localStorage.setItem(this.TOKEN_TYPE_KEY, this.currentTokenType);
    } else {
      // Fallback anon has no expiry
      this.tokenExpiry = null;
      browserAPI.localStorage.removeItem(this.TOKEN_KEY);
      browserAPI.localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
      browserAPI.localStorage.removeItem(this.TOKEN_TYPE_KEY);
    }
  }

  /**
   * Load token from storage
   */
  private loadStoredToken(): { token: string; expiry: number; type: TokenType } | null {
    const token = browserAPI.localStorage.getItem(this.TOKEN_KEY);
    const expiry = browserAPI.localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    const type = browserAPI.localStorage.getItem(this.TOKEN_TYPE_KEY) as TokenType;

    if (!token || !expiry || !type) {
      return null;
    }

    return {
      token,
      expiry: parseInt(expiry, 10),
      type,
    };
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(expiry?: number): boolean {
    const expiryTime = expiry ?? this.tokenExpiry;
    if (!expiryTime) return false; // Fallback anon never expires
    return Date.now() >= expiryTime;
  }

  /**
   * Schedule token re-exchange before expiry
   */
  private scheduleReexchange(): void {
    this.clearReexchangeTimer();

    if (!this.tokenExpiry) return; // Fallback anon doesn't need re-exchange

    // Renew 2 minutes before expiry
    const renewAt = this.tokenExpiry - 2 * 60 * 1000;
    const delay = Math.max(0, renewAt - Date.now());

    this.reexchangeTimer = setTimeout(async () => {
      try {
        console.log('🔄 Zylo Client: Re-exchanging token...');

        if (this.currentTokenType === 'USER_SCOPED') {
          // User is logged in - re-exchange with user token
          const session = await this.supabaseClient.auth.getSession();
          const userToken = session.data.session?.access_token;

          if (userToken) {
            // Try tenant user token exchange (current implementation)
            const tokenResponse = await this.exchangeForTenantUserScopedToken(userToken);
            await this.setToken(tokenResponse.access_token, tokenResponse.expires_in);
            console.log('🔄 Zylo Client: Renewed USER_SCOPED token');
          } else {
            // User session expired - downgrade to scoped anon
            console.warn('⚠️ Zylo Client: User session expired, downgrading to scoped anon');
            await this.boot();
          }
        } else if (this.currentTokenType === 'SCOPED_ANON') {
          // No user - re-exchange for scoped anon
          const tokenResponse = await this.exchangeForScopedAnonToken();
          await this.setToken(tokenResponse.access_token, tokenResponse.expires_in);
          console.log('🔄 Zylo Client: Renewed SCOPED_ANON token');
        }

        // Reschedule next renewal
        this.scheduleReexchange();
      } catch (error) {
        console.error('❌ Zylo Client: Re-exchange failed, downgrading to fallback', error);

        // Downgrade to fallback anon on failure
        await this.setToken(this.config.supabaseAnonKey, null);
        this.currentTokenType = 'FALLBACK_ANON';
        this.scheduleUpgradeAttempt();
      }
    }, delay);
  }

  /**
   * Schedule automatic upgrade attempts when using fallback
   */
  private scheduleUpgradeAttempt(): void {
    this.clearUpgradeTimer();

    this.upgradeTimer = setTimeout(async () => {
      console.log('🔄 Zylo Client: Attempting to upgrade from fallback to scoped anon...');

      try {
        const tokenResponse = await this.exchangeForScopedAnonToken();
        await this.setToken(tokenResponse.access_token, tokenResponse.expires_in);
        this.currentTokenType = 'SCOPED_ANON';
        this.scheduleReexchange();
        console.log('✅ Zylo Client: Successfully upgraded to SCOPED_ANON');
      } catch (error) {
        // Still can't reach CP - try again in 5 minutes
        console.warn('⚠️ Zylo Client: Upgrade failed, retrying in 5 min');
        this.scheduleUpgradeAttempt();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Clear re-exchange timer
   */
  private clearReexchangeTimer(): void {
    if (this.reexchangeTimer) {
      clearTimeout(this.reexchangeTimer);
      this.reexchangeTimer = null;
    }
  }

  /**
   * Clear upgrade timer
   */
  private clearUpgradeTimer(): void {
    if (this.upgradeTimer) {
      clearTimeout(this.upgradeTimer);
      this.upgradeTimer = null;
    }
  }

  /**
   * Get Supabase client instance
   */
  getSupabase(): SupabaseClient {
    return this.supabaseClient;
  }

  /**
   * Get current token status for debugging
   */
  getTokenStatus(): TokenStatus {
    return {
      type: this.currentTokenType,
      expiresAt: this.tokenExpiry ? new Date(this.tokenExpiry) : null,
      isExpired: this.isTokenExpired(),
      hasSignedContext: !!(this.config.signedAppContext && this.config.signedAppContext.trim()),
    };
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const { data } = await this.supabaseClient.auth.getSession();
    return !!data.session;
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    const { data } = await this.supabaseClient.auth.getUser();
    return data.user;
  }

  /**
   * Cleanup - clear all timers
   */
  cleanup(): void {
    this.clearReexchangeTimer();
    this.clearUpgradeTimer();
  }
}
