#!/usr/bin/env node

/**
 * App Icon Generator for Conflict Connect
 * This script generates all required iOS app icon sizes from a source image
 */

const fs = require('fs');
const path = require('path');

// iOS App Icon sizes required
const iconSizes = [
  { size: 20, name: 'App-Icon-20x20@1x.png' },
  { size: 40, name: 'App-Icon-20x20@2x.png' },
  { size: 60, name: 'App-Icon-20x20@3x.png' },
  { size: 29, name: 'App-Icon-29x29@1x.png' },
  { size: 58, name: 'App-Icon-29x29@2x.png' },
  { size: 87, name: 'App-Icon-29x29@3x.png' },
  { size: 40, name: 'App-Icon-40x40@1x.png' },
  { size: 80, name: 'App-Icon-40x40@2x.png' },
  { size: 120, name: 'App-Icon-40x40@3x.png' },
  { size: 76, name: 'App-Icon-76x76@1x.png' },
  { size: 152, name: 'App-Icon-76x76@2x.png' },
  { size: 167, name: 'App-Icon-83.5x83.5@2x.png' },
  { size: 1024, name: 'App-Icon-1024x1024@1x.png' }
];

const sourceIconPath = path.join(__dirname, '../assets/images/conflict-connect-icon.png');
const outputDir = path.join(__dirname, '../ios/ConflictConnect/Images.xcassets/AppIcon.appiconset');

console.log('🎨 Conflict Connect App Icon Generator');
console.log('=====================================');

// Check if source icon exists
if (!fs.existsSync(sourceIconPath)) {
  console.log('❌ Source icon not found at:', sourceIconPath);
  console.log('📝 Please place your app icon image at: assets/images/conflict-connect-icon.png');
  console.log('   The image should be at least 1024x1024 pixels and cropped to remove the star in the bottom right.');
  process.exit(1);
}

console.log('✅ Source icon found:', sourceIconPath);
console.log('📁 Output directory:', outputDir);

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('📁 Created output directory');
}

// Generate Contents.json for AppIcon.appiconset
const contentsJson = {
  "images": [
    {
      "filename": "App-Icon-20x20@1x.png",
      "idiom": "iphone",
      "scale": "1x",
      "size": "20x20"
    },
    {
      "filename": "App-Icon-20x20@2x.png",
      "idiom": "iphone",
      "scale": "2x",
      "size": "20x20"
    },
    {
      "filename": "App-Icon-20x20@3x.png",
      "idiom": "iphone",
      "scale": "3x",
      "size": "20x20"
    },
    {
      "filename": "App-Icon-29x29@1x.png",
      "idiom": "iphone",
      "scale": "1x",
      "size": "29x29"
    },
    {
      "filename": "App-Icon-29x29@2x.png",
      "idiom": "iphone",
      "scale": "2x",
      "size": "29x29"
    },
    {
      "filename": "App-Icon-29x29@3x.png",
      "idiom": "iphone",
      "scale": "3x",
      "size": "29x29"
    },
    {
      "filename": "App-Icon-40x40@1x.png",
      "idiom": "iphone",
      "scale": "1x",
      "size": "40x40"
    },
    {
      "filename": "App-Icon-40x40@2x.png",
      "idiom": "iphone",
      "scale": "2x",
      "size": "40x40"
    },
    {
      "filename": "App-Icon-40x40@3x.png",
      "idiom": "iphone",
      "scale": "3x",
      "size": "40x40"
    },
    {
      "filename": "App-Icon-60x60@2x.png",
      "idiom": "iphone",
      "scale": "2x",
      "size": "60x60"
    },
    {
      "filename": "App-Icon-60x60@3x.png",
      "idiom": "iphone",
      "scale": "3x",
      "size": "60x60"
    },
    {
      "filename": "App-Icon-76x76@1x.png",
      "idiom": "ipad",
      "scale": "1x",
      "size": "76x76"
    },
    {
      "filename": "App-Icon-76x76@2x.png",
      "idiom": "ipad",
      "scale": "2x",
      "size": "76x76"
    },
    {
      "filename": "App-Icon-83.5x83.5@2x.png",
      "idiom": "ipad",
      "scale": "2x",
      "size": "83.5x83.5"
    },
    {
      "filename": "App-Icon-1024x1024@1x.png",
      "idiom": "ios-marketing",
      "scale": "1x",
      "size": "1024x1024"
    }
  ],
  "info": {
    "author": "xcode",
    "version": 1
  }
};

// Write Contents.json
fs.writeFileSync(
  path.join(outputDir, 'Contents.json'),
  JSON.stringify(contentsJson, null, 2)
);

console.log('📄 Generated Contents.json');

console.log('⚠️  Manual Steps Required:');
console.log('1. Place your cropped app icon image at: assets/images/conflict-connect-icon.png');
console.log('2. The image should be at least 1024x1024 pixels');
console.log('3. Make sure to crop out the star in the bottom right corner');
console.log('4. Run this script again to generate all icon sizes');
console.log('');
console.log('💡 You can use online tools like:');
console.log('   - https://appicon.co/');
console.log('   - https://makeappicon.com/');
console.log('   - Or use ImageMagick/sips command line tools');

console.log('');
console.log('🎯 Next steps:');
console.log('1. Add your cropped icon image to assets/images/conflict-connect-icon.png');
console.log('2. Run: node scripts/generate-app-icon.js');
console.log('3. Build your app in Xcode');

