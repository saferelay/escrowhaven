#!/bin/bash

echo "🔧 Fixing localhost references in API routes..."
echo "=============================================="

# Backup first
cp -r src/app/api src/app/api.backup.$(date +%Y%m%d_%H%M%S)

# Files with localhost references
files=(
  "src/app/api/escrow/check-funding/route.ts"
  "src/app/api/escrow/gasless-action/route.ts"
  "src/app/api/cron/sync-escrows/route.ts"
  "src/app/api/stripe/crypto-webhook/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Fixing: $file"
    
    # Replace localhost fallbacks with production URL
    sed -i '' "s|process\.env\.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'|process.env.NEXT_PUBLIC_APP_URL || 'https://escrowhaven.io'|g" "$file"
    
    # Fix the gasless-action specific case
    if [[ "$file" == *"gasless-action"* ]]; then
      sed -i '' "s|'http://localhost:3000/api/escrow/sync-blockchain'|'https://escrowhaven.io/api/escrow/sync-blockchain'|g" "$file"
    fi
  fi
done

echo ""
echo "✅ Fixed localhost references"
echo ""
echo "🔍 Verifying no localhost remains:"
grep -r "localhost" src/app/api/ --include="*.ts" | grep -v "backup" | grep -v "//"