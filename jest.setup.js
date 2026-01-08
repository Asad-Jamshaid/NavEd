// Jest Setup File for NavEd
// Essential mocks and configuration for testing

import { StyleSheet } from 'react-native';
import * as ReactNative from 'react-native';

// Ensure StyleSheet.flatten is available (required by @testing-library/react-native)
if (!StyleSheet.flatten) {
  StyleSheet.flatten = (style) => {
    if (!style) return {};
    if (Array.isArray(style)) {
      return style.reduce((acc, s) => ({ ...acc, ...StyleSheet.flatten(s) }), {});
    }
    return typeof style === 'object' ? style : {};
  };
}

// Mock console to reduce noise in tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch for API tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    status: 200,
    headers: {
      get: () => null,
    },
  })
);

// Mock LogBox to prevent "Cannot read properties of undefined (reading 'ignoreLogs')"
jest.mock('react-native/Libraries/LogBox/LogBox', () => ({
  ignoreLogs: jest.fn(),
  ignoreAllLogs: jest.fn(),
}));

// Mock useColorScheme (missing in jest-expo preset sometimes)
// Ensure useColorScheme is available - the __mocks__/react-native.js should handle this,
// but we also patch here as a fallback
if (!ReactNative.useColorScheme) {
  ReactNative.useColorScheme = jest.fn(() => 'light');
}

// Mock window object for React error reporting
if (typeof window === 'undefined') {
  global.window = {
    dispatchEvent: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
} else {
  if (!window.dispatchEvent) {
    window.dispatchEvent = jest.fn();
  }
}
