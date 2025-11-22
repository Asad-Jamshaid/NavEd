# Testing Best Practices for React Native Expo Apps

## Jest + React Native Testing Library Guide

**Last Updated:** November 2025
**Framework:** Jest 29.x + @testing-library/react-native

---

## Table of Contents

1. [Setup & Configuration](#1-setup--configuration)
2. [Mocking Strategies](#2-mocking-strategies)
3. [Component Testing Patterns](#3-component-testing-patterns)
4. [Service/Logic Testing](#4-servicelogic-testing)
5. [Context & State Testing](#5-context--state-testing)
6. [Async Testing](#6-async-testing)
7. [Navigation Testing](#7-navigation-testing)
8. [Common Test Patterns](#8-common-test-patterns)

---

## 1. Setup & Configuration

### jest.config.js

```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
  },
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### jest.setup.js (Complete Mock Setup)

```javascript
// jest.setup.js

import '@testing-library/jest-native/extend-expect';

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo Location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  requestBackgroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 33.6844,
        longitude: 73.0479,
        altitude: 0,
        accuracy: 10,
        heading: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    })
  ),
  watchPositionAsync: jest.fn(() => ({ remove: jest.fn() })),
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
}));

// Mock Expo Speech
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])),
}));

// Mock Expo Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock Expo Notifications
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getExpoPushTokenAsync: jest.fn(() =>
    Promise.resolve({ data: 'ExponentPushToken[mock]' })
  ),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock Expo Document Picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() =>
    Promise.resolve({
      type: 'success',
      uri: 'file://mock/document.pdf',
      name: 'document.pdf',
      size: 1024,
      mimeType: 'application/pdf',
    })
  ),
}));

// Mock Expo File System
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(() => Promise.resolve('Mock file content')),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  getInfoAsync: jest.fn(() =>
    Promise.resolve({ exists: true, size: 1024, isDirectory: false })
  ),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  documentDirectory: 'file://documents/',
  cacheDirectory: 'file://cache/',
  EncodingType: {
    UTF8: 'utf8',
    Base64: 'base64',
  },
}));

// Mock Expo Camera
jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(() =>
      Promise.resolve({ status: 'granted' })
    ),
    Constants: {
      Type: { back: 'back', front: 'front' },
    },
  },
  useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn()]),
}));

// Mock Expo Image Picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file://mock/image.jpg' }],
    })
  ),
  launchCameraAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file://mock/photo.jpg' }],
    })
  ),
  MediaTypeOptions: {
    All: 'All',
    Images: 'Images',
    Videos: 'Videos',
  },
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    })
  ),
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MockMapView = (props) => <View testID="map-view" {...props} />;
  MockMapView.Marker = (props) => <View testID="marker" {...props} />;
  MockMapView.Polyline = (props) => <View testID="polyline" {...props} />;
  MockMapView.Circle = (props) => <View testID="circle" {...props} />;
  MockMapView.Callout = (props) => <View testID="callout" {...props} />;

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMapView.Marker,
    Polyline: MockMapView.Polyline,
    Circle: MockMapView.Circle,
    Callout: MockMapView.Callout,
    PROVIDER_GOOGLE: 'google',
    PROVIDER_DEFAULT: null,
  };
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useFocusEffect: jest.fn(),
  };
});

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
```

---

## 2. Mocking Strategies

### Creating Reusable Mocks

```typescript
// __mocks__/mockData.ts

export const mockBuilding = {
  id: 'building-1',
  name: 'Main Library',
  code: 'LIB',
  category: 'library',
  coordinate: {
    latitude: 33.6844,
    longitude: 73.0479,
  },
  description: 'Main campus library',
  floors: 3,
  accessibilityFeatures: ['wheelchair_ramp', 'elevator'],
  facilities: ['Study rooms', 'Computer lab'],
};

export const mockParkingLot = {
  id: 'parking-1',
  name: 'Main Parking',
  code: 'P1',
  totalSpots: 200,
  availableSpots: 50,
  coordinate: {
    latitude: 33.6840,
    longitude: 73.0470,
  },
  type: 'student',
};

