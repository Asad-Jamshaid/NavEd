// ==========================================
// Database Service - Supabase Client
// Optional integration - app works without it
// ==========================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../utils/constants';

// Try to import environment variables (from .env file)
// Note: @env only works in Expo Go dev mode, not in EAS production builds
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

try {
  // Try to import from @env (works in Expo Go development)
  const env = require('@env');
  SUPABASE_URL = env.SUPABASE_URL || env.EXPO_PUBLIC_SUPABASE_URL || '';
  SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
} catch (e) {
  // @env not available in production builds - use constants fallback
  console.log('Environment variables not available, using constants fallback');
}

// Use environment variables if available, otherwise use constants
const finalUrl = SUPABASE_URL || SUPABASE_CONFIG.url;
const finalKey = SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;

// #region agent log
fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'databaseService.ts:25',message:'Supabase config check',data:{hasEnvUrl:!!SUPABASE_URL,hasEnvKey:!!SUPABASE_ANON_KEY,finalUrl:finalUrl.substring(0,20)+'...',finalKeyLength:finalKey.length,isPlaceholderUrl:finalUrl==='YOUR_SUPABASE_URL',isPlaceholderKey:finalKey==='YOUR_SUPABASE_ANON_KEY'},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'A'})}).catch(()=>{});
// #endregion

// Check if Supabase is configured (not placeholder values)
const isSupabaseConfigured = 
  finalUrl !== 'YOUR_SUPABASE_URL' && 
  finalUrl !== '' &&
  finalKey !== 'YOUR_SUPABASE_ANON_KEY' && 
  finalKey !== '';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'databaseService.ts:32',message:'Supabase configured check',data:{isSupabaseConfigured},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'A'})}).catch(()=>{});
// #endregion

// Supabase client instance (null if not configured)
let supabaseClient: SupabaseClient | null = null;

// Initialize Supabase client if configured
if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(finalUrl, finalKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    console.log('Supabase client initialized successfully');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'databaseService.ts:47',message:'Supabase client created',data:{hasClient:!!supabaseClient},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    supabaseClient = null;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'databaseService.ts:50',message:'Supabase init error',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
  }
} else {
  console.log('Supabase not configured - app will work in local-only mode');
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/9d1aafa7-8f4f-466c-980b-f7e8c76c04b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'databaseService.ts:54',message:'Supabase not configured',data:{reason:'placeholder values or empty'},timestamp:Date.now(),sessionId:'debug-session',runId:'init',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
}

/**
 * Get Supabase client instance
 * Returns null if Supabase is not configured
 */
export function getSupabaseClient(): SupabaseClient | null {
  return supabaseClient;
}

/**
 * Check if Supabase is configured and available
 */
export function isSupabaseAvailable(): boolean {
  return isSupabaseConfigured && supabaseClient !== null;
}

/**
 * Safe database operation wrapper
 * Tries database operation, falls back to callback if database unavailable
 */
export async function safeDbOperation<T>(
  dbOperation: (client: SupabaseClient) => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  if (!isSupabaseAvailable() || !supabaseClient) {
    return await fallback();
  }

  try {
    return await dbOperation(supabaseClient);
  } catch (error) {
    console.error('Database operation failed, using fallback:', error);
    return await fallback();
  }
}

