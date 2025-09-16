#!/usr/bin/env node

/**
 * Creates a placeholder app icon for Conflict Connect
 * This is a temporary icon until you provide your actual design
 */

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const svgIcon = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="text" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFA500;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="hands" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8B4513;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#A0522D;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#bg)" rx="180" ry="180"/>
  
  <!-- Grid pattern -->
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#333333" stroke-width="1" opacity="0.3"/>
    </pattern>
  </defs>
  <rect width="1024" height="1024" fill="url(#grid)"/>
  
  <!-- Title -->
  <text x="512" y="200" font-family="Arial, sans-serif" font-size="80" font-weight="bold" text-anchor="middle" fill="url(#text)">CONFLICT</text>
  <text x="512" y="280" font-family="Arial, sans-serif" font-size="80" font-weight="bold" text-anchor="middle" fill="url(#text)">CONNECT</text>
  
  <!-- Dots -->
  <circle cx="412" cy="320" r="8" fill="url(#text)" opacity="0.8"/>
  <circle cx="432" cy="320" r="8" fill="url(#text)" opacity="0.8"/>
  <circle cx="452" cy="320" r="8" fill="url(#text)" opacity="0.8"/>
  <circle cx="472" cy="320" r="8" fill="url(#text)" opacity="0.8"/>
  <circle cx="492" cy="320" r="8" fill="url(#text)" opacity="0.8"/>
  <circle cx="512" cy="320" r="8" fill="url(#text)" opacity="0.8"/>
  <circle cx="532" cy="320" r="8" fill="url(#text)" opacity="0.8"/>
  <circle cx="552" cy="320" r="8" fill="url(#text)" opacity="0.8"/>
  <circle cx="572" cy="320" r="8" fill="url(#text)" opacity="0.8"/>
  <circle cx="592" cy="320" r="8" fill="url(#text)" opacity="0.8"/>
  <circle cx="612" cy="320" r="8" fill="url(#text)" opacity="0.8"/>
  
  <!-- Hands forming heart -->
  <g transform="translate(512, 600)">
    <!-- Left hand -->
    <path d="M -80 -20 Q -120 -40 -140 -20 Q -120 0 -100 20 Q -80 40 -60 20 Q -40 0 -20 -20 Q 0 -40 -20 -60 Q -40 -80 -60 -60 Q -80 -40 -80 -20 Z" 
          fill="url(#hands)" stroke="#654321" stroke-width="2"/>
    
    <!-- Right hand -->
    <path d="M 80 -20 Q 120 -40 140 -20 Q 120 0 100 20 Q 80 40 60 20 Q 40 0 20 -20 Q 0 -40 20 -60 Q 40 -80 60 -60 Q 80 -40 80 -20 Z" 
          fill="url(#hands)" stroke="#654321" stroke-width="2"/>
    
    <!-- Compass in center -->
    <circle cx="0" cy="0" r="30" fill="none" stroke="url(#text)" stroke-width="3"/>
    <circle cx="0" cy="0" r="5" fill="url(#text)"/>
    <line x1="0" y1="-30" x2="0" y2="30" stroke="url(#text)" stroke-width="2"/>
    <line x1="-30" y1="0" x2="30" y2="0" stroke="url(#text)" stroke-width="2"/>
    <polygon points="0,-25 5,-15 -5,-15" fill="url(#text)"/>
  </g>
</svg>
`;

// Save the SVG
const svgPath = path.join(__dirname, '../assets/images/conflict-connect-icon.svg');
fs.writeFileSync(svgPath, svgIcon);

console.log('🎨 Created placeholder app icon');
console.log('📁 Saved to: assets/images/conflict-connect-icon.svg');
console.log('');
console.log('📝 Next steps:');
console.log('1. Open the SVG file in a design tool (Figma, Sketch, etc.)');
console.log('2. Replace with your actual "CONFLICT CONNECT" design');
console.log('3. Make sure to crop out the star in the bottom right');
console.log('4. Export as PNG (1024x1024 minimum)');
console.log('5. Save as: assets/images/conflict-connect-icon.png');
console.log('6. Run: ./scripts/crop-and-resize-icon.sh');
console.log('');
console.log('💡 Or use your existing image:');
console.log('1. Save your cropped image as: assets/images/conflict-connect-icon.png');
console.log('2. Run: ./scripts/crop-and-resize-icon.sh');

