module.exports = function (api) {
  api.cache(true);

  // Detect if we're in test environment
  const isTest = process.env.NODE_ENV === 'test';

  return {
    presets: [
      'babel-preset-expo',
      // Add TypeScript support for tests only
      ...(isTest ? ['@babel/preset-typescript'] : []),
    ],
    plugins: [
      // Environment variables from .env file
      [
        'module:react-native-dotenv',
        {
          envName: 'APP_ENV',
          moduleName: '@env',
          path: '.env',
          safe: false,
          allowUndefined: true,
          verbose: false,
        },
      ],
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './frontend',
            '@components': './frontend/shared/components',
            '@screens': './frontend/features',
            '@services': './frontend/shared/services',
            '@contexts': './frontend/shared/contexts',
            '@utils': './frontend/shared/utils',
            '@types': './frontend/shared/types',
            '@data': './frontend/shared/data',
            '@assets': './assets',
          },
        },
      ],
      // Keep reanimated plugin last
      'react-native-reanimated/plugin',
    ],
  };
};
