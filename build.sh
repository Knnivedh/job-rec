#!/bin/bash
# Build script for Render deployment

echo "🔧 Installing all dependencies (including dev dependencies)..."
npm install --include=dev

echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"