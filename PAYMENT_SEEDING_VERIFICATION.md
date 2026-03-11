# Payment & Seeding Verification Guide

## Issue Summary

### Issue 1: No Seeded Data in Production ❌
**Status:** Missing seeding execution
**Impact:** Users see empty product list on deployed site
**Solution:** Run seed-production.js

### Issue 2: Payment Not Working ❌  
**Status:** Likely missing Razorpay environment variables in Vercel
**Impact:** Payment modal fails or payment cannot be verified
**Solution:** Add Razorpay keys to Vercel environment

---

## CRITICAL: Seeding Production Database

### Prerequisites
- Access to Firebase CLI or Vercel
- Proper authentication credentials
- Service account key in `/functions/serviceAccountKey.json`

### Step 1: Navigate to Functions Directory
```bash
cd /home/a-raghavendra/Desktop/github_repos/project1/functions
```

### Step 2: Verify Node Modules
```bash
npm install
```

### Step 3: Run Production Seed Script
```bash
node seed-production.js
```

### Expected Output
```
Creating/updating machines...
Creating products for machine-001...
Creating products for machine-002...
Creating products for test-machine-001...
✓ Successfully seeded 20 products
✓ Successfully seeded 3 machines
```

### Step 4: Verify in Firestore Console
1. Go to: https://console.firebase.google.com
2. Project: `vending-machine-web`
3. Firestore Database > Collections
4. Check these collections:
   - `products` (20 documents)
   - `machines` (3 documents)

---

## Payment Configuration Checklist

### Step 1: Verify Razorpay Credentials
Go to: https://dashboard.razorpay.com

**Your credentials:**
- Key ID: `rzp_test_SFcjAAIXATSVHV`
- Key Secret: `eiHqWLloxF0CFS2iluJ78nPE`

### Step 2: Add to Vercel Environment Variables

**Go to:** https://vercel.com/dashboard

**Select project:** vending-machine-web

**Go to:** Settings > Environment Variables

**Add these variables:**

| Name | Value | Type |
|------|-------|------|
| RAZORPAY_KEY_ID | rzp_test_SFcjAAIXATSVHV | Encrypted |
| RAZORPAY_KEY_SECRET | eiHqWLloxF0CFS2iluJ78nPE | Encrypted |
| NODE_ENV | production | Plaintext |

**⚠️ IMPORTANT:** After adding variables:
1. Redeploy your project
2. Wait for deployment to complete
3. Clear browser cache (Ctrl+Shift+Delete)

### Step 3: Verify Frontend Configuration

**File:** `frontend/src/config/constants.js`

Should contain:
```javascript
const getApiBaseUrl = () => {
    // Production: Use relative path
    if (process.env.NODE_ENV === 'production') {
        return '/api';  // ✅ CORRECT
    }
    
    // Local: Use full emulator path
    return 'http://localhost:5001/vending-machine-web/asia-south1/api';
};
```

**Also verify:**
```javascript
export const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || '';
```

And Vercel should have:
```
REACT_APP_RAZORPAY_KEY_ID=rzp_test_SFcjAAIXATSVHV
```

### Step 4: Verify Backend Payment Routes

**File:** `/api/_.js`

Check these routes exist:

#### Route 1: POST /api/createOrder (Lines ~209-268)
```javascript
if (pathname === '/createOrder' && req.method === 'POST') {
    const { productId, machineId, amount } = req.body;
    
    // Uses: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
    // Creates Razorpay order
    // Returns: { razorpayOrderId, amount, keyId }
}
```

#### Route 2: POST /api/verifyPayment (Lines ~270-313)
```javascript
if (pathname === '/verifyPayment' && req.method === 'POST') {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    
    // Verifies signature using RAZORPAY_KEY_SECRET
    // Updates order in Firestore
    // Decrements product stock
}
```

---

## Testing Payment Flow

### Test 1: Local Testing (with emulator)

```bash
# Terminal 1: Start Firebase emulator
firebase emulators:start

# Terminal 2: Navigate to frontend
cd frontend

# Start React app
npm start
```

Then:
1. Open http://localhost:3000
2. Scan a machine QR or go to /machine/test-machine-001
3. Click "Buy Now" on any product
4. Payment should work (or show simulation if enabled)

### Test 2: Deployed Site Testing

1. Visit your deployed URL: https://your-site.vercel.app
2. Open browser DevTools (F12)
3. Go to Console tab
4. Try purchasing a product
5. Look for these messages:

**Success indicators:**
```
📡 [API] Creating order: { ... }
✅ Payment verified for order ...
💳 Stock updated successfully
```

**Error indicators:**
```
❌ Razorpay Key ID not configured
❌ Invalid payment signature
❌ RAZORPAY_KEY_SECRET missing
```

### Test 3: API Endpoint Testing (using cURL)

```bash
# 1. Test Create Order
curl -X POST https://your-site.vercel.app/api/createOrder \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod-001-coke",
    "machineId": "machine-001",
    "amount": 4000
  }'

# Expected response:
# {
#   "success": true,
#   "razorpayOrderId": "order_...",
#   "amount": 4000,
#   "keyId": "rzp_test_..."
# }

# 2. Test if Razorpay route exists
curl https://your-site.vercel.app/api/createOrder
# Should NOT return 404
```

