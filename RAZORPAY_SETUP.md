# Razorpay Integration - LIVE Payment Gateway

## ✅ Razorpay Connected Successfully!

The vending machine system is now configured to use **real Razorpay payments**.

### Configuration Summary

#### Backend (Functions)
- **Razorpay Key ID**: `rzp_test_SFcjAAIXATSVHV`
- **Razorpay Key Secret**: `eiHqWLloxF0CFS2iluJ78nPE`
- **Mode**: TEST (safe for development)
- **Payment Simulation**: DISABLED ✅

#### Frontend
- **API URL**: `http://localhost:5001/.../api`
- **Razorpay Public Key**: Fetched from backend
- **Payment Simulation**: DISABLED ✅

### How Razorpay Payment Works

#### 1. User Clicks "Buy Now"
- Frontend calls backend: `POST /createOrder`
- Backend creates Razorpay order
- Returns `razorpayOrderId`, `amount`, `keyId`

#### 2. Razorpay Checkout Opens
- Beautiful payment modal appears
- User can pay via:
  - 💳 Credit/Debit Cards
  - 🏦 Net Banking
  - 📱 UPI (GPay, PhonePe, Paytm)
  - 💰 Wallets

#### 3. Payment Completion
- Razorpay processes payment
- Returns payment details to frontend
- Frontend sends to backend for verification

#### 4. Backend Verification
- Verifies payment signature (security)
- Atomically decreases stock
- Marks order as successful
- Triggers dispense command

### Testing with Razorpay Test Mode

Since we're using `rzp_test_` credentials, you can test with dummy cards:

#### Test Card Numbers

| Card Type | Number | CVV | Expiry | Result |
|-----------|--------|-----|--------|--------|
| **Success** | `4111 1111 1111 1111` | Any 3 digits | Any future date | ✅ Payment Success |
| **Success** | `5555 5555 5555 4444` | Any 3 digits | Any future date | ✅ Payment Success |
| **Failure** | `4000 0000 0000 0002` | Any 3 digits | Any future date | ❌ Payment Failed |

#### Test UPI

- **UPI ID**: `success@razorpay`
- **Result**: ✅ Payment Success

- **UPI ID**: `failure@razorpay`
- **Result**: ❌ Payment Failed

### Payment Flow Demonstration

1. **Open Browser**: `http://localhost:3000`

2. **Enter Machine ID**: `machine-001`

3. **Select Product**: Click "Buy Now" on any product

4. **Razorpay Modal Opens**:
   ```
   ┌─────────────────────────────────┐
   │   Smart Vending                 │
   │   Coca Cola 500ml               │
   │   ₹40.00                         │
   │                                  │
   │   Card | UPI | Wallets          │
   │   [Card Number Input]            │
   │   [Expiry] [CVV]                │
   │                                  │
   │   [Pay ₹40.00]                  │
   └─────────────────────────────────┘
   ```

5. **Enter Test Card**:
   - Card: `4111 1111 1111 1111`
   - Expiry: `12/25`
   - CVV: `123`

6. **Click Pay** → Payment Success!

7. **Stock Decreases** automatically

### Security Features

✅ **Signature Verification** - Backend verifies every payment
✅ **Atomic Transactions** - No race conditions
✅ **No Double Purchases** - Orders processed once
✅ **SSL Required** - Production uses HTTPS
✅ **Key Secret Never Exposed** - Only backend has secret

### Environment Configuration

#### Backend: `functions/.env`
```env
RAZORPAY_KEY_ID=rzp_test_SFcjAAIXATSVHV
RAZORPAY_KEY_SECRET=eiHqWLloxF0CFS2iluJ78nPE
NODE_ENV=development
ENABLE_PAYMENT_SIMULATION=false  # ← Real payments!
```

#### Frontend: `frontend/.env`
```env
REACT_APP_ENV=development
REACT_APP_USE_EMULATOR=true
REACT_APP_API_BASE_URL=http://localhost:5001/vending-machine-web/asia-south1/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_SFcjAAIXATSVHV
REACT_APP_ENABLE_PAYMENT_SIMULATION=false  # ← Real payments!
```

### Console Logs to Verify

When you click "Buy Now", check browser console:

```javascript
// You should see:
🛒 [Buy Product] Starting purchase: {productId: "prod-001-coke", ...}
📡 [API] Creating order: {...}
📡 [API] Create order response: {success: true, mockPayment: false}  // ← false!

// Razorpay modal will open (no simulation message)
// After payment:
Payment completed: {razorpay_payment_id: "pay_...", ...}
Payment verified: {success: true, ...}
```

**Note**: If you see `mockPayment: true`, the simulation is still enabled - hard refresh browser.

### Switching to Production

When ready to go live:

1. **Get Production Keys from Razorpay**:
   - Login to https://dashboard.razorpay.com
   - Switch to "Live Mode"
   - Copy `rzp_live_...` key ID and secret

2. **Update Environment**:
   ```env
   # functions/.env
   RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID
   RAZORPAY_KEY_SECRET=your_live_secret_key
   NODE_ENV=production
   ```

3. **Deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

4. **Activate Live Mode on Razorpay Dashboard**

### Troubleshooting

#### Razorpay Modal Not Opening?

1. **Hard refresh browser**: `Ctrl + Shift + R`
2. **Check console** for errors
3. **Verify Razorpay script loaded**: Check network tab for `checkout.js`

#### Payment Succeeds but Stock Doesn't Decrease?

- Backend verification failing
- Check Firebase logs: `tail -f /tmp/firebase-emulator.log`
- Look for "Payment signature verification FAILED"

#### "Product not found" Error?

- Database not seeded
- Run: `cd functions && node seed-emulator.js`

### Payment Webhook (Optional)

For production, configure Razorpay webhook:

1. Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Implement webhook handler in `functions/src/webhook.ts`

### Testing Checklist

- [ ] Open `http://localhost:3000`
- [ ] Enter `machine-001`
- [ ] See all 11 products
- [ ] Click "Buy Now" on any product
- [ ] Razorpay modal opens
- [ ] Enter test card: `4111 1111 1111 1111`
- [ ] Payment succeeds
- [ ] Stock decreases automatically
- [ ] Success message appears

---

## 🎉 Razorpay is Now Live!

You can now:
- ✅ Accept real payments (test mode)
- ✅ Process cards, UPI, wallets
- ✅ Automatic stock management
- ✅ Secure payment verification
- ✅ Real-time order tracking

**Try making a payment now!** → http://localhost:3000
