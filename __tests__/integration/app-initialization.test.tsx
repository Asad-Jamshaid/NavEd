/**
 * Integration Tests for App Initialization
 * Tests app startup with and without Supabase configuration
 */

import React from 'react';
import { render, waitFor, getAllByText } from '@testing-library/react-native';
import App from '../../App';

// Mock all services at module scope
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

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(() => Promise.resolve()),
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

// Mock database and auth services at module scope with configurable mocks
const mockGetSupabaseClient = jest.fn(() => null);
const mockIsSupabaseAvailable = jest.fn(() => false);
const mockIsAuthAvailable = jest.fn(() => false);
const mockGetSession = jest.fn(() => Promise.resolve({ session: null, error: null }));
const mockOnAuthStateChange = jest.fn(() => () => {});

jest.mock('../../src/services/databaseService', () => ({
  getSupabaseClient: () => mockGetSupabaseClient(),
  isSupabaseAvailable: () => mockIsSupabaseAvailable(),
}));

jest.mock('../../src/services/authService', () => ({
  isAuthAvailable: () => mockIsAuthAvailable(),
  getSession: () => mockGetSession(),
  onAuthStateChange: () => mockOnAuthStateChange(),
}));

describe('App Initialization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default (no Supabase)
    mockGetSupabaseClient.mockReturnValue(null);
    mockIsSupabaseAvailable.mockReturnValue(false);
    mockIsAuthAvailable.mockReturnValue(false);
    mockGetSession.mockResolvedValue({ session: null, error: null });
    mockOnAuthStateChange.mockReturnValue(() => {});
  });

  describe('Without Supabase configuration', () => {
    test('should initialize app without errors', async () => {
      const { getAllByText } = render(<App />);

      await waitFor(() => {
        // Should show main app - use getAllByText since multiple tabs match
        const elements = getAllByText(/Parking|Map|Study|Settings/i);
        expect(elements.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });

    test('should not show auth screens when Supabase not configured', async () => {
      const { queryByText } = render(<App />);

      await waitFor(() => {
        // Should not show login/signup
        expect(queryByText(/Welcome Back|Sign in|Create Account/i)).toBeNull();
      }, { timeout: 3000 });
    });
  });

  describe('With Supabase configuration', () => {
    test('should show auth screens when user not authenticated', async () => {
      // Configure mocks for Supabase available scenario
      mockIsSupabaseAvailable.mockReturnValue(true);
      mockIsAuthAvailable.mockReturnValue(true);
      mockGetSupabaseClient.mockReturnValue(require('../../__mocks__/supabase').mockSupabaseClient);

      const { getAllByText } = render(<App />);

      await waitFor(() => {
        // Should show login screen - use getAllByText since multiple elements match
        const elements = getAllByText(/Welcome Back|Sign in|Create Account/i);
        expect(elements.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });

  describe('Service initialization', () => {
    test('should initialize all services without errors', async () => {
      const { initializeAccessibility } = require('../../src/services/accessibilityService');
      const { initializeNotifications } = require('../../src/services/notificationService');
      const { setupParkingAlerts } = require('../../src/services/parkingService');
      const { loadApiKeys } = require('../../src/services/studyAssistantService');

      // Clear previous calls
      jest.clearAllMocks();

      render(<App />);

      await waitFor(() => {
        expect(initializeAccessibility).toHaveBeenCalled();
        expect(initializeNotifications).toHaveBeenCalled();
        expect(setupParkingAlerts).toHaveBeenCalled();
        expect(loadApiKeys).toHaveBeenCalled();
      }, { timeout: 5000 });
    });

    test('should handle service initialization errors gracefully', async () => {
      const { initializeAccessibility } = require('../../src/services/accessibilityService');
      initializeAccessibility.mockRejectedValueOnce(new Error('Init error'));

      const { getAllByText } = render(<App />);

      await waitFor(() => {
        // App should still render - use getAllByText since multiple elements match
        const elements = getAllByText(/Parking|Map|Study|Settings|Welcome/i);
        expect(elements.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });
});
