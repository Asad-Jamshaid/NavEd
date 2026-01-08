/**
 * Integration Tests for Authentication Flow
 * Tests complete authentication flow from login to app access
 */

import React from 'react';
import { render, waitFor, fireEvent, getAllByText } from '@testing-library/react-native';
import App from '../../App';

// Mock all services
jest.mock('../../src/services/databaseService', () => ({
  getSupabaseClient: jest.fn(() => require('../../__mocks__/supabase').mockSupabaseClient),
  isSupabaseAvailable: jest.fn(() => true),
}));

jest.mock('../../src/services/authService', () => ({
  isAuthAvailable: jest.fn(() => true),
  getSession: jest.fn(() => Promise.resolve({ session: null, error: null })),
  onAuthStateChange: jest.fn(() => () => {}),
  signIn: jest.fn(() =>
    Promise.resolve({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      },
      error: null,
    })
  ),
  signUp: jest.fn(() =>
    Promise.resolve({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      },
      error: null,
    })
  ),
  signOut: jest.fn(() => Promise.resolve({ error: null })),
}));

jest.mock('../../src/services/accessibilityService', () => ({
  initializeAccessibility: jest.fn(() => Promise.resolve()),
  getAccessibilitySettings: jest.fn(() => Promise.resolve({
    voiceGuidance: false,
    speechRate: 0.5,
    hapticFeedback: true,
    highContrast: false,
    fontSize: 'medium',
    reducedMotion: false,
    screenReaderOptimized: false,
  })),
  speak: jest.fn(() => Promise.resolve()),
  triggerHaptic: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../src/services/notificationService', () => ({
  initializeNotifications: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../src/services/parkingService', () => ({
  setupParkingAlerts: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../src/services/studyAssistantService', () => ({
  loadApiKeys: jest.fn(() => Promise.resolve()),
}));

// Mock expo-location for screens that use it
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 31.5195,
        longitude: 74.3588,
        altitude: null,
        accuracy: 10,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
    })
  ),
}));

// Mock parking database service
jest.mock('../../src/services/parkingDatabaseService', () => ({
  subscribeToParkingUpdates: jest.fn(() => jest.fn()),
  unsubscribeFromParkingUpdates: jest.fn(),
}));

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show auth screens when auth enabled and user not authenticated', async () => {
    const { getAllByText } = render(<App />);

    await waitFor(() => {
      // Should show login screen - use getAllByText since multiple elements match
      const elements = getAllByText(/Welcome Back|Sign in|Create Account/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  test('should show main app when auth not configured', async () => {
    const { isSupabaseAvailable } = require('../../src/services/databaseService');
    isSupabaseAvailable.mockReturnValueOnce(false);

    const { isAuthAvailable } = require('../../src/services/authService');
    isAuthAvailable.mockReturnValueOnce(false);

    const { getAllByText } = render(<App />);

    await waitFor(() => {
      // Should show main app (parking, map, etc.) - use getAllByText since multiple tabs match
      const elements = getAllByText(/Parking|Map|Study|Settings/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  test('should navigate between login and signup screens', async () => {
    const { getAllByText, queryByText } = render(<App />);

    await waitFor(() => {
      // Use getAllByText since multiple elements match
      const elements = getAllByText(/Welcome Back|Sign in/i);
      expect(elements.length).toBeGreaterThan(0);
    });

    // Find and click sign up link - use getAllByText and select first element
    const signUpLinks = getAllByText(/Sign Up|Don't have an account/i);
    expect(signUpLinks.length).toBeGreaterThan(0);
    fireEvent.press(signUpLinks[0]);

    await waitFor(() => {
      // Use getAllByText since multiple elements might match
      const elements = getAllByText(/Create Account|Sign up/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});



