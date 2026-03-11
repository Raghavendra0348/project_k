# Fix Payment on Live Website ✅

## Problem
Payment section is NOT working on your deployed Vercel site because **Razorpay credentials are missing**.

## Root Cause
Your `api/_.js` file reads Razorpay credentials from environment variables:
```javascript
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,        // ← NOT SET ON VERCEL
    key_secret: process.env.RAZORPAY_KEY_SECRET, // ← NOT SET ON VERCEL
});
```

When credentials are `undefined`, Razorpay order creation fails.

---

## Solution: Add Razorpay Credentials to Vercel

### Step 1: Get Your Razorpay Keys

**Your keys are:**
```
RAZORPAY_KEY_ID: rzp_test_SFcjAAIXATSVHV
RAZORPAY_KEY_SECRET: eiHqWLloxF0CFS2iluJ78nPE
```

### Step 2: Add to Vercel Environment Variables

1. Go to: **https://vercel.com/dashboard**
2. Click: **vending-machine-web** project
3. Go to: **Settings** tab
4. Click: **Environment Variables** (left sidebar)
5. Add Variable #1:
   - **Name:** `RAZORPAY_KEY_ID`
   - **Value:** `rzp_test_SFcjAAIXATSVHV`
   - **Environment:** Production, Preview, Development (select all)
   - Click: **Add**

6. Add Variable #2:
   - **Name:** `RAZORPAY_KEY_SECRET`
   - **Value:** `eiHqWLloxF0CFS2iluJ78nPE`
   - **Environment:** Production, Preview, Development (select all)
   - Click: **Add**

### Step 3: Verify Other Required Variables

Make sure these are ALSO set on Vercel (should already be there):

```
✓ FIREBASE_PROJECT_ID: vending-machine-web
✓ FIREBASE_CLIENT_EMAIL: firebase-adminsdk-xxxxx@vending-machine-web.iam.gserviceaccount.com
✓ FIREBASE_PRIVATE_KEY: (long key starting with -----BEGIN PRIVATE KEY-----)
```

**Check them all at:** https://vercel.com/dashboard → vending-machine-web → Settings → Environment Variables

---

## Step 4: Redeploy Project

1. Go to: **https://vercel.com/dashboard**
2. Click: **vending-machine-web** project
3. Click: **Deployments** tab
4. Find latest deployment (top of list)
5. Click the **...** menu on right
6. Click: **Redeploy**
7. Wait for: `✓ Ready` status (5-10 minutes)

---

## Step 5: Test Payment

1. Go to your deployed site: **https://your-site.vercel.app**
2. Click on any product (e.g., Coca Cola)
3. Click: **Buy Now**
4. Payment modal should appear
5. Test with Razorpay test card:
   - Card: `4111 1111 1111 1111`
   - Expiry: Any future date (e.g., `12/25`)
   - CVV: Any 3 digits (e.g., `123`)
   - Click: **Pay**

### Expected Result:
```
✅ Order created successfully
✅ Payment verified
✅ Stock reduced
✅ Order status = 'success'
```

---

## Troubleshooting

### Issue: Still Getting Payment Errors

**Check 1: Did deployment complete?**
```
https://vercel.com/dashboard
→ vending-machine-web
→ Deployments tab
→ Latest should show ✓ Ready
→ If it says "building..." → Wait for it to finish
```

**Check 2: Are environment variables set?**
```
https://vercel.com/dashboard
→ Settings
→ Environment Variables
→ Should see:
  ✓ RAZORPAY_KEY_ID
  ✓ RAZORPAY_KEY_SECRET
  ✓ FIREBASE_PROJECT_ID
  ✓ FIREBASE_CLIENT_EMAIL
  ✓ FIREBASE_PRIVATE_KEY
```

**Check 3: Clear browser cache**
```
Press: Ctrl + Shift + Delete (or Cmd + Shift + Delete on Mac)
Click: Clear data
Refresh the page
```

**Check 4: Check browser console for errors**
```
F12 → Console tab → Look for red errors
Should see: ✓ Order created successfully
Should NOT see: ✗ Razorpay Key ID not configured
```

### Issue: Payment Modal Doesn't Appear

**This means products aren't loading. Make sure you:**
- ✅ Ran: `node seed-production.js` (from earlier fix)
- ✅ Waited for database to be populated
- ✅ Redeployed after seeding

**To verify products exist:**
```
https://console.firebase.google.com
→ vending-machine-web project
→ Firestore Database
→ Collections
→ products → Should see 22 items
```

### Issue: Redeploy Is Stuck/Not Starting

1. Go to: https://vercel.com/dashboard
2. Select: vending-machine-web
3. Click: **Deployments** tab
4. Right-click the latest deployment
5. Select: **Redeploy**
6. When prompted: Click **Redeploy** again

---

## Verification Checklist

After following all steps, verify:

- [ ] Razorpay keys added to Vercel (5 total env vars)
- [ ] Deployment redeployed (shows ✓ Ready)
- [ ] Browser cache cleared
- [ ] Website shows 22 products
- [ ] Click "Buy Now" opens payment modal
- [ ] Payment modal loads Razorpay UI
- [ ] No red errors in console (F12)
- [ ] Test payment goes through with test card

---

## Important Notes

### Why Test Keys?
- `rzp_test_*` = Test mode (doesn't charge card)
- `rzp_live_*` = Production (charges real money)
- You're using test keys → Won't charge customers

### When Ready for Real Payments
1. Go to: https://dashboard.razorpay.com
2. Upgrade from Test to Production
3. Get your `rzp_live_*` keys
4. Update Vercel environment variables with live keys
5. Test with actual payment

### Security
- Never commit keys to GitHub
- Always use Vercel's secure environment variables
- `FIREBASE_PRIVATE_KEY` should never be in code

---

## Timeline

| Task | Time |
|------|------|
| Add 2 Razorpay keys to Vercel | 2 min |
| Redeploy | 5-10 min |
| Test payment | 2 min |
| **TOTAL** | **9-14 min** |

---

## Summary

**Payment wasn't working because:**
- Your API code uses `process.env.RAZORPAY_KEY_ID` and `process.env.RAZORPAY_KEY_SECRET`
- These variables were NOT set on Vercel
- So when frontend called `/api/createOrder`, Razorpay received `undefined` credentials
- Razorpay order creation failed

**Fix:**
1. Add 2 Razorpay keys to Vercel environment variables
2. Redeploy
3. Payment will work!

---

## Need Help?

If payment still doesn't work after these steps:

1. **Check Vercel logs:**
   - Deployments → Latest deployment → View Logs
   - Look for: `Razorpay` or `createOrder` errors

2. **Check frontend console (F12):**
   - Should see API calls to `/api/createOrder`
   - Response should have `razorpayOrderId`

3. **Check Razorpay dashboard:**
   - https://dashboard.razorpay.com
   - Orders section should show new orders being created

4. **Still stuck?**
   - Make sure you did `node seed-production.js` first
   - Verify products actually exist in Firestore
   - Try incognito window to ensure clean cache

---

**👉 START HERE: Add the 2 Razorpay keys to Vercel now!**
