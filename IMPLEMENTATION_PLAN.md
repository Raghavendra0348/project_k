# 📋 Full Implementation Plan
## QR-Based Real-Time Vending Machine System

This document provides a complete step-by-step implementation plan to get the vending machine system up and running.

---

## 📑 Table of Contents

1. [Phase 1: Environment Setup](#phase-1-environment-setup)
2. [Phase 2: Firebase Project Configuration](#phase-2-firebase-project-configuration)
3. [Phase 3: Razorpay Account Setup](#phase-3-razorpay-account-setup)
4. [Phase 4: Backend Deployment](#phase-4-backend-deployment)
5. [Phase 5: Frontend Deployment](#phase-5-frontend-deployment)
6. [Phase 6: Database Seeding](#phase-6-database-seeding)
7. [Phase 7: Testing](#phase-7-testing)
8. [Phase 8: Production Launch](#phase-8-production-launch)
9. [Troubleshooting Guide](#troubleshooting-guide)

---

## Phase 1: Environment Setup

### 1.1 Prerequisites Installation

```bash
# Check Node.js version (requires 18+)
node --version

# If not installed or outdated, install Node.js 18+
# For Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# For macOS (using Homebrew):
brew install node@18

# Verify npm
npm --version
```

### 1.2 Install Global Dependencies

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Verify installation
firebase --version

# Install Vercel CLI (optional - for Vercel deployment)
npm install -g vercel
```

### 1.3 Project Dependencies Installation

```bash
# Navigate to project root
cd /home/a-raghavendra/Desktop/github_repo\'s/project1

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install functions dependencies
cd ../functions
npm install

# Return to root
cd ..
```

### 1.4 Expected Directory Structure After Setup

```
project1/
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── functions/
│   ├── node_modules/
│   ├── src/
│   ├── package.json
│   └── ...
├── node_modules/
├── firebase.json
├── firestore.rules
└── package.json
```

---

## Phase 2: Firebase Project Configuration

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add Project"**
3. Enter project name: `vending-machine-app` (or your choice)
4. Disable Google Analytics (optional for MVP)
5. Click **"Create Project"**

### 2.2 Enable Firestore Database

1. In Firebase Console, go to **Build → Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose location: **`asia-south1` (Mumbai)** for India
5. Click **"Enable"**

### 2.3 Get Firebase Web Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"** section
3. Click **Web icon (</>) ** to add a web app
4. Register app name: `vending-machine-web`
5. Copy the configuration object:

```javascript
// You'll get something like:
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 2.4 Login to Firebase CLI

```bash
# Login to Firebase
firebase login

# Verify login
firebase projects:list

# Set active project
firebase use your-project-id
```

### 2.5 Update Firebase RC File

Edit `.firebaserc`:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 2.6 Deploy Firestore Security Rules

```bash
# Deploy rules
firebase deploy --only firestore:rules

# Verify in console
# Go to Firestore → Rules tab
```

---

## Phase 3: Razorpay Account Setup

### 3.1 Create Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up with business details
3. Complete KYC verification (for live mode)

### 3.2 Get Test API Keys

1. Login to Razorpay Dashboard
2. Go to **Settings → API Keys**
3. Click **"Generate Test Key"**
4. Save both:
   - **Key ID**: `rzp_test_XXXXXXXXXXXX`
   - **Key Secret**: `XXXXXXXXXXXXXXXXXXXXXXXX`

> ⚠️ **IMPORTANT**: Never expose the Key Secret in frontend code!

### 3.3 Test Mode vs Live Mode

| Mode | Key Prefix | Usage |
|------|------------|-------|
| Test | `rzp_test_` | Development & Testing |
| Live | `rzp_live_` | Production |

---

## Phase 4: Backend Deployment

### 4.1 Configure Environment Variables

#### Option A: Firebase Functions Config (Recommended for Production)

```bash
# Set Razorpay credentials
firebase functions:config:set razorpay.key_id="rzp_test_XXXXXXXXXXXX"
firebase functions:config:set razorpay.key_secret="your_secret_key_here"

# Verify configuration
firebase functions:config:get
```

#### Option B: Local .env File (For Development)

Create `functions/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_secret_key_here
NODE_ENV=development
```

### 4.2 Build Cloud Functions

```bash
cd functions

# Compile TypeScript
npm run build

# Check for errors
npm run lint
```

### 4.3 Test Locally with Emulators

```bash
# Start Firebase emulators
firebase emulators:start

# Emulators will run at:
# - Functions: http://localhost:5001
# - Firestore: http://localhost:8080
# - Hosting: http://localhost:5000
# - Emulator UI: http://localhost:4000
```

### 4.4 Deploy Cloud Functions

```bash
# Deploy functions only
firebase deploy --only functions

# Note the deployed URL (format):
# https://asia-south1-your-project-id.cloudfunctions.net/api
```

### 4.5 Verify Deployment

```bash
# Test health endpoint
curl https://asia-south1-your-project-id.cloudfunctions.net/api/health

# Expected response:
# {"status":"healthy","timestamp":"...","service":"vending-machine-api","version":"1.0.0"}
```

---

## Phase 5: Frontend Deployment

### 5.1 Create Frontend Environment File

Create `frontend/.env`:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Razorpay (Public Key Only - Safe to Expose)
REACT_APP_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX

# API URL (Replace with your deployed functions URL)
REACT_APP_API_BASE_URL=https://asia-south1-your-project-id.cloudfunctions.net/api

# Environment
REACT_APP_ENV=production
```

### 5.2 Build Frontend

```bash
cd frontend

# Create production build
npm run build

# Build output will be in frontend/build/
```

### 5.3 Deploy to Firebase Hosting

```bash
# From project root
firebase deploy --only hosting

# Note the deployed URL:
# https://your-project-id.web.app
```

### 5.4 Alternative: Deploy to Vercel

```bash
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel Dashboard
# Project Settings → Environment Variables
```

### 5.5 Configure Custom Domain (Optional)

#### Firebase Hosting:
1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow DNS verification steps

#### Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records

---

## Phase 6: Database Seeding

### 6.1 Option A: Manual Seeding via Firebase Console

1. Go to Firebase Console → Firestore Database
2. Create collections and documents manually:

**Collection: `machines`**
```
Document ID: machine-001
Fields:
  - location: "Building A, Floor 1 - Lobby"
  - status: "online"
  - createdAt: (timestamp)
  - updatedAt: (timestamp)
```

**Collection: `products`**
```
Document ID: prod-001
Fields:
  - name: "Coca Cola 500ml"
  - price: 40
  - stock: 15
  - machineId: "machine-001"
  - imageUrl: "https://images.unsplash.com/..."
  - category: "beverages"
  - createdAt: (timestamp)
  - updatedAt: (timestamp)
```

### 6.2 Option B: Automated Seeding Script

```bash
# 1. Download Service Account Key
#    Firebase Console → Project Settings → Service Accounts
#    Click "Generate new private key"
#    Save as: functions/serviceAccountKey.json

# 2. Run seed script
cd functions
npm run seed
```

### 6.3 Sample Data Structure

| Machine ID | Location | Status |
|------------|----------|--------|
| machine-001 | Building A Lobby | online |
| machine-002 | Building B Cafeteria | online |
| test-machine-001 | Test Machine | online |

| Product ID | Name | Price | Stock | Machine |
|------------|------|-------|-------|---------|
| prod-001 | Coca Cola 500ml | ₹40 | 15 | machine-001 |
| prod-002 | Pepsi 500ml | ₹40 | 12 | machine-001 |
| prod-003 | Lays Classic | ₹20 | 8 | machine-001 |
| prod-004 | KitKat | ₹30 | 20 | machine-001 |
| prod-005 | Mineral Water 1L | ₹25 | 25 | machine-001 |

---

## Phase 7: Testing

### 7.1 Test Checklist

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Load Machine Page | Open `/machine/machine-001` | Products display with stock |
| Real-time Update | Open in 2 browsers, change stock in Firebase | Both update instantly |
| Out of Stock | Set stock to 0 | Buy button disabled |
| Payment Flow | Click Buy, complete payment | Stock reduces by 1 |
| Payment Cancel | Click Buy, cancel payment | No stock change |
| Invalid Machine | Open `/machine/invalid-id` | "Machine Not Found" page |
| Offline Machine | Set machine status to "offline" | "Machine Offline" warning |

### 7.2 Razorpay Test Credentials

**Test Cards:**
| Card Number | Expiry | CVV | Result |
|-------------|--------|-----|--------|
| 4111 1111 1111 1111 | Any future | Any 3 digits | Success |
| 4000 0000 0000 0002 | Any future | Any 3 digits | Declined |

**Test UPI:**
- Success: `success@razorpay`
- Failure: `failure@razorpay`

### 7.3 End-to-End Test Flow

```
1. Open: https://your-domain.com/machine/machine-001
2. Verify products load with correct prices
3. Click "Buy Now" on a product
4. Enter test card: 4111 1111 1111 1111
5. Complete payment
6. Verify:
   - Success message appears
   - Stock decreases by 1
   - Order created in Firestore
```

### 7.4 Load Testing (Optional)

```bash
# Install artillery
npm install -g artillery

# Create load test file: loadtest.yml
# Run load test
artillery run loadtest.yml
```

---

## Phase 8: Production Launch

### 8.1 Pre-Launch Checklist

- [ ] Switch Razorpay to **Live Mode**
- [ ] Update all API keys to live keys
- [ ] Enable Firebase App Check (optional)
- [ ] Set up error monitoring (Firebase Crashlytics)
- [ ] Configure CORS for production domain only
- [ ] Review and test all Firestore security rules
- [ ] Set up database backups
- [ ] Create QR codes for physical machines

### 8.2 Generate QR Codes

For each vending machine, generate QR codes pointing to:
```
https://your-domain.com/machine/{machineId}
```

**QR Code Generators:**
- [QR Code Generator](https://www.qr-code-generator.com/)
- [GoQR](https://goqr.me/)

### 8.3 Monitoring Setup

1. **Firebase Console:**
   - Functions → Logs (Monitor API calls)
   - Firestore → Usage (Monitor database operations)

2. **Razorpay Dashboard:**
   - Transactions → All Transactions
   - Set up payment alerts

### 8.4 Backup Strategy

```bash
# Export Firestore data (run periodically)
gcloud firestore export gs://your-backup-bucket/$(date +%Y-%m-%d)
```

---

## Troubleshooting Guide

### Common Issues & Solutions

#### Issue: "Firebase Functions not deploying"
```bash
# Check build errors
cd functions
npm run build

# View detailed logs
firebase functions:log
```

#### Issue: "CORS error in browser"
- Verify API URL in frontend `.env`
- Check CORS configuration in `functions/src/index.ts`

#### Issue: "Payment not working"
1. Verify Razorpay keys are correct
2. Check browser console for errors
3. Verify API endpoint is accessible
4. Check Firebase Functions logs

#### Issue: "Real-time updates not working"
1. Check Firestore security rules allow reads
2. Verify Firebase config in frontend
3. Check browser console for Firebase errors

#### Issue: "Products not loading"
1. Verify `machineId` in URL matches database
2. Check Firestore has products with matching `machineId`
3. Verify Firestore indexes are deployed

---

## Quick Reference Commands

```bash
# Start development
npm run dev

# Deploy everything
npm run deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting

# Deploy only rules
firebase deploy --only firestore:rules

# View function logs
firebase functions:log

# Start emulators
firebase emulators:start

# Seed database
cd functions && npm run seed
```

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Environment Setup | 30 mins | None |
| Phase 2: Firebase Configuration | 45 mins | Phase 1 |
| Phase 3: Razorpay Setup | 30 mins | None |
| Phase 4: Backend Deployment | 1 hour | Phase 2, 3 |
| Phase 5: Frontend Deployment | 45 mins | Phase 4 |
| Phase 6: Database Seeding | 30 mins | Phase 2 |
| Phase 7: Testing | 2 hours | Phase 5, 6 |
| Phase 8: Production Launch | 1 hour | Phase 7 |

**Total Estimated Time: 7-8 hours**

---

## Support & Resources

- **Firebase Documentation:** https://firebase.google.com/docs
- **Razorpay Documentation:** https://razorpay.com/docs
- **React Documentation:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## Next Steps After Launch

1. **Add Authentication** - User accounts for order history
2. **Admin Dashboard** - Manage products, view analytics
3. **Push Notifications** - Order status updates
4. **Multiple Payment Methods** - Add more payment options
5. **Inventory Management** - Low stock alerts
6. **Analytics** - Sales reports, popular products

---

*Last Updated: February 2026*