export const mockDocument = {
  id: 'doc-1',
  name: 'Study Notes.pdf',
  uri: 'file://documents/study-notes.pdf',
  type: 'pdf',
  size: 1024000,
  createdAt: '2024-01-01T00:00:00Z',
};

export const mockUser = {
  id: 'user-1',
  preferences: {
    accessibilityMode: false,
    highContrast: false,
    fontSize: 'medium',
    voiceGuidance: true,
    hapticFeedback: true,
    darkMode: false,
  },
};
```

### Mocking API Calls

```typescript
// __mocks__/api.ts

export const mockFetch = (response: any, ok: boolean = true) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      status: ok ? 200 : 400,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  ) as jest.Mock;
};

export const mockFetchError = (errorMessage: string) => {
  global.fetch = jest.fn(() =>
    Promise.reject(new Error(errorMessage))
  ) as jest.Mock;
};

export const mockFetchSequence = (responses: any[]) => {
  let callIndex = 0;
  global.fetch = jest.fn(() => {
    const response = responses[callIndex] || responses[responses.length - 1];
    callIndex++;
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
    });
  }) as jest.Mock;
};
```

### Mocking AsyncStorage with Data

```typescript
// __mocks__/asyncStorageMock.ts

let mockStorage: Record<string, string> = {};

export const mockAsyncStorage = {
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  getItem: jest.fn((key: string) => {
    return Promise.resolve(mockStorage[key] || null);
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    mockStorage = {};
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => {
    return Promise.resolve(Object.keys(mockStorage));
  }),
  multiGet: jest.fn((keys: string[]) => {
    return Promise.resolve(keys.map(key => [key, mockStorage[key] || null]));
  }),
  multiSet: jest.fn((pairs: [string, string][]) => {
    pairs.forEach(([key, value]) => {
      mockStorage[key] = value;
    });
    return Promise.resolve();
  }),
};

// Reset storage between tests
export const resetMockStorage = () => {
  mockStorage = {};
  jest.clearAllMocks();
};

// Pre-populate storage
export const seedMockStorage = (data: Record<string, any>) => {
  Object.entries(data).forEach(([key, value]) => {
    mockStorage[key] = typeof value === 'string' ? value : JSON.stringify(value);
  });
};
```

---

## 3. Component Testing Patterns

### Basic Component Test

```typescript
// __tests__/components/BuildingCard.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BuildingCard from '../../src/components/BuildingCard';
import { mockBuilding } from '../__mocks__/mockData';

describe('BuildingCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders building name correctly', () => {
    const { getByText } = render(
      <BuildingCard building={mockBuilding} onPress={mockOnPress} />
    );

    expect(getByText('Main Library')).toBeTruthy();
  });

  it('displays building code', () => {
    const { getByText } = render(
      <BuildingCard building={mockBuilding} onPress={mockOnPress} />
    );

    expect(getByText('LIB')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(
      <BuildingCard building={mockBuilding} onPress={mockOnPress} />
    );

    fireEvent.press(getByTestId('building-card'));

    expect(mockOnPress).toHaveBeenCalledWith(mockBuilding.id);
  });

  it('shows accessibility features when available', () => {
    const { getByText } = render(
      <BuildingCard building={mockBuilding} onPress={mockOnPress} />
    );

    expect(getByText(/wheelchair/i)).toBeTruthy();
  });

  it('applies selected styles when isSelected is true', () => {
    const { getByTestId } = render(
      <BuildingCard
        building={mockBuilding}
        onPress={mockOnPress}
        isSelected={true}
      />
    );

    const card = getByTestId('building-card');
    // Check for selected styling
    expect(card.props.style).toContainEqual(
      expect.objectContaining({ borderColor: expect.any(String) })
    );
  });
});
```

### Testing with Context

```typescript
// __tests__/components/ParkingStatus.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AppProvider } from '../../src/contexts/AppContext';
import ParkingStatus from '../../src/components/ParkingStatus';
import { mockParkingLot } from '../__mocks__/mockData';

// Wrapper component for providing context
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AppProvider>{component}</AppProvider>
  );
};

