#!/bin/bash

# ADHDRelief - Local Validation Script
# Run this before committing to catch issues early

set -e  # Exit on error

echo "================================================"
echo "      ADHDRelief Extension Validator"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    error "jq is not installed. Please install it:"
    echo "  Ubuntu/Debian: sudo apt-get install jq"
    echo "  macOS: brew install jq"
    exit 1
fi

echo "1. Validating manifest.json..."
echo "----------------------------------------"

# Check if manifest exists
if [ ! -f "manifest.json" ]; then
    error "manifest.json not found!"
    exit 1
fi

# Validate JSON syntax
if ! jq empty manifest.json 2>/dev/null; then
    error "manifest.json is not valid JSON!"
    exit 1
fi

# Extract and display key information
NAME=$(jq -r '.name' manifest.json)
VERSION=$(jq -r '.version' manifest.json)
MANIFEST_VERSION=$(jq -r '.manifest_version' manifest.json)

echo "  Name: $NAME"
echo "  Version: $VERSION"
echo "  Manifest Version: $MANIFEST_VERSION"

# Validate manifest version
if [ "$MANIFEST_VERSION" != "3" ]; then
    error "Manifest version must be 3 (current: $MANIFEST_VERSION)"
    exit 1
fi

success "Manifest validation passed"
echo ""

echo "2. Checking required files..."
echo "----------------------------------------"

REQUIRED_FILES=(
    "manifest.json"
    "README.md"
    "LICENSE"
    "popup/popup.html"
    "popup/popup.css"
    "popup/popup.js"
    "popup/custom-sounds.js"
    "background/service-worker.js"
    "offscreen/offscreen.html"
    "offscreen/audio-generator.js"
    "icons/icon16.png"
    "icons/icon48.png"
    "icons/icon128.png"
)

MISSING_FILES=()
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
    error "Missing required files:"
    printf '  %s\n' "${MISSING_FILES[@]}"
    exit 1
fi

success "All required files present (${#REQUIRED_FILES[@]} files)"
echo ""

echo "3. Checking file sizes..."
echo "----------------------------------------"

# Check sound files
if [ -d "sounds" ]; then
    LARGE_FILES=$(find sounds -type f -size +10M 2>/dev/null || true)
    if [ -n "$LARGE_FILES" ]; then
        warning "Large sound files found (>10MB):"
        echo "$LARGE_FILES"
    else
        success "Sound file sizes acceptable"
    fi
else
    warning "No sounds directory found"
fi

echo ""

echo "4. Checking for sensitive data..."
echo "----------------------------------------"

# Check for common sensitive patterns
if grep -r -i "api[_-]key\|password\|secret\|token" --include="*.js" --include="*.json" . 2>/dev/null | grep -v "node_modules" | grep -v ".git" | grep -v "scripts/validate.sh" > /dev/null; then
    warning "Potential sensitive data found - please review:"
    grep -r -i "api[_-]key\|password\|secret\|token" --include="*.js" --include="*.json" . 2>/dev/null | grep -v "node_modules" | grep -v ".git" | grep -v "scripts/validate.sh" || true
else
    success "No obvious sensitive data detected"
fi

echo ""

echo "5. JavaScript validation..."
echo "----------------------------------------"

# Check if Node.js is available for linting
if command -v node &> /dev/null; then
    if [ -f "node_modules/.bin/eslint" ] || command -v eslint &> /dev/null; then
        echo "  Running ESLint..."
        npx eslint popup/*.js background/*.js offscreen/*.js 2>&1 || {
            warning "ESLint found issues (review above)"
        }
    else
        warning "ESLint not installed. Run: npm install --save-dev eslint"
    fi
else
    warning "Node.js not installed, skipping linting"
fi

echo ""

echo "6. Calculating package size..."
echo "----------------------------------------"

# Calculate total size excluding development files
TOTAL_SIZE=$(du -sh --exclude='.git' --exclude='.github' --exclude='node_modules' --exclude='build' --exclude='*.md' --exclude='scripts' . 2>/dev/null | cut -f1)
echo "  Estimated package size: $TOTAL_SIZE"

if [ -d "build" ]; then
    BUILD_SIZE=$(du -sh build 2>/dev/null | cut -f1)
    echo "  Build directory size: $BUILD_SIZE"
fi

success "Size calculation complete"
echo ""

echo "================================================"
echo "           Validation Summary"
echo "================================================"
echo ""
success "Extension structure validated"
success "Ready for commit/packaging"
echo ""
echo "Next steps:"
echo "  - git add ."
echo "  - git commit -m 'Your message'"
echo "  - git push"
echo ""
echo "For releases:"
echo "  - Update version in manifest.json"
echo "  - git tag v$VERSION"
echo "  - git push origin v$VERSION"
echo ""
echo "================================================"
