/**
 * Backward Compatibility Tests for AppContext
 * Ensures existing functionality still works after database integration
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '../../src/contexts/ThemeContext';

// Mock database service to return unavailable (tests AsyncStorage fallback)
jest.mock('../../src/services/databaseService', () => ({
  getSupabaseClient: jest.fn(() => null),
  isSupabaseAvailable: jest.fn(() => false),
}));

jest.mock('../../src/services/parkingDatabaseService', () => ({
  getParkedVehicleFromDb: jest.fn(() => Promise.resolve(null)),
  saveParkedVehicleToDb: jest.fn(() => Promise.resolve(false)),
  clearParkedVehicleFromDb: jest.fn(() => Promise.resolve(false)),
}));

// Mock authService to prevent any auth-related imports from failing
jest.mock('../../src/services/authService', () => ({
  isAuthAvailable: jest.fn(() => false),
  getSession: jest.fn(() => Promise.resolve({ session: null, error: null })),
}));

// Import after mocks are set up
import { AppProvider, useApp } from '../../src/contexts/AppContext';
import { ParkedVehicle } from '../../src/types';

// Helper to wrap AppProvider with ThemeProvider
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

// Test component
const TestConsumer: React.FC = () => {
  const { state, saveParkedVehicle, updatePreferences, clearAllData } = useApp();

  return (
    <>
      <Text testID="loading">{state.isLoading ? 'loading' : 'not-loading'}</Text>
      <Text testID="userId">{state.user?.id || 'no-user'}</Text>
      <Text testID="darkMode">{state.user?.preferences.darkMode ? 'dark' : 'light'}</Text>
      <Text testID="parkedVehicle">{state.parkedVehicle ? 'parked' : 'not-parked'}</Text>

      <Button
        testID="updatePreferences"
        title="Update Preferences"
        onPress={() => updatePreferences({ darkMode: true })}
      />
      <Button
        testID="saveVehicle"
        title="Save Vehicle"
        onPress={() =>
          saveParkedVehicle({
            id: 'vehicle-123',
            parkingLotId: 'park-1',
            parkedAt: new Date(),
            latitude: 37.7749,
            longitude: -122.4194,
          })
        }
      />
      <Button testID="clearData" title="Clear Data" onPress={() => clearAllData()} />
    </>
  );
};

describe('AppContext - Backward Compatibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Existing functionality preserved', () => {
    test('should load user from AsyncStorage when database unavailable', async () => {
      const mockUser = {
        id: 'local-user',
        preferences: {
          accessibilityMode: false,
          highContrast: false,
          fontSize: 'medium',
          voiceGuidance: false,
          hapticFeedback: true,
          preferredLanguage: 'en',
          darkMode: false,
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockUser));

      const { getByTestId } = renderWithProviders(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('not-loading');
        expect(getByTestId('userId').props.children).toBe('local-user');
      });
    });

    test('should save preferences to AsyncStorage', async () => {
      const { getByTestId } = renderWithProviders(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('not-loading');
      });

      // Update preferences
      const updateButton = getByTestId('updatePreferences');
      updateButton.props.onPress();

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });
    });

    test('should save parked vehicle to AsyncStorage', async () => {
      const { getByTestId } = renderWithProviders(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('not-loading');
      });

      const saveButton = getByTestId('saveVehicle');
      saveButton.props.onPress();

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });
    });

    test('should clear all data from AsyncStorage', async () => {
      const { getByTestId } = renderWithProviders(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('not-loading');
      });

      const clearButton = getByTestId('clearData');
      clearButton.props.onPress();

      await waitFor(() => {
        expect(AsyncStorage.multiRemove).toHaveBeenCalled();
      });
    });
  });

  describe('Default user behavior', () => {
    test('should create default user when no data exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { getByTestId } = renderWithProviders(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('not-loading');
        expect(getByTestId('userId').props.children).toBe('local-user');
      });
    });

    test('should have default preferences', async () => {
      const { getByTestId } = renderWithProviders(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByTestId('darkMode').props.children).toBe('light');
      });
    });
  });

  describe('Error handling', () => {
    test('should handle AsyncStorage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const { getByTestId } = renderWithProviders(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        // Should still render without crashing
        expect(getByTestId('loading').props.children).toBe('not-loading');
      });
    });

    test('should handle save errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const { getByTestId } = renderWithProviders(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('not-loading');
      });

      const saveButton = getByTestId('saveVehicle');
      saveButton.props.onPress();

      // Should not throw
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });
    });
  });
});



