# Deployment Issues & Fixes

## Issue 1: Missing Seeded Data in Production

### Problem
The deployed website doesn't have the same seeded data that exists locally.

### Root Cause
The seeding script (`seed-production.js`) has not been run on the production database. The production Firestore database is empty while the local emulator has seeded data.

### Solution

#### Step 1: Verify You Have Proper Credentials
```bash
# Check if you have the service account key
ls -la functions/serviceAccountKey.json
```

#### Step 2: Run the Production Seed Script
```bash
# Navigate to functions directory
cd functions

# Install dependencies if not already installed
npm install

# Run the production seed script
node seed-production.js
```

**What this does:**
- Connects to your production Firebase Firestore (vending-machine-web project)
- Creates 3 machines: machine-001, machine-002, test-machine-001
- Seeds 20 products across these machines
- Sets up proper stock levels for each product

#### Step 3: Verify Data in Firestore
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `vending-machine-web`
3. Navigate to Firestore > Collections
4. Check these collections exist with data:
   - `products` (should have 20 documents)
   - `machines` (should have 3 documents)
   - `stockAlerts` (will be empty initially)
   - `orders` (will be empty initially)

#### Step 4: Clear Local Emulator Cache (if needed)
If you want local and production to have the same data:
```bash
# Stop any running emulators
rm -rf emulator-data/

# Restart Firebase emulator
firebase emulators:start
```

Then run the local seed:
```bash
cd functions
node seed-emulator.js
```

### Expected Outcome
After seeding:
- Production website will show 20 products
- All machines will appear with correct locations
- Stock levels will match configuration
- Users can browse and purchase products

---

## Issue 2: Payment Not Working in Live URL

### Problem
The payment section is not working in production even though it works locally.

### Root Cause Analysis

#### Likely Causes (in order of probability):

1. **Missing or Incorrect Razorpay Environment Variables** ❌
   - RAZORPAY_KEY_ID not set in Vercel
   - RAZORPAY_KEY_SECRET not set in Vercel
   - Mismatched key IDs between test and live

2. **Frontend Configuration Issues** 
   - REACT_APP_RAZORPAY_KEY_ID not set in frontend env vars
   - Incorrect API_BASE_URL being used

3. **CORS Issues**
   - Payment modal blocked by CORS
   - API endpoint rejecting requests

4. **Backend Firebase Configuration**
   - Firebase credentials incomplete
   - Connection timeout to Firestore

### Solution

#### Step 1: Verify Razorpay Credentials in Vercel

**Go to Vercel Dashboard:**
1. Navigate to your project: vending-machine-web
2. Go to Settings > Environment Variables
3. Check these variables exist:

```
RAZORPAY_KEY_ID=rzp_test_SFcjAAIXATSVHV
RAZORPAY_KEY_SECRET=eiHqWLloxF0CFS2iluJ78nPE
```

**If missing, add them:**
```
Key: RAZORPAY_KEY_ID
Value: rzp_test_SFcjAAIXATSVHV

Key: RAZORPAY_KEY_SECRET
Value: eiHqWLloxF0CFS2iluJ78nPE
```

#### Step 2: Verify Frontend Environment Variables

Check `.vercel.json` or Vercel project settings for:
```
REACT_APP_RAZORPAY_KEY_ID=rzp_test_SFcjAAIXATSVHV
```

#### Step 3: Check API_BASE_URL Configuration

Verify `frontend/src/config/constants.js`:
```javascript
// This should use relative /api for production
const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return '/api';  // ✅ Correct for production
    }
    return 'http://localhost:5001/vending-machine-web/asia-south1/api';
};
```

#### Step 4: Verify Backend Payment Routes

Check `/api/_.js` has these routes (lines 209-313):

✅ **POST /api/createOrder** (lines ~209-268)
- Creates Razorpay order
- Returns order ID and amount
- Stores order in Firestore

✅ **POST /api/verifyPayment** (lines ~270-313)
- Verifies Razorpay signature
- Updates order status
- Decrements product stock

#### Step 5: Test Payment Flow

**Option A: Manual Testing**
1. Go to deployed site
2. Click on a product "Buy Now"
3. Check browser console for errors (F12)
4. Look for error messages in:
   - Network tab (check /api/createOrder request)
   - Console tab (check JavaScript errors)

**Option B: Check Backend Logs**
```bash
# If using Vercel CLI locally:
vercel env pull
vercel logs

# Check for errors in payment routes
```

**Option C: Test with cURL** (from backend)
```bash
# Test createOrder endpoint
curl -X POST https://your-deployed-site.com/api/createOrder \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod-001-coke",
    "machineId": "machine-001",
    "amount": 4000
  }'

# Should return:
# {
#   "success": true,
#   "razorpayOrderId": "order_...",
#   "amount": 4000,
#   "keyId": "rzp_test_..."
# }
```

