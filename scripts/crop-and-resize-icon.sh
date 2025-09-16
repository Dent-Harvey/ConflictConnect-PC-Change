#!/bin/bash

# Conflict Connect App Icon Cropper and Resizer
# This script helps crop and resize your app icon for iOS

echo "🎨 Conflict Connect App Icon Processor"
echo "====================================="

# Check if sips is available (macOS built-in tool)
if ! command -v sips &> /dev/null; then
    echo "❌ sips command not found. This script requires macOS."
    exit 1
fi

# Source image path
SOURCE_IMAGE="assets/images/conflict-connect-icon.png"
OUTPUT_DIR="assets/images/"

# Check if source image exists
if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "❌ Source image not found: $SOURCE_IMAGE"
    echo ""
    echo "📝 Please:"
    echo "1. Save your app icon image as: $SOURCE_IMAGE"
    echo "2. Make sure it's at least 1024x1024 pixels"
    echo "3. Crop out the star in the bottom right corner"
    echo ""
    echo "💡 You can use Preview.app on macOS to crop the image:"
    echo "   - Open the image in Preview"
    echo "   - Select Tools > Rectangular Selection"
    echo "   - Select the area you want (excluding the star)"
    echo "   - Press Cmd+K to crop"
    echo "   - Save as PNG format"
    exit 1
fi

echo "✅ Source image found: $SOURCE_IMAGE"

# Get image dimensions
DIMENSIONS=$(sips -g pixelWidth -g pixelHeight "$SOURCE_IMAGE" | grep -E "(pixelWidth|pixelHeight)" | awk '{print $2}')
WIDTH=$(echo "$DIMENSIONS" | head -1)
HEIGHT=$(echo "$DIMENSIONS" | tail -1)

echo "📐 Image dimensions: ${WIDTH}x${HEIGHT}"

# Check if image is square
if [ "$WIDTH" != "$HEIGHT" ]; then
    echo "⚠️  Warning: Image is not square. It will be cropped to square."
fi

# Check if image is large enough
if [ "$WIDTH" -lt 1024 ] || [ "$HEIGHT" -lt 1024 ]; then
    echo "⚠️  Warning: Image is smaller than 1024x1024. Quality may be reduced."
fi

# Create square version (crop to center)
echo "✂️  Cropping to square..."
sips -z "$WIDTH" "$WIDTH" "$SOURCE_IMAGE" --out "$OUTPUT_DIR/icon-square.png"

# Resize to 1024x1024 for App Store
echo "📏 Resizing to 1024x1024..."
sips -z 1024 1024 "$OUTPUT_DIR/icon-square.png" --out "$OUTPUT_DIR/icon-1024.png"

# Create other common sizes
echo "📏 Creating additional sizes..."

# 512x512
sips -z 512 512 "$OUTPUT_DIR/icon-square.png" --out "$OUTPUT_DIR/icon-512.png"

# 256x256
sips -z 256 256 "$OUTPUT_DIR/icon-square.png" --out "$OUTPUT_DIR/icon-256.png"

# 128x128
sips -z 128 128 "$OUTPUT_DIR/icon-square.png" --out "$OUTPUT_DIR/icon-128.png"

# 64x64
sips -z 64 64 "$OUTPUT_DIR/icon-square.png" --out "$OUTPUT_DIR/icon-64.png"

# 32x32
sips -z 32 32 "$OUTPUT_DIR/icon-square.png" --out "$OUTPUT_DIR/icon-32.png"

echo ""
echo "✅ Icon processing complete!"
echo ""
echo "📁 Generated files:"
echo "   - icon-1024.png (App Store)"
echo "   - icon-512.png"
echo "   - icon-256.png"
echo "   - icon-128.png"
echo "   - icon-64.png"
echo "   - icon-32.png"
echo "   - icon-square.png (original square version)"
echo ""
echo "🎯 Next steps:"
echo "1. Copy icon-1024.png to: ios/ConflictConnect/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png"
echo "2. Run the iOS build process"
echo "3. Or use an online app icon generator with icon-1024.png"
echo ""
echo "💡 Recommended online tools:"
echo "   - https://appicon.co/ (upload icon-1024.png)"
echo "   - https://makeappicon.com/ (upload icon-1024.png)"

