# Smart Vending Machine - Setup & Run Guide

A QR-based real-time vending machine system with payment integration, inventory management, and remote control capabilities.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Seeding Database](#seeding-database)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before cloning and running this project, ensure you have:

1. **Node.js & npm**
   - Node.js 20.x or higher
   - npm 10.x or higher
   - Check: `node --version` and `npm --version`

2. **Firebase CLI**
   - Required for emulator and deployment
   - Install: `npm install -g firebase-tools`
   - Check: `firebase --version`

3. **Git**
   - For cloning the repository
   - Check: `git --version`

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/vending-machine.git
cd vending-machine
```

### Step 2: Install Dependencies

Install dependencies for the root, frontend, and functions directories:

```bash
npm run install:all
```

This will:
- Install root dependencies
- Install frontend dependencies (`frontend/`)
- Install functions dependencies (`functions/`)

---

## Configuration

### Step 1: Firebase Project Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Create a Firestore database (select "Start in test mode" for development)
3. Enable these Firebase services:
   - Firestore Database
   - Cloud Functions
   - Cloud Hosting
   - Authentication (optional, for future features)

4. Get your Firebase credentials:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `functions/serviceAccountKey.json`

### Step 2: Environment Variables

Create `.env.local` in the **root** directory:

```bash
# Firebase Config
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5001/your_project_id/asia-south1/api

# Razorpay (for payment testing)
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key
REACT_APP_ENABLE_PAYMENT_SIMULATION=true
```

Create `.env.local` in the **frontend** directory:

```bash
# Same Firebase variables as above
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Razorpay
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key
REACT_APP_ENABLE_PAYMENT_SIMULATION=true
```

### Step 3: Initialize Firebase

```bash
firebase login
firebase init
```

Select:
- ✓ Firestore
- ✓ Functions
- ✓ Hosting

---

## Running the Project

### Option 1: Development Mode (with Firebase Emulator)

**Terminal 1 - Start Firebase Emulator:**
```bash
firebase emulators:start
```

This starts:
- Firestore Emulator (port 8080)
- Functions Emulator (port 5001)
- UI (http://localhost:4000)

**Terminal 2 - Start Development Servers:**
```bash
npm run dev
```

This starts concurrently:
- React Frontend (http://localhost:3000)
- Firebase Cloud Functions (port 5001)

### Option 2: Frontend Only (Requires Live Firebase Backend)

```bash
cd frontend
npm start
```

Frontend will be available at `http://localhost:3000`

### Option 3: Functions Only

```bash
cd functions
npm run serve
```

Functions emulator starts on port 5001

---

## Seeding Database

To populate the emulator with sample data (machines, products, etc.):

```bash
npm run seed:emulator
```

This creates:
- Sample vending machines with QR codes
- Product catalog
- Stock levels
- Historical data for analytics

**Note:** This requires the Firebase emulator to be running.

---

## Building for Production

### Build Both Frontend and Functions

```bash
npm run build
```

This:
1. Creates optimized frontend build in `frontend/build/`
2. Compiles TypeScript functions to `functions/lib/`

### View Production Build Locally

```bash
firebase emulators:start
cd frontend
npm run build
npx serve -s build
```

---

## Deployment

### Deploy to Firebase Hosting

```bash
npm run deploy:hosting
```

### Deploy Cloud Functions

```bash
npm run deploy:functions
```

### Deploy Everything

```bash
npm run deploy
```

This deploys:
- Frontend to Firebase Hosting
- Cloud Functions
- Firestore Rules

---

## Project Structure

```
├── frontend/              # React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API & Firebase services
│   │   ├── hooks/         # Custom React hooks
│   │   ├── config/        # Constants & config
│   │   └── App.jsx
│   └── package.json
│
├── functions/             # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts       # Function entry point
│   │   ├── createOrder.ts # Create payment orders
│   │   ├── verifyPayment.ts
│   │   ├── dispense.ts    # Control vending machine
│   │   └── ...
│   └── package.json
│
├── api/                   # API routes (Express middleware)
│   └── admin/             # Admin APIs
│
├── esp8266/               # Arduino firmware for hardware
│   └── esp8266_dispense.ino
│
└── emulator-data/         # Local Firebase emulator data
```

---

## Key NPM Scripts

| Command | What it does |
|---------|-------------|
| `npm run install:all` | Install all dependencies |
| `npm run dev` | Run frontend + functions together |
| `npm run build` | Build frontend and compile functions |
| `npm run deploy` | Deploy to Firebase |
| `npm run seed:emulator` | Populate emulator with sample data |
| `firebase emulators:start` | Start Firebase emulator |

---

## Troubleshooting

### Port Already in Use
If port 3000 or 5001 is in use:

```bash
# Find process using port 3000
lsof -i :3000
kill -9 <PID>

# Find process using port 5001
lsof -i :5001
kill -9 <PID>
```

### Firebase Emulator Won't Start
```bash
# Clear emulator cache
rm -rf ~/.cache/firebase/emulators

# Restart
firebase emulators:start --force
```

### Dependencies Installation Issues
```bash
# Clean and reinstall
rm -rf node_modules frontend/node_modules functions/node_modules
rm package-lock.json frontend/package-lock.json functions/package-lock.json
npm run install:all
```

### Environment Variables Not Loaded
1. Verify `.env.local` files exist in both root and `frontend/` directories
2. Restart the development server after adding `.env.local`
3. Check that variable names match exactly (case-sensitive)

### Firestore Permission Denied Errors
1. Ensure Firebase emulator is running
2. Check `firestore.rules` file permissions
3. Restart emulator: `firebase emulators:start --force`

### Build Fails
```bash
# Clear cache and rebuild
cd frontend && npm run build
cd ../functions && npm run build
```

---

## Common Tasks

### Create a New Machine
1. Go to admin panel: http://localhost:3000/admin
2. Click "Add Machine"
3. Enter machine details
4. QR code generates automatically

### Add Products to Machine
1. Go to admin panel
2. Select a machine
3. Click "Add Product"
4. Upload product image and set price

### Test Payment Flow
1. With `REACT_APP_ENABLE_PAYMENT_SIMULATION=true`, payments are simulated
2. No actual Razorpay charges will occur
3. Disable simulation in production and set real Razorpay keys

### View Real-time Data
1. Open Firestore Emulator UI: http://localhost:4000
2. Check `machines` and `products` collections
3. Monitor real-time updates as orders are created

---

## Next Steps

1. ✓ Clone and install
2. ✓ Setup Firebase project
3. ✓ Configure environment variables
4. ✓ Run `npm run dev`
5. ✓ Seed sample data
6. ✓ Visit http://localhost:3000
7. ✓ Start developing!

---

## Support & Documentation

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Razorpay API Docs](https://razorpay.com/docs/)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

## License

MIT License - See LICENSE file for details