### Common Payment Errors & Fixes

#### Error: "Razorpay Key ID not configured"
**Fix:** Set REACT_APP_RAZORPAY_KEY_ID in Vercel environment variables

#### Error: "Invalid payment signature"
**Fix:** Ensure RAZORPAY_KEY_SECRET is exactly correct (copy from Razorpay dashboard)

#### Error: "Cannot POST /api/createOrder"
**Fix:** Ensure API_BASE_URL is set to `/api` in production

#### Error: "Razorpay modal blocked by CORS"
**Fix:** Check CORS headers in `/api/_.js` (lines 26-28):
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

#### Error: "Cannot update stock after payment"
**Fix:** Ensure Firebase credentials are set correctly in Vercel environment variables

### Payment Flow Diagram

```
User Interface (Frontend)
    ↓
[Click "Buy Now" on product]
    ↓
MachinePage.jsx → handleBuyProduct()
    ↓
Step 1: POST /api/createOrder
    ├─ Backend: Create Razorpay order
    ├─ Backend: Store order in Firestore
    └─ Response: { razorpayOrderId, amount, keyId }
    ↓
Step 2: openRazorpayCheckout()
    ├─ Load Razorpay script (if not loaded)
    ├─ Open payment modal
    └─ User completes payment in Razorpay
    ↓
Step 3: POST /api/verifyPayment
    ├─ Backend: Verify signature
    ├─ Backend: Update order status to 'completed'
    ├─ Backend: Decrement product stock
    └─ Response: { success: true }
    ↓
Step 4: Payment Modal Shows Success
    └─ Message: "Payment Successful! 🎉"
```

---

## Verification Checklist

### Before Deploying Again

- [ ] Run `seed-production.js` if needed
- [ ] Verify Razorpay keys in Vercel environment variables
- [ ] Verify REACT_APP_RAZORPAY_KEY_ID in frontend env vars
- [ ] Check API_BASE_URL uses `/api` in production
- [ ] Verify CORS headers are set in `/api/_.js`
- [ ] Test payment flow locally first

### After Deployment

- [ ] Visit deployed URL
- [ ] Check products are loading (seeded data visible)
- [ ] Try purchasing a product
- [ ] Verify payment modal opens
- [ ] Complete test payment (if available)
- [ ] Check browser console for errors (F12)
- [ ] Check order appears in Firestore (optional)

---

## Environment Variables Reference

### Backend (Vercel) - /api routes

```
# Firebase Admin SDK
FIREBASE_PROJECT_ID=vending-machine-web
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@vending-machine-web.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----

# Razorpay
RAZORPAY_KEY_ID=rzp_test_SFcjAAIXATSVHV
RAZORPAY_KEY_SECRET=eiHqWLloxF0CFS2iluJ78nPE

# Optional
NODE_ENV=production
```

### Frontend (Vercel) - React App

```
# Firebase (Public - safe to expose)
REACT_APP_FIREBASE_API_KEY=AIzaSyDuE7R5NI01rQdYY5BrPKfoMqK9bcRYo84
REACT_APP_FIREBASE_AUTH_DOMAIN=vending-machine-web.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=vending-machine-web
REACT_APP_FIREBASE_STORAGE_BUCKET=vending-machine-web.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=188303260362
REACT_APP_FIREBASE_APP_ID=1:188303260362:web:bbecd754740724c0cdd233

# Razorpay (Public - safe to expose)
REACT_APP_RAZORPAY_KEY_ID=rzp_test_SFcjAAIXATSVHV

# Optional
REACT_APP_ENV=production
```

---

## Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| No products on deployed site | Run `node functions/seed-production.js` |
| "Razorpay Key ID not configured" | Add REACT_APP_RAZORPAY_KEY_ID to Vercel |
| "Invalid payment signature" | Verify RAZORPAY_KEY_SECRET is correct |
| "Cannot POST /api/createOrder" | Check API_BASE_URL is `/api` in production |
| Payment modal doesn't appear | Check CORS headers in `/api/_.js` |
| Stock not updating after payment | Verify Firebase credentials in Vercel |

---

## Next Steps

1. **Seed Production Database**
   ```bash
   cd functions
   node seed-production.js
   ```

2. **Verify Razorpay Configuration**
   - Check Vercel environment variables
   - Ensure keys match your Razorpay dashboard

3. **Test Payment Flow**
   - Browse to your deployed site
   - Try purchasing a product
   - Monitor browser console (F12) for errors

4. **Monitor Logs**
   - Check Vercel logs for backend errors
   - Check browser console for frontend errors
   - Check Firestore for order records

---

## Support Resources

- [Razorpay Integration Docs](https://razorpay.com/docs/payments/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Project Documentation](./COMPLETE_DOCUMENTATION.md)
