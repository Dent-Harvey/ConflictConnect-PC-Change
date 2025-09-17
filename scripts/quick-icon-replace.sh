#!/bin/bash

# Quick App Icon Replacement Script
# This script helps you quickly replace the app icon

echo "🎨 Quick App Icon Replacement"
echo "============================="

SOURCE_IMAGE="assets/images/conflict-connect-icon.png"
TARGET_DIR="ios/ConflictConnect/Images.xcassets/AppIcon.appiconset/"

# Check if source image exists
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "❌ Source image not found: $SOURCE_IMAGE"
    echo ""
    echo "📝 Please:"
    echo "1. Save your cropped app icon as: $SOURCE_IMAGE"
    echo "2. Make sure it's at least 1024x1024 pixels"
    echo "3. Crop out the star in the bottom right corner"
    echo ""
    echo "💡 Quick steps:"
    echo "1. Open your image in Preview.app"
    echo "2. Select Tools > Rectangular Selection"
    echo "3. Select the area you want (excluding the star)"
    echo "4. Press Cmd+K to crop"
    echo "5. Save as PNG format to: $SOURCE_IMAGE"
    exit 1
fi

echo "✅ Source image found: $SOURCE_IMAGE"

# Get image dimensions
DIMENSIONS=$(sips -g pixelWidth -g pixelHeight "$SOURCE_IMAGE" | grep -E "(pixelWidth|pixelHeight)" | awk '{print $2}')
WIDTH=$(echo "$DIMENSIONS" | head -1)
HEIGHT=$(echo "$DIMENSIONS" | tail -1)

echo "📐 Image dimensions: ${WIDTH}x${HEIGHT}"

# Check if image is large enough
if [ "$WIDTH" -lt 1024 ] || [ "$HEIGHT" -lt 1024 ]; then
    echo "⚠️  Warning: Image is smaller than 1024x1024. Quality may be reduced."
fi

# Create square version if needed
if [ "$WIDTH" != "$HEIGHT" ]; then
    echo "✂️  Cropping to square..."
    sips -z "$WIDTH" "$WIDTH" "$SOURCE_IMAGE" --out "$SOURCE_IMAGE.temp"
    mv "$SOURCE_IMAGE.temp" "$SOURCE_IMAGE"
fi

# Resize to 1024x1024
echo "📏 Resizing to 1024x1024..."
sips -z 1024 1024 "$SOURCE_IMAGE" --out "$TARGET_DIR/App-Icon-1024x1024@1x.png"

# Also update the main icon files
echo "📱 Updating main icon files..."
cp "$TARGET_DIR/App-Icon-1024x1024@1x.png" "assets/images/icon.png"
cp "$TARGET_DIR/App-Icon-1024x1024@1x.png" "assets/images/adaptive-icon.png"
cp "$TARGET_DIR/App-Icon-1024x1024@1x.png" "assets/images/splash-icon.png"

echo ""
echo "✅ App icon updated successfully!"
echo ""
echo "📁 Updated files:"
echo "   - iOS AppIcon: $TARGET_DIR/App-Icon-1024x1024@1x.png"
echo "   - Main icon: assets/images/icon.png"
echo "   - Adaptive icon: assets/images/adaptive-icon.png"
echo "   - Splash icon: assets/images/splash-icon.png"
echo ""
echo "🎯 Next steps:"
echo "1. Build your app: npx expo run:ios"
echo "2. Or build in Xcode: Product → Run"
echo "3. Your new icon should appear on the device!"
echo ""
echo "💡 If the icon doesn't appear immediately:"
echo "   - Delete the app from your device"
echo "   - Rebuild and reinstall"
echo "   - iOS sometimes caches old icons"


