/**
 * Integration Tests for AppContext
 * Tests global state management and actions
 */

import React from 'react';
import { Text, Button } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '../../src/contexts/ThemeContext';

// Mock database service to prevent import errors
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
import { ParkingLot, ParkedVehicle, UserPreferences } from '../../src/types';

// Helper to wrap AppProvider with ThemeProvider
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

// Test component that uses the context
const TestConsumer: React.FC = () => {
  const { state, dispatch, updatePreferences, saveParkedVehicle } = useApp();

  return (
    <>
      <Text testID="loading">{state.isLoading ? 'loading' : 'not-loading'}</Text>
      <Text testID="darkMode">{state.user?.preferences.darkMode ? 'dark' : 'light'}</Text>
      <Text testID="voiceGuidance">{state.user?.preferences.voiceGuidance ? 'on' : 'off'}</Text>
      <Text testID="parkedVehicle">{state.parkedVehicle ? 'parked' : 'not-parked'}</Text>

      <Button
        testID="toggleDarkMode"
        title="Toggle Dark Mode"
        onPress={() => updatePreferences({ darkMode: !state.user?.preferences.darkMode })}
      />
      <Button
        testID="enableVoice"
        title="Enable Voice"
        onPress={() => updatePreferences({ voiceGuidance: true })}
      />
      <Button
        testID="setLoading"
        title="Set Loading"
        onPress={() => dispatch({ type: 'SET_LOADING', payload: true })}
      />
      <Button
        testID="parkVehicle"
        title="Park Vehicle"
        onPress={() => saveParkedVehicle({
          id: 'vehicle-123',
          parkingLotId: 'lot-1',
          parkedAt: new Date(),
          latitude: 37.7749,
          longitude: -122.4194,
        })}
      />
      <Button
        testID="clearVehicle"
        title="Clear Vehicle"
        onPress={() => saveParkedVehicle(null)}
      />
    </>
  );
};

describe('AppContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('Initial State', () => {
    test('should have loading state initially false', async () => {
      const { getByTestId } = renderWithProviders(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('not-loading');
      });
    });

    test('should have default user preferences', async () => {
      const { getByTestId } = renderWithProviders(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByTestId('darkMode').props.children).toBe('light');
        expect(getByTestId('voiceGuidance').props.children).toBe('off');
      });
    });
  });

  describe('User Preferences', () => {
    test('should toggle dark mode', async () => {
      const { getByTestId } = renderWithProviders(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByTestId('darkMode').props.children).toBe('light');
      });

      fireEvent.press(getByTestId('toggleDarkMode'));

      await waitFor(() => {
        expect(getByTestId('darkMode').props.children).toBe('dark');
      });
    });

    test('should enable voice guidance', async () => {
      const { getByTestId } = renderWithProviders(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByTestId('voiceGuidance').props.children).toBe('off');
      });

      fireEvent.press(getByTestId('enableVoice'));

      await waitFor(() => {
        expect(getByTestId('voiceGuidance').props.children).toBe('on');
      });
    });

    test('should persist preferences to AsyncStorage', async () => {
      const { getByTestId } = renderWithProviders(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        fireEvent.press(getByTestId('toggleDarkMode'));
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    test('should update loading state', async () => {
      const { getByTestId } = renderWithProviders(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('not-loading');
      });

      fireEvent.press(getByTestId('setLoading'));

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('loading');
      });
    });
  });

  describe('Parked Vehicle', () => {
    test('should save parked vehicle', async () => {
      const { getByTestId } = renderWithProviders(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      await waitFor(() => {
        expect(getByTestId('parkedVehicle').props.children).toBe('not-parked');
      });

      fireEvent.press(getByTestId('parkVehicle'));

      await waitFor(() => {
        expect(getByTestId('parkedVehicle').props.children).toBe('parked');
      });
    });

    test('should clear parked vehicle', async () => {
      const { getByTestId } = renderWithProviders(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      fireEvent.press(getByTestId('parkVehicle'));

      await waitFor(() => {
        expect(getByTestId('parkedVehicle').props.children).toBe('parked');
      });

      fireEvent.press(getByTestId('clearVehicle'));

      await waitFor(() => {
        expect(getByTestId('parkedVehicle').props.children).toBe('not-parked');
      });
    });
  });

  describe('Persistence', () => {
    test('should load saved state from AsyncStorage', async () => {
      const savedState = {
        user: {
          id: 'user-1',
          preferences: {
            darkMode: true,
            voiceGuidance: true,
            hapticFeedback: true,
            highContrast: false,
            accessibilityMode: false,
            fontSize: 'medium' as const,
          },
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(savedState)
      );

      const { getByTestId } = renderWithProviders(
        <AppProvider>
          <TestConsumer />
        </AppProvider>
      );

      // Will show defaults initially, then load from storage
      await waitFor(() => {
        expect(AsyncStorage.getItem).toHaveBeenCalled();
      });
    });
  });
});
