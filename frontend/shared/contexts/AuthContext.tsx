// ==========================================
// Authentication Context
// Optional - app works without authentication
// ==========================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, signIn, signUp, signOut, getSession, onAuthStateChange, isAuthAvailable } from '../../features/auth/services/authService';
import { AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthEnabled: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthEnabled = React.useMemo(() => isAuthAvailable(), []);

  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:25',message:'AuthProvider initialized',data:{isAuthEnabled},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'B'})}).catch(()=>{});
  }, [isAuthEnabled]);
  // #endregion

  // Initialize auth state
  useEffect(() => {
    if (!isAuthEnabled) {
      setIsLoading(false);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:31',message:'Auth disabled, skipping init',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return;
    }

    // Check for existing session
    checkSession();

    // Listen to auth state changes
    const unsubscribe = onAuthStateChange((authUser) => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:40',message:'Auth state changed',data:{hasUser:!!authUser,userId:authUser?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setUser(authUser);
      setIsLoading(false);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isAuthEnabled]);

  const checkSession = async () => {
    try {
      const { session } = await getSession();
      setUser(session?.user || null);
    } catch (error) {
      console.error('Error checking session:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:62',message:'SignIn attempt',data:{email:email.substring(0,10)+'...',isAuthEnabled},timestamp:Date.now(),sessionId:'debug-session',runId:'auth',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (!isAuthEnabled) {
      return { error: { message: 'Authentication not configured', status: 400 } as AuthError };
    }

    try {
      const { user: authUser, error } = await signIn(email, password);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:69',message:'SignIn result',data:{hasUser:!!authUser,hasError:!!error,errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'auth',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      if (error) {
        return { error };
      }
      // Don't manually set user - let onAuthStateChange handle it
      return { error: null };
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:76',message:'SignIn exception',data:{error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'auth',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return { error: { message: error.message || 'Sign in failed', status: 400 } as AuthError };
    }
  };

  const handleSignUp = async (email: string, password: string, name?: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:79',message:'SignUp attempt',data:{email:email.substring(0,10)+'...',hasName:!!name,isAuthEnabled},timestamp:Date.now(),sessionId:'debug-session',runId:'auth',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    if (!isAuthEnabled) {
      return { error: { message: 'Authentication not configured', status: 400 } as AuthError };
    }

    try {
      const { user: authUser, error } = await signUp(email, password, name);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:86',message:'SignUp result',data:{hasUser:!!authUser,hasError:!!error,errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'auth',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      if (error) {
        return { error };
      }
      // Don't manually set user - let onAuthStateChange handle it
      return { error: null };
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:93',message:'SignUp exception',data:{error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'auth',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return { error: { message: error.message || 'Sign up failed', status: 400 } as AuthError };
    }
  };

  const handleSignOut = async () => {
    if (!isAuthEnabled) {
      return { error: null };
    }

    try {
      const { error } = await signOut();
      if (error) {
        return { error };
      }
      // Don't manually set user - let onAuthStateChange handle it
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Sign out failed', status: 400 } as AuthError };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAuthEnabled,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return default values if auth not available
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isAuthEnabled: false,
      signIn: async () => ({ error: null }),
      signUp: async () => ({ error: null }),
      signOut: async () => ({ error: null }),
    };
  }
  return context;
}



