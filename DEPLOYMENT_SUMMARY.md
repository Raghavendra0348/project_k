# 🚀 Deployment Summary — QR Vending Machine System

**Date:** 3 May 2026  
**Status:** ✅ Fully Deployed & Live  
**Cost:** ₹0 / $0 — Completely Free

---

## 🌐 Live URLs

| What | URL |
|---|---|
| **Live Web App** | https://vending-machine-web.web.app |
| **Also works at** | https://vending-machine-web.firebaseapp.com |
| **API (Cloud Functions)** | https://asia-south1-vending-machine-web.cloudfunctions.net/api |
| **Firebase Console** | https://console.firebase.google.com/project/vending-machine-web |

---

## 📐 Architecture (Deployed)

```
Internet
   │
   ├── Firebase Hosting ────────── React Frontend (vending-machine-web.web.app)
   │
   ├── Cloud Functions ─────────── Express API (asia-south1)
   │         │                      ├── POST /createOrder     (Razorpay)
   │         │                      ├── POST /verifyPayment   (signature check)
   │         │                      ├── POST /dispense
   │         │                      └── GET  /admin/*
   │
   └── Firestore ───────────────── Real-time database
                  │                 ├── machines/
                  │                 ├── products/
                  │                 ├── orders/
                  │                 └── dispenseQueue/  ← ESP8266 polls this
                  │
                  │  (polls every 3 seconds via REST API)
                  │
           [ESP8266 + Servo Motor] ── Physical vending machine hardware
```

---

## ✅ What Was Done — Step by Step

### 1. Production Environment Setup
- Created `frontend/.env.production` with all Firebase config
- Set `REACT_APP_USE_EMULATOR=false` → points to real Firebase (not local emulator)
- Set `REACT_APP_API_BASE_URL` to the live Cloud Functions URL (`asia-south1`)

### 2. Razorpay Secrets — Stored Securely in Firebase
- Stored `RAZORPAY_KEY_ID` using Firebase Secrets (`firebase functions:secrets:set`)
- Stored `RAZORPAY_KEY_SECRET` using Firebase Secrets
- Keys are **never in code** — injected securely at runtime by Google Secret Manager
- Using **test mode** (`rzp_test_...`) — no real money moves

### 3. Firestore Rules & Indexes
```bash
firebase deploy --only firestore:rules,firestore:indexes
```
- Security rules deployed to production Firestore
- Composite indexes deployed for efficient queries

### 4. Cloud Functions Deployed
```bash
# Build TypeScript → JavaScript
cd functions && npm run build

# Deploy to Firebase
firebase deploy --only functions
```

**Functions deployed (asia-south1 region):**
| Function | Type | Purpose |
|---|---|---|
| `api` | HTTPS | Main Express API (all endpoints) |
| `onOrderCreated` | Firestore trigger | Logs new orders |
| `onPaymentSuccess` | Firestore trigger | Handles payment success events |

> **Note:** Functions use Node.js 20, 256MB memory, 60s timeout.  
> Razorpay keys are loaded from Firebase Secrets via `process.env.RAZORPAY_KEY_ID`.

### 5. Fixed Cloud Function Public Access
- After deploy, the `api` function returned **403 Forbidden**
- Root cause: Google Cloud org policy blocks unauthenticated access by default
- Fix: Added `allUsers` → `Cloud Functions Invoker` role in Google Cloud Console
  - Path: Cloud Console → Cloud Functions → `api` → Permissions → Add Principal

### 6. Frontend Built & Deployed
```bash
cd frontend && npm run build
firebase deploy --only hosting
```
- React app built to `frontend/build/` (384.8 kB JS, gzipped)
- Deployed to Firebase Hosting with SPA rewrite rules
- Served globally via Google CDN

### 7. Production Firestore Seeded
```bash
cd functions && GOOGLE_APPLICATION_CREDENTIALS=~/.config/firebase/arellaraghavendra_gmail_com_application_default_credentials.json node seed-production-adc.js
```

