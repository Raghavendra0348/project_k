# 🚀 Deployment Guide

## Prerequisites

1. **Firebase Project**: Create at [Firebase Console](https://console.firebase.google.com)
2. **Razorpay Account**: Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com)
3. **Node.js 18+**: Download from [nodejs.org](https://nodejs.org)

---

## 🔥 Firebase Setup

### 1. Create Firebase Project

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (select Firestore, Functions, Hosting)
firebase init
```

### 2. Configure Firestore

1. Go to Firebase Console → Firestore Database
2. Create database in production mode
3. Select region: `asia-south1` (Mumbai) for India

### 3. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

### 4. Set Functions Environment Variables

```bash
# Set Razorpay credentials
firebase functions:config:set razorpay.key_id="rzp_live_xxxxx"
firebase functions:config:set razorpay.key_secret="your_secret_key"

# View current config
firebase functions:config:get
```

---

## 💳 Razorpay Setup

### 1. Get API Keys

1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Go to Settings → API Keys
3. Generate API Keys (Test Mode for development)

### 2. Configure Webhooks (Optional)

1. Go to Settings → Webhooks
2. Add webhook URL: `https://your-region-your-project.cloudfunctions.net/api/webhook`
3. Select events: `payment.captured`, `payment.failed`

---

## 🌐 Frontend Deployment

### Option A: Firebase Hosting

```bash
# Build frontend
cd frontend
npm run build

# Deploy
firebase deploy --only hosting
```

### Option B: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Set environment variables in Vercel dashboard
```

### Environment Variables (Frontend)

Create `.env` file in `frontend/` directory:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxx
REACT_APP_API_BASE_URL=https://asia-south1-your-project.cloudfunctions.net/api
```

---

## ⚡ Cloud Functions Deployment

```bash
cd functions

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy functions
firebase deploy --only functions
```

---

## 🗄️ Database Seeding

### Using Admin Console

1. Go to Firebase Console → Firestore
2. Manually add documents to `machines` and `products` collections

### Using Seed Script

```bash
# Download service account key from Firebase Console
# Save as: functions/serviceAccountKey.json

cd functions
npm run seed
```

---

## 🧪 Testing

### Test Mode Credentials

**Razorpay Test Cards:**
| Card Number | Expiry | CVV | Result |
|-------------|--------|-----|--------|
| 4111 1111 1111 1111 | Any future | Any | Success |
| 4000 0000 0000 0002 | Any future | Any | Decline |

**Test UPI:** `success@razorpay`

### Local Development

```bash
# Terminal 1: Start emulators
firebase emulators:start

# Terminal 2: Start frontend
cd frontend
npm start

# Open: http://localhost:3000/machine/test-machine-001
```

---

## 📝 Production Checklist

- [ ] Switch Razorpay to Live mode
- [ ] Update API keys in Firebase Functions config
- [ ] Enable Firebase App Check (optional but recommended)
- [ ] Set up monitoring in Firebase Console
- [ ] Configure custom domain
- [ ] Set up error alerting
- [ ] Test payment flow end-to-end
- [ ] Review Firestore security rules
- [ ] Set up database backups

---

## 🔧 Troubleshooting

### Functions not deploying?
```bash
# Check for build errors
cd functions
npm run build

# Check logs
firebase functions:log
```

### Payment not working?
1. Verify Razorpay keys are correct
2. Check browser console for errors
3. Verify API endpoint URL
4. Check Firebase Functions logs

### Real-time updates not working?
1. Verify Firestore rules allow reads
2. Check browser console for Firebase errors
3. Verify Firebase config in frontend

---

## 📞 Support

- Firebase: [firebase.google.com/support](https://firebase.google.com/support)
- Razorpay: [razorpay.com/support](https://razorpay.com/support)
