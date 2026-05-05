# ⚡ Hardware Signal After Deployment — Will It Work?

## ✅ SHORT ANSWER: YES — But ONE change needed in Arduino code

---

## How Your Signal Flow Works

```
[User] → [Razorpay Payment (Test Mode)]
           ↓
[Firebase Cloud Function: verifyPayment.ts]
   → Verifies Razorpay signature ✅
   → Updates stock in Firestore ✅
   → Writes to Firestore "dispenseQueue" (status: "pending") ✅
           ↓
[Firestore - Production (internet)]
           ↓  (ESP8266 polls every 3 seconds)
[ESP8266 Hardware]
   → Finds "pending" document ✅
   → Spins servo motor (dispenses product) ✅
   → Marks document "completed" ✅
```

> [!IMPORTANT]
> **The ESP8266 talks DIRECTLY to Firestore REST API over the internet.**
> It does NOT go through your laptop/server.
> So once Firestore is live online, hardware works automatically.

---

## ❌ The One Thing You Must Change

### File: `esp8266/esp8266_dispense.ino` — Line 47

#### Current (Development Mode — WRONG for production):
```cpp
#define USE_EMULATOR true   // ← Points to YOUR LOCAL computer's IP!
```

#### Change to (Production Mode — CORRECT):
```cpp
#define USE_EMULATOR false  // ← Points to real Firestore on internet
```

#### Why this matters:
| Setting | What ESP8266 connects to | Works when |
|---|---|---|
| `USE_EMULATOR true` | `http://10.211.191.164:8080` (your local PC) | Only when your laptop is on & emulator is running |
| `USE_EMULATOR false` | `https://firestore.googleapis.com` | ✅ Always — works from anywhere in the world |

---

## Complete Steps to Make Hardware Work After Deployment

### Step 1 — Change the flag in Arduino code
Open `esp8266/esp8266_dispense.ino` and change line 47:
```cpp
// BEFORE:
#define USE_EMULATOR true

// AFTER:
#define USE_EMULATOR false
```

### Step 2 — Verify WiFi credentials are correct
Check lines 37-38 in the same file:
```cpp
#define WIFI_SSID     "YourActualWiFiName"      // ← your real WiFi
#define WIFI_PASSWORD "YourActualWiFiPassword"  // ← your real WiFi password
```
> The ESP8266 must be connected to a WiFi that has internet access.

### Step 3 — Verify the Machine ID matches production database
```cpp
#define MACHINE_ID "machine-001"  // ← Must match exactly what's in Firestore
```
After you seed the production database, the machine IDs are:
- `machine-001` (Building A Lobby)
- `machine-002` (Building B Cafeteria)
- `test-machine-001` (Test Machine)

### Step 4 — Re-upload code to ESP8266
1. Open Arduino IDE
2. Make the changes above
3. Connect ESP8266 via USB
4. Click **Upload**

### Step 5 — Test the full flow
1. Open the live app: `https://vending-machine-web.web.app`
2. Scan QR code for `machine-001`
3. Select a product → Pay with Razorpay test card
4. Watch the ESP8266 LCD — it should show "Order Received!" and dispense

---

## Razorpay Test Mode — Does It Still Trigger the Signal?

### ✅ YES — Test mode payments work EXACTLY like real payments

The flow is identical:
1. You pay with Razorpay **test card**: `4111 1111 1111 1111`
2. Razorpay generates a real `razorpay_payment_id` and `razorpay_signature`
3. Your Cloud Function verifies the signature (real verification, not bypassed)
4. Dispense command is written to Firestore
5. ESP8266 picks it up and dispensess

> [!NOTE]
> The only difference in test mode is that **no real money moves**. Everything else — signature verification, Firestore write, ESP8266 signal — is completely real.

---

## What Happens If ESP8266 Loses WiFi?

Your code already handles this gracefully:

```cpp
// From your loop() function:
if (WiFi.status() != WL_CONNECTED) {
  lcdShow("WiFi Lost!", "Reconnecting...");
  connectWiFi();  // Auto-reconnects
}
```

And the `dispenseQueue` document stays as `"pending"` in Firestore until:
- ESP8266 reconnects → picks it up → dispenses ✅
- OR the 5-minute expiry passes (set in verifyPayment.ts)

---

## Full Checklist — Hardware Ready for Production

```
[ ] 1. Changed USE_EMULATOR to false in esp8266_dispense.ino
[ ] 2. WiFi SSID and PASSWORD are correct (internet-connected WiFi)
[ ] 3. MACHINE_ID matches the production Firestore document ID
[ ] 4. Arduino code re-uploaded to ESP8266
[ ] 5. Firebase deployed (Cloud Functions + Hosting + Firestore)
[ ] 6. Production Firestore seeded with machines and products
[ ] 7. Tested with Razorpay test card: 4111 1111 1111 1111
```

---

## Architecture Summary

```
Internet
   │
   ├── Firebase Hosting ──────────────── React Frontend (browser)
   │         │
   ├── Cloud Functions ───────────────── verifyPayment, createOrder, etc.
   │         │
   └── Firestore ─────────────────────── dispenseQueue, products, orders
                    │
                    │ (ESP8266 polls REST API every 3 seconds)
                    │
              [ESP8266 + Servo Motor] ── Physical vending machine
```

**All three layers are completely independent.**  
The ESP8266 just needs internet access — it doesn't need your laptop to be on.

---

*Your hardware will work perfectly after deployment — just flip that one `USE_EMULATOR` flag!*
