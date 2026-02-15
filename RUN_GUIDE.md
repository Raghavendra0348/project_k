# 🚀 QR-Based Vending Machine - Quick Start Guide

## 📋 Prerequisites

Before running the project, ensure you have:
- **Node.js** v20 or higher installed
- **Firebase CLI** installed: `npm install -g firebase-tools`
- All dependencies installed in root, frontend, and functions folders

---

## 🔧 One-Time Setup

### 1. Install All Dependencies
```bash
# From project root
cd /home/a-raghavendra/Desktop/github_repos/project1
npm install

# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../functions
npm install
```

### 2. Verify Environment Files Exist

**Backend**: `functions/.env` should contain:
```
RAZORPAY_KEY_ID=rzp_test_SFcjAAIXATSVHV
RAZORPAY_KEY_SECRET=eiHqWLloxF0CFS2iluJ78nPE
NODE_ENV=development
ENABLE_PAYMENT_SIMULATION=false
```

**Frontend**: `frontend/.env` should contain:
```
REACT_APP_FIREBASE_API_KEY=AIzaSyDuE7R5NI01rQdYY5BrPKfoMqK9bcRYo84
REACT_APP_FIREBASE_AUTH_DOMAIN=vending-machine-web.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=vending-machine-web
REACT_APP_FIREBASE_STORAGE_BUCKET=vending-machine-web.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=188303260362
REACT_APP_FIREBASE_APP_ID=1:188303260362:web:bbecd754740724c0cdd233
REACT_APP_RAZORPAY_KEY_ID=rzp_test_SFcjAAIXATSVHV

REACT_APP_ENV=development
REACT_APP_USE_EMULATOR=true
REACT_APP_API_BASE_URL=http://10.33.184.164:5001/vending-machine-web/asia-south1/api
REACT_APP_ENABLE_PAYMENT_SIMULATION=false
REACT_APP_EMULATOR_HOST=10.33.184.164
```

**Note**: Replace `10.33.184.164` with your actual laptop IP address (run `hostname -I` to find it)

---

## ▶️ Running the Project (3 Terminal Windows)

### Terminal 1: Start Firebase Emulators
```bash
cd /home/a-raghavendra/Desktop/github_repos/project1
firebase emulators:start --only functions,firestore --project vending-machine-web
```

**✅ Wait for this message:**
```
┌─────────────────────────────────────────────────────────────┐
│ ✔  All emulators ready! It is now safe to connect your app. │
└─────────────────────────────────────────────────────────────┘
```

**Keep this terminal running!**

---

### Terminal 2: Seed Database with Test Data
```bash
cd /home/a-raghavendra/Desktop/github_repos/project1/functions
sleep 10 && npm run seed:emulator
```

**✅ Expected Output:**
```
✅ Database seeded successfully!

📊 Summary:
  - Machines: 3
  - Products: 22
```

---

### Terminal 3: Start Frontend Development Server
```bash
cd /home/a-raghavendra/Desktop/github_repos/project1/frontend
HOST=0.0.0.0 PORT=3000 npm start
```

**✅ Wait for this message:**
```
Compiled successfully!

You can now view vending-machine-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://10.33.184.164:3000
```

**Keep this terminal running!**

---

## 🌐 Accessing the Application

### On Your Laptop (Local Development)
Open browser and navigate to:
```
http://localhost:3000
```

### On Your Mobile Phone (Same Network/Hotspot)
Open browser and navigate to:
```
http://10.33.184.164:3000
```

**Important**: Replace `10.33.184.164` with your laptop's actual IP address.

---

## 🎯 Testing the Application

### Available Demo Machines
1. **machine-001** - Building A Lobby (11 products)
2. **machine-002** - Building B Cafeteria (10 products)
3. **test-machine-001** - Test Machine (3 products)

### Test Payment Flow (Razorpay Test Mode)
When making a purchase, use these test card details:

```
Card Number: 4111 1111 1111 1111
Expiry Date: 12/28
CVV: 123
Cardholder Name: Any Name
```

The payment will process in test mode and won't charge real money.

---

## 📱 QR Code Scanning

### To Generate QR Codes for Machines
1. Visit: `http://localhost:3000/admin/qr-generator`
2. Select a machine ID
3. Download the QR code
4. Print and place on vending machine
5. Scan with mobile phone to access that machine's products

---

## 🔍 Verify Everything is Running

Run these commands to check if all services are up:

```bash
# Check Backend API
curl http://localhost:5001/vending-machine-web/asia-south1/api/health

# Expected: {"status":"healthy", ...}

# Check Frontend
curl -I http://localhost:3000

# Expected: HTTP/1.1 200 OK

# Check if services are accessible from network
curl http://10.33.184.164:5001/vending-machine-web/asia-south1/api/health
curl -I http://10.33.184.164:3000
```

