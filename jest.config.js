module.exports = {
  // Use ts-jest for TypeScript files
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Root directory
  roots: ['<rootDir>'],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test match patterns - only run basic test for now
  testMatch: ['**/__tests__/basic.test.ts'],

  // Module paths
  modulePaths: ['<rootDir>/src'],

  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types$': '<rootDir>/src/types',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    // Mock React Native modules
    'react-native$': '<rootDir>/__mocks__/react-native.js',
    '@react-native-async-storage/async-storage': '<rootDir>/__mocks__/async-storage.js',
  },

  // Transform configuration
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },

  // Files to ignore during transformation
  transformIgnorePatterns: ['/node_modules/'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Coverage
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
  ],

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,
};
