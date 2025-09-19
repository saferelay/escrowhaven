#!/bin/bash

echo "🚀 Creating Production Environment File"
echo "======================================="
echo ""

# Copy .env.local to .env.production
cp .env.local .env.production

echo "✅ Copied .env.local to .env.production"
echo ""

# Update only the critical production values
sed -i '' 's|NEXT_PUBLIC_ENVIRONMENT=.*|NEXT_PUBLIC_ENVIRONMENT=production|' .env.production
sed -i '' 's|NODE_ENV=.*|NODE_ENV=production|' .env.production
sed -i '' 's|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://escrowhaven.io|' .env.production

echo "✅ Updated to production values:"
echo "   - NEXT_PUBLIC_ENVIRONMENT=production"
echo "   - NODE_ENV=production"
echo "   - NEXT_PUBLIC_APP_URL=https://escrowhaven.io"
echo ""

echo "📋 Quick verification of critical production settings:"
echo ""
echo "1. Mainnet Factory Address:"
grep "ESCROWHAVEN_FACTORY_ADDRESS_MAINNET" .env.production | head -1
echo ""
echo "2. Stripe Keys (should be LIVE keys):"
grep "STRIPE.*KEY" .env.production | grep -E "PUBLISHABLE|SECRET" | head -2
echo ""
echo "3. Check if Transak production key needed:"
grep "TRANSAK" .env.production | head -2
echo ""

echo "✅ .env.production is ready for deployment!"