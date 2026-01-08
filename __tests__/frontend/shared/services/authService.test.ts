/**
 * Unit Tests for Authentication Service
 * Tests sign up, sign in, sign out, and session management
 */

import {
  signUp,
  signIn,
  signOut,
  getSession,
  getCurrentUser,
  onAuthStateChange,
  isAuthAvailable,
} from '../../src/services/authService';

// Mock database service
jest.mock('../../src/services/databaseService', () => ({
  getSupabaseClient: jest.fn(() => require('../../__mocks__/supabase').mockSupabaseClient),
  isSupabaseAvailable: jest.fn(() => true),
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  const { createClient, mockSupabaseClient } = require('../../__mocks__/supabase');
  return { createClient };
});

describe('Authentication Service', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = require('../../__mocks__/supabase').mockSupabaseClient;

    // Restore mocks wiped by resetMocks: true
    const databaseService = require('../../src/services/databaseService');
    databaseService.isSupabaseAvailable.mockReturnValue(true);
    databaseService.getSupabaseClient.mockReturnValue(mockSupabase);
  });

  describe('isAuthAvailable()', () => {
    test('should return true when Supabase is available', () => {
      const { isSupabaseAvailable } = require('../../src/services/databaseService');
      isSupabaseAvailable.mockReturnValueOnce(true);

      const available = isAuthAvailable();
      expect(available).toBe(true);
    });
  });

  describe('signUp()', () => {
    test('should return error when auth is not configured', async () => {
      jest.spyOn(require('../../src/services/databaseService'), 'isSupabaseAvailable').mockReturnValue(false);

      const result = await signUp('test@example.com', 'password123', 'Test User');

      expect(result.user).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error?.message).toContain('not configured');
    });

    test('should call Supabase signUp with correct parameters', async () => {
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
        },
        error: null,
      });

      mockSupabase.from.mockReturnValueOnce({
        upsert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      });

      const result = await signUp('test@example.com', 'password123', 'Test User');

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'Test User',
          },
        },
      });
    });

    test('should handle sign up errors', async () => {
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Email already exists', status: 400 },
      });

      const result = await signUp('test@example.com', 'password123');

      expect(result.user).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error?.message).toBe('Email already exists');
    });
  });

  describe('signIn()', () => {
    test('should return error when auth is not configured', async () => {
      jest.spyOn(require('../../src/services/databaseService'), 'isSupabaseAvailable').mockReturnValue(false);

      const result = await signIn('test@example.com', 'password123');

      expect(result.user).toBeNull();
      expect(result.error).not.toBeNull();
    });

    test('should call Supabase signInWithPassword', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
        },
        error: null,
      });

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() => Promise.resolve({ data: { name: 'Test User' }, error: null })),
      });

      const result = await signIn('test@example.com', 'password123');

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    test('should handle sign in errors', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid credentials', status: 401 },
      });

      const result = await signIn('test@example.com', 'wrongpassword');

      expect(result.user).toBeNull();
      expect(result.error?.message).toBe('Invalid credentials');
    });
  });

  describe('signOut()', () => {
    test('should return no error when auth is not configured', async () => {
      jest.spyOn(require('../../src/services/databaseService'), 'isSupabaseAvailable').mockReturnValue(false);

      const result = await signOut();

      expect(result.error).toBeNull();
    });

    test('should call Supabase signOut', async () => {
      mockSupabase.auth.signOut.mockResolvedValueOnce({ error: null });

      const result = await signOut();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });
  });

  describe('getSession()', () => {
    test('should return null session when auth is not configured', async () => {
      jest.spyOn(require('../../src/services/databaseService'), 'isSupabaseAvailable').mockReturnValue(false);

      const result = await getSession();

      expect(result.session).toBeNull();
      expect(result.error).toBeNull();
    });

    test('should return session when user is authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: {
          session: {
            user: {
              id: 'user-123',
              email: 'test@example.com',
            },
            access_token: 'token-123',
            expires_at: Date.now() + 3600000,
          },
        },
        error: null,
      });

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() => Promise.resolve({ data: { name: 'Test User' }, error: null })),
      });

      const result = await getSession();

      expect(result.session).not.toBeNull();
      expect(result.session?.user.id).toBe('user-123');
      expect(result.session?.user.email).toBe('test@example.com');
    });

    test('should return null session when no user is authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const result = await getSession();

      expect(result.session).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe('getCurrentUser()', () => {
    test('should return null when no session', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const result = await getCurrentUser();

      expect(result.user).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe('onAuthStateChange()', () => {
    test('should return no-op unsubscribe when auth is not configured', () => {
      jest.spyOn(require('../../src/services/databaseService'), 'isSupabaseAvailable').mockReturnValue(false);

      const unsubscribe = onAuthStateChange(() => { });

      expect(typeof unsubscribe).toBe('function');
      expect(() => unsubscribe()).not.toThrow();
    });

    test('should subscribe to auth state changes', () => {
      const { isSupabaseAvailable } = require('../../src/services/databaseService');
      isSupabaseAvailable.mockReturnValueOnce(true);
      const { getSupabaseClient } = require('../../src/services/databaseService');
      getSupabaseClient.mockReturnValueOnce(mockSupabase);

      const callback = jest.fn();
      const unsubscribe = onAuthStateChange(callback);

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });
  });
});

