#!/bin/bash

# QUICK FIX SCRIPT - Deployment Issues
# Run this to quickly diagnose and fix both issues

echo "================================"
echo "Vending Machine Deployment Fixer"
echo "================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}ISSUE 1: Missing Seeded Data${NC}"
echo "========================================"
echo "Checking if production database has data..."
echo ""
echo "Run this command to seed production:"
echo ""
echo -e "${GREEN}cd functions${NC}"
echo -e "${GREEN}npm install${NC}"
echo -e "${GREEN}node seed-production.js${NC}"
echo ""
echo "This will:"
echo "  ✓ Create 3 machines"
echo "  ✓ Add 20 products"
echo "  ✓ Set proper stock levels"
echo ""

echo ""
echo -e "${YELLOW}ISSUE 2: Payment Not Working${NC}"
echo "========================================"
echo ""
echo "Step 1: Check Vercel Environment Variables"
echo "  1. Go to: https://vercel.com/dashboard"
echo "  2. Select your project: vending-machine-web"
echo "  3. Go to Settings > Environment Variables"
echo "  4. Verify these exist:"
echo ""
echo -e "${GREEN}RAZORPAY_KEY_ID=rzp_test_SFcjAAIXATSVHV${NC}"
echo -e "${GREEN}RAZORPAY_KEY_SECRET=eiHqWLloxF0CFS2iluJ78nPE${NC}"
echo ""
echo "  If missing, add them!"
echo ""

echo "Step 2: Check Frontend Environment"
echo "  Make sure this variable is set:"
echo ""
echo -e "${GREEN}REACT_APP_RAZORPAY_KEY_ID=rzp_test_SFcjAAIXATSVHV${NC}"
echo ""

echo "Step 3: Verify API Configuration"
echo "  Check frontend/src/config/constants.js"
echo "  Production should use: /api (relative path)"
echo ""

echo "Step 4: Test Payment"
echo "  1. Go to your deployed site"
echo "  2. Click 'Buy Now' on any product"
echo "  3. Open browser console (F12)"
echo "  4. Complete payment"
echo "  5. Check console for errors"
echo ""

echo ""
echo -e "${YELLOW}VERIFICATION CHECKLIST${NC}"
echo "========================================"
echo ""
echo "Before calling this fixed:"
echo ""
echo "[ ] Seeds run: node functions/seed-production.js"
echo "[ ] Razorpay keys in Vercel environment variables"
echo "[ ] Frontend env var: REACT_APP_RAZORPAY_KEY_ID"
echo "[ ] API_BASE_URL uses /api in production"
echo "[ ] CORS headers set in /api/_.js"
echo ""
echo "After deployment:"
echo ""
echo "[ ] Products visible on deployed site"
echo "[ ] Payment modal opens when clicking 'Buy Now'"
echo "[ ] Payment completes successfully"
echo "[ ] No errors in browser console (F12)"
echo "[ ] Order appears in Firestore"
echo ""

echo ""
echo -e "${GREEN}DETAILED GUIDE: DEPLOYMENT_ISSUES_FIXES.md${NC}"
echo ""
