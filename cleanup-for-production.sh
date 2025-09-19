#!/bin/bash

echo "🧹 Preparing for Production Deployment"
echo "======================================"
echo ""

# Create backup directory
BACKUP_DIR="dev-files-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Moving development files to: $BACKUP_DIR/"
echo ""

# Development/debug files to remove
DEV_FILES=(
  # Debug scripts
  "check-deployment-wallet.js"
  "check-factory-issue.js"
  "check-transaction.js"
  "debug-cron.js"
  "debug-factory.js"
  
  # Test scripts
  "fund-correct-usdc.js"
  "fund-test-escrow.js"
  "test-db-update.js"
  
  # Deployment scripts (keep contracts/scripts/)
  "deploy-escrow.js"
  "final-deploy-factory.js"
  "set-arbitrator.js"
  
  # Monitoring scripts
  "monitor.js"
  "cron-monitor.js"
  "run-cron.js"
  "simple-cron.js"
  
  # Database sync scripts
  "fix-database.js"
  "sync-splitter-truth.js"
  "verify-blockchain-truth.js"
  "verify-deployment.js"
  "scan-projects.js"
)

# Move files
moved_count=0
for file in "${DEV_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  Moving: $file"
    mv "$file" "$BACKUP_DIR/"
    ((moved_count++))
  fi
done

echo ""
echo "✅ Moved $moved_count development files"
echo ""

# Check what JS files remain (should be none in root)
remaining=$(ls -la *.js 2>/dev/null | wc -l)
if [ $remaining -gt 0 ]; then
  echo "⚠️  These JS files remain in root:"
  ls -la *.js
else
  echo "✅ No JS files left in root directory (good!)"
fi

echo ""
echo "📋 Next steps for Vercel deployment:"
echo "  1. Run: bash fix-api-localhost.sh"
echo "  2. Run: bash generate-production-env.sh"
echo "  3. Review and finalize .env.production"
echo "  4. Push to GitHub"
echo "  5. Deploy to Vercel with production environment variables"
echo ""
echo "💡 Backup location: $BACKUP_DIR/"
echo "   (Delete after confirming production works)"