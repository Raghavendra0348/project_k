# Stock Update API - Deployment Configuration

## Before Deployment Checklist

### 1. Environment Variables (Vercel)
Add these to your Vercel project settings under Environment Variables:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
NODE_ENV=production
```

**Important:** For `FIREBASE_PRIVATE_KEY`, make sure:
- Include the `\n` escape sequences for newlines
- Wrap the entire key in double quotes
- Do NOT include the outer quotes in the value itself

### 2. API Base URL Configuration
**File:** `frontend/src/config/constants.js`

Verify the `API_BASE_URL` is correctly set:
```javascript
// For production
export const API_BASE_URL = 'https://your-deployment-url.vercel.app/api';

// For local development
// export const API_BASE_URL = 'http://localhost:3000/api';
```

### 3. Firebase Configuration
**File:** `functions/lib/firebase.js` or similar

Ensure Firebase is initialized correctly:
```javascript
const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        }),
    });
}
```

### 4. Firestore Security Rules

Deploy these rules to ensure admin operations work:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products collection
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Stock Alerts collection
    match /stockAlerts/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Orders collection
    match /orders/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Machines collection
    match /machines/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Firestore Indexes

Create these indexes for optimal performance:

**Index 1: Products by Stock**
- Collection: `products`
- Fields: `stock` (Ascending)

**Index 2: Products by Machine and Stock**
- Collection: `products`
- Fields: `stock` (Ascending), `machineId` (Ascending)

**Index 3: Alerts by Status**
- Collection: `stockAlerts`
- Fields: `status` (Ascending)

**Index 4: Alerts by Status and Date**
- Collection: `stockAlerts`
- Fields: `status` (Ascending), `createdAt` (Descending)

### 6. API Endpoints Configuration

All endpoints are managed in `/api/_.js` (Vercel catch-all route).

**Key Stock-Related Routes:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/products/{id}/stock` | PATCH | Update stock |
| `/api/admin-low-stock` | GET | Get low stock products |
| `/api/admin-alerts` | GET | Get stock alerts |
| `/api/verifyPayment` | POST | Process payment & decrement stock |

### 7. Pre-Deployment Testing

Run the verification script:
```bash
chmod +x verify-stock-api.sh
./verify-stock-api.sh https://your-deployment-url.vercel.app
```

Expected output:
```
Test 1: Health Check... PASS
Test 2: Get Low Stock Products... PASS
Test 3: Get Stock Alerts... PASS
Test 4: Get All Products... PASS
Test 5: Get All Machines... PASS
Test 6: PATCH Stock Update... PASS
Test 7: PATCH Stock Update (Missing field)... PASS
Test 8: CORS Headers Check... PASS

All critical tests passed!
```

### 8. Deployment Steps

**Step 1: Update Environment Variables in Vercel**
```bash
# Using Vercel CLI
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add FIREBASE_PRIVATE_KEY
vercel env add RAZORPAY_KEY_ID
vercel env add RAZORPAY_KEY_SECRET
```

**Step 2: Deploy to Vercel**
```bash
# Push to main/production branch
git add .
git commit -m "Update stock API configuration for production"
git push origin main

# Or deploy directly
vercel --prod
```

**Step 3: Deploy Firestore Rules**
```bash
# Using Firebase CLI
firebase deploy --only firestore:rules
```

**Step 4: Deploy Firestore Indexes**
```bash
# Indexes can be auto-deployed or via Firebase Console
firebase deploy --only firestore:indexes
```

**Step 5: Verify Deployment**
```bash
# Test all endpoints
./verify-stock-api.sh https://your-deployed-url.vercel.app

# Check Vercel logs
vercel logs
```

### 9. Post-Deployment Verification

1. **Test Stock Update:**
   - Go to Admin Dashboard
   - Update a product's stock
   - Verify change reflects immediately

2. **Test Low Stock Detection:**
   - Click "Check Stock" button
   - Set a product stock to 5 (below threshold)
   - Verify alert appears

3. **Test Payment Flow:**
   - Make a purchase
   - Complete payment
   - Verify stock decreased by 1

4. **Monitor Logs:**
   - Check Vercel function logs
   - Look for errors or timeouts
   - Monitor Firestore operations

### 10. Troubleshooting

**Problem: "Firebase initialization error"**
- Check environment variables are set correctly
- Verify `FIREBASE_PRIVATE_KEY` has proper `\n` escapes
- Check Vercel build logs for initialization errors

**Problem: "CORS error"**
- Verify `Access-Control-Allow-Origin` header is set in response
- Check API is deployed to correct URL
- Test with curl to isolate frontend issues

**Problem: "Stock not updating"**
- Check Firestore `products` collection exists
- Verify `stock` field is numeric (not string)
- Check Firestore rules allow write operations

**Problem: "Timeout errors"**
- Check Firestore connection in `/api/_.js`
- Review Vercel function timeout (default 10s, max 60s)
- Consider caching frequently accessed data

### 11. Monitoring & Logging

**Enable detailed logging in Vercel:**

In `/api/_.js`, logs are already set up:
```javascript
console.log(`[${new Date().toISOString()}] ${req.method} /api${pathname}`);
```

View logs:
```bash
# Real-time logs
vercel logs --follow

# Historical logs
vercel logs --since 1h
```

**Monitor Firestore:**
- Use Firebase Console: https://console.firebase.google.com
- Check Firestore usage and costs
- Monitor read/write operations

### 12. Rollback Plan

If deployment has issues:

```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or redeploy known good version
vercel --prod --yes
```

### 13. Performance Optimization

**Current Implementation:**
- ✅ Direct Firestore updates (minimal latency)
- ✅ Index on `stock` field for queries
- ✅ CORS headers for cross-origin requests

**Future Improvements:**
- Consider Redis caching for product lists
- Implement batch stock updates
- Add rate limiting for API endpoints
- Use Firestore real-time listeners for stock sync

---

## Quick Start - Deploy to Vercel

```bash
# 1. Ensure all env vars are set in Vercel console
# 2. Deploy
vercel --prod

# 3. Wait for build to complete
# 4. Run verification
./verify-stock-api.sh <your-vercel-url>

# 5. Test in admin dashboard
# Go to https://<your-url>/admin and update a product's stock
```

---

## Contact & Support

- **Firestore Docs:** https://firebase.google.com/docs/firestore
- **Vercel Docs:** https://vercel.com/docs
- **Razorpay Docs:** https://razorpay.com/docs

**Last Updated:** March 11, 2026