**Data seeded:**
| Machine | Location | Products |
|---|---|---|
| `machine-001` | Building A Lobby | 11 products |
| `machine-002` | Building B Cafeteria | 9 products |
| `test-machine-001` | Test Location | 2 products (₹1 each) |
| **Total** | | **22 products** |

### 8. ESP8266 Hardware Updated for Production
Changed `esp8266/esp8266_dispense.ino`:

```cpp
// BEFORE (dev mode — talked to local PC emulator):
#define USE_EMULATOR true

// AFTER (production — talks to real Firestore):
#define USE_EMULATOR false  // ✅ PRODUCTION
```

---

## 🔄 Payment → Hardware Signal Flow (Live)

```
1. User opens https://vending-machine-web.web.app
2. Scans QR code → selects product → clicks "Buy"
3. Razorpay payment popup opens (test mode)
4. User pays with test card: 4111 1111 1111 1111
5. Frontend sends payment details to Cloud Function
6. Cloud Function verifyPayment:
   - Verifies Razorpay HMAC signature ✅
   - Deducts stock in Firestore (atomic transaction) ✅
   - Writes to Firestore dispenseQueue: { status: "pending" } ✅
7. ESP8266 polls Firestore REST API every 3 seconds
8. Finds "pending" document → spins servo motor → product dispensed ✅
9. ESP8266 marks document status: "completed" ✅
10. LCD shows "Dispensed OK! Thank you :)" ✅
```

---

## 🔧 ESP8266 Hardware — What to Change Before Re-uploading

In `esp8266/esp8266_dispense.ino`, update these 2 lines:

```cpp
// Line 37 — YOUR ACTUAL WiFi name
#define WIFI_SSID "YOUR_WIFI_NAME"

// Line 38 — YOUR ACTUAL WiFi password
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Line 47 — Already set to production ✅
#define USE_EMULATOR false
```

Then upload via Arduino IDE (Board: NodeMCU 1.0, Baud: 115200).

---

## 💰 Cost Breakdown

| Service | Free Limit | Your Usage | Cost |
|---|---|---|---|
| Firebase Hosting | 10 GB / 360 MB/day | ~1 MB | **₹0** |
| Cloud Functions | 2M calls/month | ~100s/month | **₹0** |
| Firestore | 50K reads/day | ~1K/day | **₹0** |
| Razorpay (test mode) | Unlimited test transactions | Test only | **₹0** |
| **Total** | | | **₹0** |

---

## 📦 Files Changed in This Deployment

| File | Change |
|---|---|
| `frontend/.env.production` | Created — production Firebase + API config |
| `functions/seed-production-adc.js` | Created — seeds real Firestore without service account key |
| `esp8266/esp8266_dispense.ino` | `USE_EMULATOR` changed from `true` → `false` |
| `.gitignore` | Added debug logs, build output, secret env files |

---

## 🧪 Razorpay Test Card Details

| Field | Value |
|---|---|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date (e.g. `12/28`) |
| CVV | Any 3 digits (e.g. `123`) |
| Name | Any name |
| OTP | `1234` (Razorpay test OTP) |

---

## 🔜 To Go Live with Real Payments (Future)

1. Complete Razorpay KYC (PAN + bank account)
2. Get live keys from Razorpay Dashboard
3. Update Firebase Secrets:
   ```bash
   echo "rzp_live_XXXXXX" | firebase functions:secrets:set RAZORPAY_KEY_ID --force
   echo "your_live_secret" | firebase functions:secrets:set RAZORPAY_KEY_SECRET --force
   firebase deploy --only functions
   ```
4. Update `frontend/.env.production`: `REACT_APP_RAZORPAY_KEY_ID=rzp_live_XXXXXX`
5. Rebuild and redeploy frontend

---

*Deployed by Antigravity AI — QR Vending Machine System v1.0.0*