describe('ParkingStatus', () => {
  it('displays availability percentage', () => {
    const { getByText } = renderWithProviders(
      <ParkingStatus lot={mockParkingLot} />
    );

    // 50 available out of 200 = 75% full
    expect(getByText(/75%/)).toBeTruthy();
  });

  it('shows correct color for high availability', () => {
    const lotWithHighAvailability = {
      ...mockParkingLot,
      availableSpots: 150, // 75% available
    };

    const { getByTestId } = renderWithProviders(
      <ParkingStatus lot={lotWithHighAvailability} />
    );

    const indicator = getByTestId('availability-indicator');
    // Should be green
    expect(indicator.props.style.backgroundColor).toBe('#4CAF50');
  });

  it('shows correct color for low availability', () => {
    const lotWithLowAvailability = {
      ...mockParkingLot,
      availableSpots: 10, // 5% available
    };

    const { getByTestId } = renderWithProviders(
      <ParkingStatus lot={lotWithLowAvailability} />
    );

    const indicator = getByTestId('availability-indicator');
    // Should be red
    expect(indicator.props.style.backgroundColor).toBe('#F44336');
  });
});
```

---

## 4. Service/Logic Testing

### Testing Pure Functions

```typescript
// __tests__/services/navigationService.test.ts

import {
  calculateDistance,
  formatDuration,
  formatDistance,
  formatInstruction,
} from '../../src/services/navigationService';

describe('navigationService', () => {
  describe('calculateDistance', () => {
    it('calculates distance between two points correctly', () => {
      const point1 = { latitude: 0, longitude: 0 };
      const point2 = { latitude: 0, longitude: 1 };

      const distance = calculateDistance(point1, point2);

      // 1 degree longitude at equator ≈ 111km
      expect(distance).toBeCloseTo(111195, -2);
    });

    it('returns 0 for same point', () => {
      const point = { latitude: 33.6844, longitude: 73.0479 };

      const distance = calculateDistance(point, point);

      expect(distance).toBe(0);
    });
  });

  describe('formatDuration', () => {
    it('formats seconds correctly', () => {
      expect(formatDuration(30)).toBe('30 sec');
    });

    it('formats minutes correctly', () => {
      expect(formatDuration(120)).toBe('2 min');
    });

    it('formats hours and minutes correctly', () => {
      expect(formatDuration(3720)).toBe('1h 2m');
    });
  });

  describe('formatDistance', () => {
    it('formats meters correctly', () => {
      expect(formatDistance(500)).toBe('500 m');
    });

    it('formats kilometers correctly', () => {
      expect(formatDistance(2500)).toBe('2.5 km');
    });
  });

  describe('formatInstruction', () => {
    it('formats turn instruction correctly', () => {
      const step = {
        maneuver: { type: 'turn', modifier: 'right' },
        name: 'Main Street',
        distance: 100,
      };

      const instruction = formatInstruction(step);

      expect(instruction).toContain('right');
      expect(instruction).toContain('Main Street');
    });

    it('formats arrival instruction', () => {
      const step = {
        maneuver: { type: 'arrive' },
        name: '',
        distance: 0,
      };

      const instruction = formatInstruction(step);

      expect(instruction).toContain('Arrive');
    });
  });
});
```

### Testing Async Service Functions

```typescript
// __tests__/services/parkingService.test.ts

import {
  getParkingLots,
  reportParkingAvailability,
  saveVehicleLocation,
  getVehicleLocation,
} from '../../src/services/parkingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

