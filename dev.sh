#!/bin/bash

# Exit on error
set -e

# Check if .env file exists
if [ ! -f "apps/backend/.env" ]; then
    echo "❌ Missing apps/backend/.env file"
    exit 1
fi

# Install dependencies and start dev server
echo "🏗️  Installing dependencies..."
pnpm install

echo "🚀 Starting backend in dev mode..."
pnpm run dev
echo "✅ Backend running at http://localhost:5000"
echo "✅ Frontend running at http://localhost:3000"
