/**
 * Unit Tests for Authentication Context
 * Tests auth state management and user authentication flow
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext';

// Import the mocked module functions
import * as authService from '../../src/services/authService';

// Mock auth service
jest.mock('../../src/services/authService', () => ({
  isAuthAvailable: jest.fn(() => true),
  getSession: jest.fn(() => Promise.resolve({ session: null, error: null })),
  onAuthStateChange: jest.fn((callback) => {
    // Simulate calling the callback asynchronously
    setTimeout(() => callback(null), 0);
    return () => { }; // Return unsubscribe function
  }),
  signIn: jest.fn(() => Promise.resolve({ user: null, error: null })),
  signUp: jest.fn(() => Promise.resolve({ user: null, error: null })),
  signOut: jest.fn(() => Promise.resolve({ error: null })),
}));

// Mock database service
jest.mock('../../src/services/databaseService', () => ({
  isSupabaseAvailable: jest.fn(() => true),
}));

// Test component
const TestConsumer: React.FC = () => {
  const { user, isLoading, isAuthenticated, isAuthEnabled, signIn, signUp, signOut } = useAuth();

  return (
    <>
      <Text testID="loading">{isLoading ? 'loading' : 'not-loading'}</Text>
      <Text testID="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</Text>
      <Text testID="authEnabled">{isAuthEnabled ? 'enabled' : 'disabled'}</Text>
      <Text testID="userId">{user?.id || 'no-user'}</Text>
      <Text testID="userEmail">{user?.email || 'no-email'}</Text>
    </>
  );
};

// Get typed references to the mocked functions
const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset default mock implementations
    (mockedAuthService.isAuthAvailable as jest.Mock).mockReturnValue(true);
    (mockedAuthService.getSession as jest.Mock).mockResolvedValue({ session: null, error: null });
    (mockedAuthService.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      setTimeout(() => callback(null), 0);
      return () => { };
    });
    (mockedAuthService.signIn as jest.Mock).mockResolvedValue({ user: null, error: null });
    (mockedAuthService.signUp as jest.Mock).mockResolvedValue({ user: null, error: null });
    (mockedAuthService.signOut as jest.Mock).mockResolvedValue({ error: null });
  });

  describe('AuthProvider', () => {
    test('should provide default values when auth not available', async () => {
      (mockedAuthService.isAuthAvailable as jest.Mock).mockReturnValue(false);

      const { getByTestId } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('authEnabled').props.children).toBe('disabled');
        expect(getByTestId('loading').props.children).toBe('not-loading');
      });
    });

    test('should initialize with loading state', () => {
      const { getByTestId } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      // Initially loading
      expect(getByTestId('loading').props.children).toBe('loading');
    });

    test('should check for existing session on mount', async () => {
      (mockedAuthService.getSession as jest.Mock).mockResolvedValueOnce({
        session: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
          },
          accessToken: 'token-123',
        },
        error: null,
      });

      const { getByTestId } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockedAuthService.getSession).toHaveBeenCalled();
        expect(getByTestId('loading').props.children).toBe('not-loading');
      });
    });

    test('should set up auth state change listener', async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockedAuthService.onAuthStateChange).toHaveBeenCalled();
      });
    });
  });

  describe('useAuth hook', () => {
    test('should return default values when used outside provider', () => {
      const { getByTestId } = render(<TestConsumer />);

      expect(getByTestId('authEnabled').props.children).toBe('disabled');
      expect(getByTestId('authenticated').props.children).toBe('not-authenticated');
    });

    test('should provide auth methods', async () => {
      const TestMethods: React.FC = () => {
        const auth = useAuth();
        return (
          <>
            <Text testID="hasSignIn">{typeof auth.signIn === 'function' ? 'yes' : 'no'}</Text>
            <Text testID="hasSignUp">{typeof auth.signUp === 'function' ? 'yes' : 'no'}</Text>
            <Text testID="hasSignOut">{typeof auth.signOut === 'function' ? 'yes' : 'no'}</Text>
          </>
        );
      };

      const { getByTestId } = render(
        <AuthProvider>
          <TestMethods />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('hasSignIn').props.children).toBe('yes');
        expect(getByTestId('hasSignUp').props.children).toBe('yes');
        expect(getByTestId('hasSignOut').props.children).toBe('yes');
      });
    });
  });

  describe('Authentication flow', () => {
    test('signIn should call auth service', async () => {
      (mockedAuthService.signIn as jest.Mock).mockResolvedValueOnce({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
        error: null,
      });

      const TestSignIn: React.FC = () => {
        const { signIn } = useAuth();
        React.useEffect(() => {
          signIn('test@example.com', 'password123');
        }, [signIn]);
        return <Text testID="test">Test</Text>;
      };

      render(
        <AuthProvider>
          <TestSignIn />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockedAuthService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    test('signOut should call auth service', async () => {
      (mockedAuthService.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

      const TestSignOut: React.FC = () => {
        const { signOut } = useAuth();
        React.useEffect(() => {
          signOut();
        }, [signOut]);
        return <Text testID="test">Test</Text>;
      };

      render(
        <AuthProvider>
          <TestSignOut />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(mockedAuthService.signOut).toHaveBeenCalled();
      });
    });
  });

  describe('Error handling', () => {
    test('should handle auth service errors gracefully', async () => {
      // Reset and set up the mock
      (mockedAuthService.signIn as jest.Mock).mockReset();
      (mockedAuthService.signIn as jest.Mock).mockResolvedValueOnce({
        user: null,
        error: { message: 'Invalid credentials', status: 401 },
      });

      const TestError: React.FC = () => {
        const { signIn } = useAuth();
        const [error, setError] = React.useState<any>(null);

        React.useEffect(() => {
          signIn('test@example.com', 'wrongpassword').then((result) => {
            setError(result.error);
          }).catch(() => {
            // Ignore errors
          });
        }, [signIn]);

        return <Text testID="error">{error?.message || 'no-error'}</Text>;
      };

      const { getByTestId } = render(
        <AuthProvider>
          <TestError />
        </AuthProvider>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(getByTestId('error')).toBeTruthy();
      }, { timeout: 1000 });

      // Wait for error state to update
      await waitFor(
        () => {
          const errorText = getByTestId('error').props.children;
          expect(errorText).toBe('Invalid credentials');
        },
        { timeout: 3000 }
      );
    });
  });
});
