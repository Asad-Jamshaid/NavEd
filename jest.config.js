module.exports = {
  // Use jest-expo preset for Expo/React Native projects
  // jest-expo handles transforms, testEnvironment, and React Native setup automatically
  preset: 'jest-expo',

  // Root directory
  roots: ['<rootDir>'],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
    '**/__tests__/**/*.spec.{ts,tsx}',
  ],

  // Module paths
  modulePaths: ['<rootDir>/frontend'],

  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/frontend/$1',
    '^@components/(.*)$': '<rootDir>/frontend/shared/components/$1',
    '^@screens/(.*)$': '<rootDir>/frontend/features/$1',
    '^@services/(.*)$': '<rootDir>/frontend/shared/services/$1',
    '^@contexts/(.*)$': '<rootDir>/frontend/shared/contexts/$1',
    '^@utils/(.*)$': '<rootDir>/frontend/shared/utils/$1',
    '^@types$': '<rootDir>/frontend/shared/types',
    '^@data/(.*)$': '<rootDir>/frontend/shared/data/$1',
    // Mock react-native to use our custom mock with useColorScheme
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    // Mock third-party modules
    '@react-native-async-storage/async-storage': '<rootDir>/__mocks__/async-storage.js',
    // Mock Expo and Navigation modules
    '@expo/vector-icons': '<rootDir>/__mocks__/@expo/vector-icons.js',
    'react-native-safe-area-context': '<rootDir>/__mocks__/react-native-safe-area-context.js',
    '@react-navigation/native': '<rootDir>/__mocks__/@react-navigation/native.js',
    '@react-navigation/bottom-tabs': '<rootDir>/__mocks__/@react-navigation/bottom-tabs.js',
    '@react-navigation/native-stack': '<rootDir>/__mocks__/@react-navigation/native-stack.js',
    'expo-font': '<rootDir>/__mocks__/expo-font.js',
    'expo-haptics': '<rootDir>/__mocks__/expo-haptics.js',
    'expo-speech': '<rootDir>/__mocks__/expo-speech.js',
    'expo-notifications': '<rootDir>/__mocks__/expo-notifications.js',
    'expo-document-picker': '<rootDir>/__mocks__/expo-document-picker.js',
    'expo-file-system/legacy': '<rootDir>/__mocks__/expo-file-system/legacy.js',
    '@maplibre/maplibre-react-native': '<rootDir>/__mocks__/@maplibre/maplibre-react-native.js',
    'expo-location': '<rootDir>/__mocks__/expo-location.js',
    'expo-splash-screen': '<rootDir>/__mocks__/expo-splash-screen.js',
    'expo-av': '<rootDir>/__mocks__/expo-av.js',
  },

  // Files to ignore during transformation
  // jest-expo handles most transforms, but we need to ensure these packages are transformed
  // Negative lookahead: transform everything EXCEPT node_modules that don't match these patterns
  transformIgnorePatterns: [
    'node_modules/(?!(expo|@expo|expo-|@react-navigation|react-native|@react-native|react-native-safe-area-context|@supabase|expo-modules-core|@react-native-community|@react-native-js-polyfills|expo-font|expo-haptics|expo-speech|expo-location|expo-splash-screen|@maplibre|expo-av)/)',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Coverage
  collectCoverageFrom: [
    'frontend/**/*.{ts,tsx}',
    '!frontend/**/*.d.ts',
    '!frontend/shared/types/**/*',
  ],

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,

  // Verbose output
  verbose: true,
};