describe('parkingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getParkingLots', () => {
    it('returns parking lots with updated availability', async () => {
      // Mock stored reports
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([
          {
            lotId: 'parking-1',
            availableSpots: 40,
            timestamp: new Date().toISOString(),
          },
        ])
      );

      const lots = await getParkingLots();

      expect(lots).toBeInstanceOf(Array);
      expect(lots.length).toBeGreaterThan(0);
    });
  });

  describe('reportParkingAvailability', () => {
    it('saves report to storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await reportParkingAvailability('parking-1', 30, 'user-1');

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const [key, value] = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      expect(key).toContain('parking');
      const savedData = JSON.parse(value);
      expect(savedData).toContainEqual(
        expect.objectContaining({
          lotId: 'parking-1',
          availableSpots: 30,
        })
      );
    });
  });

  describe('saveVehicleLocation', () => {
    it('saves vehicle location correctly', async () => {
      const vehicle = {
        coordinate: { latitude: 33.6844, longitude: 73.0479 },
        parkingLotId: 'parking-1',
        spotNumber: 'A-23',
        timestamp: new Date().toISOString(),
      };

      await saveVehicleLocation(vehicle);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify(vehicle)
      );
    });
  });

  describe('getVehicleLocation', () => {
    it('returns saved vehicle location', async () => {
      const savedVehicle = {
        coordinate: { latitude: 33.6844, longitude: 73.0479 },
        parkingLotId: 'parking-1',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(savedVehicle)
      );

      const vehicle = await getVehicleLocation();

      expect(vehicle).toEqual(savedVehicle);
    });

    it('returns null when no vehicle saved', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const vehicle = await getVehicleLocation();

      expect(vehicle).toBeNull();
    });
  });
});
```

---

## 5. Context & State Testing

### Testing Context Provider

```typescript
// __tests__/contexts/AppContext.test.tsx

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AppProvider, useAppContext } from '../../src/contexts/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe('AppContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('provides initial state', async () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    // Wait for initialization
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.user).toBeDefined();
  });

  it('updates preferences correctly', async () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    await act(async () => {
      await result.current.updatePreferences({ darkMode: true });
    });

    expect(result.current.state.user?.preferences.darkMode).toBe(true);
  });

  it('saves parked vehicle', async () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    const vehicle = {
      coordinate: { latitude: 33.6844, longitude: 73.0479 },
      parkingLotId: 'parking-1',
      timestamp: new Date().toISOString(),
    };

    await act(async () => {
      await result.current.saveParkedVehicle(vehicle);
    });

    expect(result.current.state.parkedVehicle).toEqual(vehicle);
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('adds document to library', async () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    const document = {
      id: 'doc-1',
      name: 'Test.pdf',
      uri: 'file://test.pdf',
      type: 'pdf' as const,
      size: 1024,
      createdAt: new Date().toISOString(),
    };

    await act(async () => {
      await result.current.addDocument(document);
    });

    expect(result.current.state.documents).toContainEqual(document);
  });

  it('removes document from library', async () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    // First add a document
    const document = {
      id: 'doc-1',
      name: 'Test.pdf',
      uri: 'file://test.pdf',
      type: 'pdf' as const,
      size: 1024,
      createdAt: new Date().toISOString(),
    };

    await act(async () => {
      await result.current.addDocument(document);
    });

    // Then remove it
    await act(async () => {
      await result.current.removeDocument('doc-1');
    });

    expect(result.current.state.documents).not.toContainEqual(
      expect.objectContaining({ id: 'doc-1' })
    );
  });

  it('toggles accessibility mode', async () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    const initialValue = result.current.state.isAccessibilityMode;

    await act(async () => {
      result.current.dispatch({ type: 'TOGGLE_ACCESSIBILITY' });
    });

    expect(result.current.state.isAccessibilityMode).toBe(!initialValue);
  });
});
```

---

## 6. Async Testing

### Testing with waitFor

```typescript
// __tests__/screens/ParkingScreen.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ParkingScreen from '../../src/screens/parking/ParkingScreen';
import { AppProvider } from '../../src/contexts/AppContext';
import * as parkingService from '../../src/services/parkingService';

jest.mock('../../src/services/parkingService');

const renderWithProviders = (component: React.ReactElement) => {
  return render(<AppProvider>{component}</AppProvider>);
};

