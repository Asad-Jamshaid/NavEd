// ==========================================
// Authentication Service - Supabase Auth
// Optional integration - app works without it
// ==========================================

import { getSupabaseClient, isSupabaseAvailable } from './databaseService';
import { Session, User, AuthError } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  expiresAt?: number;
}

/**
 * Check if authentication is available
 */
export function isAuthAvailable(): boolean {
  return isSupabaseAvailable();
}

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, name?: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authService.ts:31',message:'signUp called',data:{email:email.substring(0,10)+'...',hasName:!!name},timestamp:Date.now(),sessionId:'debug-session',runId:'auth',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  if (!isAuthAvailable()) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authService.ts:33',message:'signUp auth not available',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'auth',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return { user: null, error: { message: 'Authentication not configured', status: 400 } as AuthError };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authService.ts:40',message:'signUp no supabase client',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'auth',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return { user: null, error: { message: 'Supabase client not available', status: 400 } as AuthError };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
        },
      },
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authService.ts:54',message:'signUp supabase response',data:{hasUser:!!data?.user,hasError:!!error,errorMessage:error?.message,errorStatus:error?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'auth',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (error) {
      return { user: null, error };
    }

    if (data.user) {
      // Create user profile
      // Note: Email storage is optional for compliance - can be gated behind STORE_EMAIL_IN_PROFILE config
      // For now, storing email as it's needed for user identification
      if (data.user.id) {
        await supabase
          .from('user_profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email, // TODO: Gate behind STORE_EMAIL_IN_PROFILE config flag for compliance
            name: name || '',
            preferences: {},
          });
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: name || '',
        },
        error: null,
      };
    }

    return { user: null, error: { message: 'Sign up failed', status: 400 } as AuthError };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { user: null, error: { message: error.message || 'Sign up failed', status: 400 } as AuthError };
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authService.ts:91',message:'signIn called',data:{email:email.substring(0,10)+'...'},timestamp:Date.now(),sessionId:'debug-session',runId:'auth',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  if (!isAuthAvailable()) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authService.ts:93',message:'signIn auth not available',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'auth',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return { user: null, error: { message: 'Authentication not configured', status: 400 } as AuthError };
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authService.ts:100',message:'signIn no supabase client',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'auth',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return { user: null, error: { message: 'Supabase client not available', status: 400 } as AuthError };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authService.ts:110',message:'signIn supabase response',data:{hasUser:!!data?.user,hasError:!!error,errorMessage:error?.message,errorStatus:error?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'auth',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (error) {
      return { user: null, error };
    }

    if (data.user) {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching user profile in signIn:', profileError);
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: profile?.name || '',
        },
        error: null,
      };
    }

    return { user: null, error: { message: 'Sign in failed', status: 400 } as AuthError };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { user: null, error: { message: error.message || 'Sign in failed', status: 400 } as AuthError };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  if (!isAuthAvailable()) {
    return { error: null }; // No error when auth not configured (consistent with getSession)
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: { message: 'Supabase client not available', status: 400 } as AuthError };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { error: { message: error.message || 'Sign out failed', status: 400 } as AuthError };
  }
}

/**
 * Get current session
 */
export async function getSession(): Promise<{ session: AuthSession | null; error: AuthError | null }> {
  if (!isAuthAvailable()) {
    return { session: null, error: null }; // No error if auth not configured
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { session: null, error: null };
    }

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return { session: null, error };
    }

    if (session?.user) {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching user profile in getSession:', profileError);
      }

      return {
        session: {
          user: {
            id: session.user.id,
            email: session.user.email,
            name: profile?.name || '',
          },
          accessToken: session.access_token,
          expiresAt: session.expires_at,
        },
        error: null,
      };
    }

    return { session: null, error: null };
  } catch (error: any) {
    console.error('Get session error:', error);
    return { session: null, error: { message: error.message || 'Failed to get session', status: 400 } as AuthError };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<{ user: AuthUser | null; error: AuthError | null }> {
  try {
    const { session, error } = await getSession();
    if (error) {
      return { user: null, error };
    }
    return { user: session?.user || null, error: null };
  } catch (error: any) {
    return { user: null, error: { message: error.message || 'Failed to get current user', status: 400 } as AuthError };
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
  if (!isAuthAvailable()) {
    // Return no-op unsubscribe function if auth not available
    return () => {};
  }

  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return () => {};
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching user profile in onAuthStateChange:', profileError);
          callback({
            id: session.user.id,
            email: session.user.email,
            name: '',
          });
          return;
        }

        callback({
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || '',
        });
      } else {
        callback(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  } catch (error) {
    console.error('Auth state change error:', error);
    return () => {};
  }
}