---

## Troubleshooting

### Problem: Products not showing on deployed site

**Symptoms:**
- Empty product list
- "No products available" message

**Diagnosis:**
```bash
# Check if Firestore has data
# Go to: https://console.firebase.google.com
# Project: vending-machine-web
# Firestore > Collections > products
# Should show 20 documents
```

**Fix:**
```bash
cd functions
node seed-production.js
```

### Problem: Payment modal doesn't appear

**Symptoms:**
- Click "Buy Now" → Nothing happens
- Or modal appears but button disabled

**Console Errors:**
- "Razorpay Key ID not configured"
- "TypeError: Razorpay is not a function"

**Diagnosis:**
```
1. Check Vercel env vars have RAZORPAY_KEY_ID
2. Check REACT_APP_RAZORPAY_KEY_ID is set
3. Check Razorpay script loads: DevTools > Network > Filter "razorpay"
```

**Fix:**
1. Add variables to Vercel
2. Redeploy project
3. Clear browser cache

### Problem: "Invalid payment signature" error

**Symptoms:**
- Payment completes in Razorpay
- Backend shows "Invalid payment signature"

**Diagnosis:**
```
RAZORPAY_KEY_SECRET in Vercel doesn't match actual secret
```

**Fix:**
1. Go to Razorpay Dashboard: https://dashboard.razorpay.com
2. Settings > API Keys
3. Copy exact Key Secret
4. Update in Vercel > Environment Variables
5. Redeploy

### Problem: "Cannot POST /api/createOrder"

**Symptoms:**
- 404 error on /api/createOrder
- Payment modal error

**Diagnosis:**
```
API route not deployed or API_BASE_URL wrong
```

**Fix:**
1. Check API_BASE_URL in constants.js uses `/api`
2. Check /api/_.js has createOrder route
3. Verify Vercel deployment completed

---

## Quick Verification Checklist

### Before Redeploying
```
[ ] Ran seed-production.js successfully
[ ] RAZORPAY_KEY_ID in Vercel environment
[ ] RAZORPAY_KEY_SECRET in Vercel environment
[ ] REACT_APP_RAZORPAY_KEY_ID in frontend env
[ ] API_BASE_URL uses /api in production config
[ ] /api/_.js has payment routes (lines 209-313)
[ ] CORS headers set in /api/_.js (lines 26-28)
```

### After Deployment
```
[ ] Products visible (from seeded data)
[ ] Payment modal opens when clicking Buy
[ ] No errors in browser console (F12)
[ ] Payment signature verification works
[ ] Stock updates after successful payment
[ ] Orders appear in Firestore
```

---

## Environment Variables Checklist

### Vercel Backend Environment

**Required for payment:**
```
RAZORPAY_KEY_ID=rzp_test_SFcjAAIXATSVHV
RAZORPAY_KEY_SECRET=eiHqWLloxF0CFS2iluJ78nPE
```

**Required for Firebase:**
```
FIREBASE_PROJECT_ID=vending-machine-web
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@vending-machine-web.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----
```

### Vercel Frontend Environment

**Required for payment:**
```
REACT_APP_RAZORPAY_KEY_ID=rzp_test_SFcjAAIXATSVHV
```

**Required for Firebase:**
```
REACT_APP_FIREBASE_API_KEY=AIzaSyDuE7R5NI01rQdYY5BrPKfoMqK9bcRYo84
REACT_APP_FIREBASE_AUTH_DOMAIN=vending-machine-web.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=vending-machine-web
REACT_APP_FIREBASE_STORAGE_BUCKET=vending-machine-web.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=188303260362
REACT_APP_FIREBASE_APP_ID=1:188303260362:web:bbecd754740724c0cdd233
```

---

## Support

If issues persist:

1. **Check Logs:**
   - Vercel: https://vercel.com/dashboard > Deployments > View Logs
   - Browser Console: F12 > Console tab
   - Firestore: https://console.firebase.google.com > Firestore Database

2. **Debug Payment:**
   - Check Network tab (F12) for /api/createOrder request
   - Check response status and body
   - Look for error messages

3. **Verify Credentials:**
   - Razorpay Dashboard: https://dashboard.razorpay.com
   - Firebase Console: https://console.firebase.google.com
   - Vercel: https://vercel.com/dashboard

---

## Summary

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| No products on site | Database not seeded | Run `node functions/seed-production.js` |
| Payment modal doesn't open | Razorpay key not configured | Add RAZORPAY_KEY_ID to Vercel |
| "Invalid signature" error | Wrong key secret | Update RAZORPAY_KEY_SECRET in Vercel |
| Cannot reach /api/createOrder | API_BASE_URL wrong | Check frontend/src/config/constants.js |

After fixing both issues, your deployed site should have:
- ✅ 20 products visible
- ✅ Payment modal working
- ✅ Successful payment verification
- ✅ Stock updates on purchase