describe('ParkingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (parkingService.getParkingLots as jest.Mock).mockResolvedValue([
      {
        id: 'parking-1',
        name: 'Main Parking',
        totalSpots: 200,
        availableSpots: 50,
      },
    ]);
  });

  it('loads and displays parking lots', async () => {
    const { getByText } = renderWithProviders(<ParkingScreen />);

    await waitFor(() => {
      expect(getByText('Main Parking')).toBeTruthy();
    });
  });

  it('shows loading state initially', () => {
    const { getByTestId } = renderWithProviders(<ParkingScreen />);

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('handles report submission', async () => {
    (parkingService.reportParkingAvailability as jest.Mock).mockResolvedValue(undefined);

    const { getByText, getByTestId } = renderWithProviders(<ParkingScreen />);

    // Wait for data to load
    await waitFor(() => {
      expect(getByText('Main Parking')).toBeTruthy();
    });

    // Open report modal
    fireEvent.press(getByText('Report'));

    // Submit report
    await waitFor(() => {
      expect(getByTestId('report-modal')).toBeTruthy();
    });

    fireEvent.press(getByText('Submit'));

    await waitFor(() => {
      expect(parkingService.reportParkingAvailability).toHaveBeenCalled();
    });
  });

  it('displays error message on fetch failure', async () => {
    (parkingService.getParkingLots as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { getByText } = renderWithProviders(<ParkingScreen />);

    await waitFor(() => {
      expect(getByText(/error|failed/i)).toBeTruthy();
    });
  });
});
```

---

## 7. Navigation Testing

### Testing Navigation Actions

```typescript
// __tests__/screens/CampusMapScreen.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import CampusMapScreen from '../../src/screens/navigation/CampusMapScreen';
import { AppProvider } from '../../src/contexts/AppContext';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
  }),
}));

const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      <AppProvider>{component}</AppProvider>
    </NavigationContainer>
  );
};

describe('CampusMapScreen Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to building details on marker press', async () => {
    const { getAllByTestId } = renderWithNavigation(<CampusMapScreen />);

    await waitFor(() => {
      const markers = getAllByTestId('marker');
      expect(markers.length).toBeGreaterThan(0);
    });

    const markers = getAllByTestId('marker');
    fireEvent.press(markers[0]);

    // Verify navigation or detail panel opens
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        'BuildingDetail',
        expect.any(Object)
      );
    });
  });
});
```

---

## 8. Common Test Patterns

### Snapshot Testing

```typescript
// __tests__/components/AccessibleButton.snapshot.test.tsx

import React from 'react';
import { render } from '@testing-library/react-native';
import AccessibleButton from '../../src/components/common/AccessibleButton';

describe('AccessibleButton Snapshots', () => {
  it('renders primary variant correctly', () => {
    const tree = render(
      <AccessibleButton
        title="Primary Button"
        onPress={() => {}}
        variant="primary"
      />
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders disabled state correctly', () => {
    const tree = render(
      <AccessibleButton
        title="Disabled Button"
        onPress={() => {}}
        disabled
      />
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders loading state correctly', () => {
    const tree = render(
      <AccessibleButton
        title="Loading Button"
        onPress={() => {}}
        loading
      />
    ).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
```

### Testing Error Boundaries

```typescript
// __tests__/components/ErrorBoundary.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import ErrorBoundary from '../../src/components/common/ErrorBoundary';

// Component that throws an error
const BrokenComponent = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  // Suppress console.error for error boundary tests
  const originalError = console.error;

  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Child content</Text>
      </ErrorBoundary>
    );

    expect(getByText('Child content')).toBeTruthy();
  });

  it('renders error UI when error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(getByText(/something went wrong/i)).toBeTruthy();
  });

  it('allows retry after error', () => {
    let shouldThrow = true;

    const ConditionallyBroken = () => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <Text>Recovered</Text>;
    };

    const { getByText, queryByText } = render(
      <ErrorBoundary>
        <ConditionallyBroken />
      </ErrorBoundary>
    );

    // Should show error UI
    expect(getByText(/something went wrong/i)).toBeTruthy();

    // Fix the error condition
    shouldThrow = false;

    // Press retry
    fireEvent.press(getByText(/try again/i));

    // Should recover
    expect(queryByText(/something went wrong/i)).toBeNull();
  });
});
```

---

## Test Coverage Script

```json
// package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --reporters=default --reporters=jest-junit"
  }
}
```

---

## Sources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Expo Unit Testing Guide](https://docs.expo.dev/develop/unit-testing/)
- [Testing Overview - React Native](https://reactnative.dev/docs/testing-overview)

---

**Document Version:** 1.0
**Last Updated:** November 2025
