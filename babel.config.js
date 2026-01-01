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
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@contexts': './src/contexts',
            '@utils': './src/utils',
            '@types': './src/types',
            '@data': './src/data',
            '@assets': './assets',
          },
        },
      ],
      // Keep reanimated plugin last
      'react-native-reanimated/plugin',
    ],
  };
};
