const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

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