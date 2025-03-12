const {getDefaultConfig} = require('@react-native/metro-config');
const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  ...getDefaultConfig(__dirname),
  resolver: {
    extraNodeModules: {
      '@screens': `${__dirname}/src/screens`,
    },
    assetExts: ['png', 'jpg', 'jpeg', 'gif'],
  },
};

module.exports = wrapWithReanimatedMetroConfig(config);
