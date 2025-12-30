#!/bin/bash

# ADHDRelief - Local Build Script
# Package the extension for manual distribution or Chrome Web Store upload

set -e  # Exit on error

echo "================================================"
echo "      ADHDRelief Extension Builder"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get version from manifest
VERSION=$(jq -r '.version' manifest.json)

echo -e "${BLUE}Building ADHDRelief v$VERSION${NC}"
echo ""

# Create build directory
echo "1. Creating build directory..."
rm -rf build
mkdir -p build

# Copy files excluding development artifacts
echo "2. Copying extension files..."
rsync -av \
  --exclude='.git' \
  --exclude='.github' \
  --exclude='node_modules' \
  --exclude='build' \
  --exclude='scripts' \
  --exclude='.gitignore' \
  --exclude='README.md' \
  --exclude='CHROME_STORE_DESCRIPTION.md' \
  --exclude='icons/generate-icons.py' \
  --exclude='sounds/*:Zone.Identifier' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  --exclude='package.json' \
  --exclude='package-lock.json' \
  --exclude='.eslintrc.json' \
  ./ build/ADHDRelief/

echo "3. Creating ZIP archive..."
cd build
zip -r "ADHDRelief-v$VERSION.zip" ADHDRelief/ -q

echo "4. Generating checksum..."
sha256sum "ADHDRelief-v$VERSION.zip" > checksums.txt

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo ""
echo "Package: build/ADHDRelief-v$VERSION.zip"
echo "Size: $(du -h "ADHDRelief-v$VERSION.zip" | cut -f1)"
echo ""
echo "Checksum:"
cat checksums.txt
echo ""
echo "================================================"
echo "Next steps:"
echo "1. Test the extension:"
echo "   - Unzip build/ADHDRelief-v$VERSION.zip"
echo "   - Load unpacked in chrome://extensions/"
echo ""
echo "2. Upload to Chrome Web Store:"
echo "   - Go to Chrome Web Store Developer Dashboard"
echo "   - Upload build/ADHDRelief-v$VERSION.zip"
echo "================================================"
