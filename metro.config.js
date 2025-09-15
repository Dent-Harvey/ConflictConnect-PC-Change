const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add resolver for native-only modules to prevent web build errors
config.resolver.extraNodeModules = {
  'react-native/Libraries/Utilities/codegenNativeCommands': path.resolve(__dirname, 'metro-mocks/codegenNativeCommands.js'),
};

// Add support for additional file extensions
config.resolver.assetExts.push(
  // Fonts
  'otf',
  'ttf',
  // Images
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg'
);

// Enable hermes for better performance
config.transformer.hermesParser = true;

module.exports = config;