---

## 🛠️ Common Issues & Solutions

### Issue: Port Already in Use

**Solution:**
```bash
# Kill existing processes
pkill -f "firebase emulators"
pkill -f "react-scripts start"

# Then restart the services
```

### Issue: Can't Access from Phone

**Checklist:**
- ✅ Phone is connected to the same WiFi/Hotspot as laptop
- ✅ Laptop firewall allows connections on ports 3000, 5001, 8080
- ✅ IP address in `.env` matches laptop's actual IP (`hostname -I`)
- ✅ Using `http://` not `https://` in browser
- ✅ `firebase.json` has `"host": "0.0.0.0"` for emulators

**Find your laptop's IP:**
```bash
hostname -I
# or
ip addr show | grep "inet " | grep -v "127.0.0.1"
```

### Issue: No Products Showing / Machine Not Found

**Solution:**
```bash
# Re-seed the emulator database
cd /home/a-raghavendra/Desktop/github_repos/project1/functions
npm run seed:emulator
```

### Issue: Payment Not Working

**Checklist:**
- ✅ Backend emulator is running (Terminal 1)
- ✅ Database is seeded (Terminal 2 completed successfully)
- ✅ `REACT_APP_API_BASE_URL` in frontend `.env` is correct
- ✅ `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set in `functions/.env`
- ✅ Browser console shows no CORS or network errors

**Test backend connectivity:**
```bash
curl -X POST http://localhost:5001/vending-machine-web/asia-south1/api/createOrder \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod-001","machineId":"machine-001"}'
```

### Issue: Duplicate Products

**Solution:**
```bash
cd /home/a-raghavendra/Desktop/github_repos/project1/functions
node clean-duplicates.js
```

---

## 🔄 Restart Everything (Clean Slate)

If things aren't working, do a complete restart:

```bash
# 1. Stop all processes
pkill -f "firebase emulators"
pkill -f "react-scripts start"

# 2. Wait 3 seconds
sleep 3

# 3. Start Terminal 1 (Emulators)
cd /home/a-raghavendra/Desktop/github_repos/project1
firebase emulators:start --only functions,firestore --project vending-machine-web

# 4. In new terminal - Terminal 2 (Seed)
cd /home/a-raghavendra/Desktop/github_repos/project1/functions
sleep 15 && npm run seed:emulator

# 5. In new terminal - Terminal 3 (Frontend)
cd /home/a-raghavendra/Desktop/github_repos/project1/frontend
HOST=0.0.0.0 PORT=3000 npm start
```

---

## 📊 Project Structure

```
project1/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── pages/        # HomePage, MachinePage, etc.
│   │   ├── components/   # ProductCard, PaymentModal, etc.
│   │   ├── services/     # API, Firebase, Razorpay
│   │   └── hooks/        # useProducts, useMachine
│   ├── .env             # Frontend environment variables
│   └── package.json
│
├── functions/            # Firebase Cloud Functions (Backend)
│   ├── src/
│   │   ├── createOrder.ts      # Create Razorpay orders
│   │   ├── verifyPayment.ts    # Verify payments & update stock
│   │   └── index.ts            # API routes
│   ├── .env             # Backend environment variables
│   └── package.json
│
├── firebase.json        # Firebase configuration
└── firestore.rules      # Database security rules
```

---

## 🎓 Development Workflow

### Making Changes

**Frontend Changes:**
- Edit files in `frontend/src/`
- Hot reload happens automatically
- Changes visible immediately in browser

**Backend Changes:**
1. Edit files in `functions/src/`
2. Rebuild: `cd functions && npm run build`
3. Emulator auto-reloads the functions

### Adding New Products

Edit `functions/src/scripts/seedData.ts` and re-run:
```bash
npm run seed:emulator
```

---

## 🚀 Production Deployment

**Note**: Requires Firebase Blaze (pay-as-you-go) plan

```bash
# Build and deploy everything
npm run deploy

# Or deploy individually
firebase deploy --only functions
firebase deploy --only hosting
firebase deploy --only firestore:rules
```

---

## 📞 Support

For issues or questions:
1. Check browser console for errors (F12)
2. Check terminal outputs for error messages
3. Verify all 3 terminals are running without errors
4. Review this guide's troubleshooting section

---

## ✨ Features

- 🎯 Real-time product stock updates
- 📱 QR code scanning for machine access
- 💳 Secure payment processing with Razorpay
- 🔄 Live inventory management
- 📊 Multiple machine support
- 🎨 Modern glassmorphism UI
- 📲 Mobile-first responsive design

---

**Happy Vending! 🥤🍫🍪**
