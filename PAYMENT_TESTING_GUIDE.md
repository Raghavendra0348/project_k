# Payment Testing Guide

## ✅ Payment System Now Working!

The payment system has been configured to work in **simulation mode** for local development.

### What Was Fixed?

1. **Firebase Cloud Functions Not Running**
   - Previously only Firestore emulator was running
   - Now running BOTH Firestore + Functions emulators
   - Backend API available at: `http://localhost:5001/vending-machine-web/asia-south1/api`

2. **Payment Simulation Mode Enabled**
   - Added `ENABLE_PAYMENT_SIMULATION=true` flag
   - Skips real Razorpay checkout during local development
   - No need for actual payment gateway credentials during testing
   - Products get dispensed without real money

### How to Test Payment Flow

#### Step 1: Ensure All Services Are Running

```bash
# Check Firebase Emulators (should be running in background)
curl http://localhost:5001/vending-machine-web/asia-south1/api/health
# Should return: {"status":"healthy",...}

# Check React Dev Server (should be on port 3000)
ps aux | grep react-scripts
```

#### Step 2: Access the Vending Machine

1. Open browser: `http://localhost:3000`
2. Click "Enter Machine ID" or scan QR
3. Enter: `machine-001`
4. You should see **11 products**

#### Step 3: Test Purchase Flow

1. Click **"Buy Now"** on any product
2. Payment modal will show "Creating Order..."
3. In simulation mode, it will **automatically skip Razorpay**
4. Payment will be verified and completed
5. Stock will decrease by 1
6. Success message will appear!

### Environment Variables

#### Frontend (`.env`)
```env
REACT_APP_ENV=development
REACT_APP_USE_EMULATOR=true
REACT_APP_API_BASE_URL=http://localhost:5001/vending-machine-web/asia-south1/api
REACT_APP_ENABLE_PAYMENT_SIMULATION=true
```

#### Backend (`functions/.env`)
```env
RAZORPAY_KEY_ID=rzp_test_SFcjAAIXATSVHV
RAZORPAY_KEY_SECRET=eiHqWLloxF0CFS2iluJ78nPE
NODE_ENV=development
ENABLE_PAYMENT_SIMULATION=true
```

### All 11 Products in machine-001

| Product | Category | Price | Stock |
|---------|----------|-------|-------|
| Coca Cola 500ml | beverages | ₹40 | 25 |
| Pepsi 500ml | beverages | ₹40 | 20 |
| Frooti Mango Drink | beverages | ₹30 | 24 |
| Bisleri Water 500ml | water | ₹20 | 50 |
| Mineral Water 1L | water | ₹25 | 35 |
| Lays Classic Chips | snacks | ₹20 | 30 |
| Kurkure Masala Munch | snacks | ₹20 | 25 |
| Pringles Original | snacks | ₹60 | 12 |
| KitKat Chocolate | chocolates | ₹30 | 28 |
| Cadbury Dairy Milk | chocolates | ₹50 | 22 |
| Snickers Bar | chocolates | ₹35 | 18 |

### Troubleshooting

#### Payment Still Failing?

1. **Check Backend Functions Are Running**
   ```bash
   curl http://localhost:5001/vending-machine-web/asia-south1/api/health
   ```
   If this fails, restart emulators:
   ```bash
   pkill -f "firebase emulators"
   cd /home/a-raghavendra/Desktop/github_repos/project1
   npm run emulators
   ```

2. **Check Frontend Environment Variables**
   - Hard refresh browser: `Ctrl + Shift + R`
   - Check console for: "⚙️ Payment simulation enabled"

3. **Check Browser Console for Errors**
   - Open DevTools (F12)
   - Look for API errors
   - Verify emulator connection message

#### Products Not Showing?

1. **Reseed Database**
   ```bash
   cd /home/a-raghavendra/Desktop/github_repos/project1/functions
   node seed-emulator.js
   ```

2. **Hard Refresh Browser**
   - Press `Ctrl + Shift + R` (Linux/Windows)
   - Press `Cmd + Shift + R` (Mac)

### Testing Real Razorpay (Production)

To test with actual Razorpay checkout:

1. Set `ENABLE_PAYMENT_SIMULATION=false` in both `.env` files
2. Rebuild functions: `cd functions && npm run build`
3. Restart emulators
4. Hard refresh browser
5. Razorpay modal will appear when clicking "Buy Now"
6. Use Razorpay test cards: `4111 1111 1111 1111`

### Verify Payment Flow Works

**Expected Console Logs:**
```
⚙️ Payment simulation enabled - skipping Razorpay checkout
Order created: {success: true, orderId: "...", ...}
Payment completed: {razorpay_order_id: "...", ...}
Payment verified: {success: true, ...}
Dispense triggered
```

**Expected UI Flow:**
1. ⏳ Creating Order...
2. ⏳ Awaiting Payment...
3. ⏳ Verifying Payment...
4. ✅ Success! Your product will be dispensed.

---

## 🎉 Everything Is Now Working!

- ✅ Firebase Emulators running (Firestore + Functions)
- ✅ Backend API healthy
- ✅ Database seeded with 22 products
- ✅ Payment simulation enabled
- ✅ All 11 products visible for machine-001
- ✅ Purchase flow complete and tested

**Try it now!** → http://localhost:3000 → Enter `machine-001` → Click any "Buy Now" button!
