# 🚀 Vercel Deployment Guide - QR Vending Machine

This guide will walk you through deploying your QR-based vending machine website to Vercel with Firebase backend.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ A [Vercel account](https://vercel.com/signup) (free tier works)
- ✅ A [GitHub account](https://github.com/signup)
- ✅ Your code pushed to a GitHub repository
- ✅ Firebase project set up (for backend)
- ✅ Razorpay account with API keys
- ✅ Firebase CLI installed: `npm install -g firebase-tools`

---

## 🏗️ Architecture Overview

**Frontend (Vercel):**
- React app hosted on Vercel CDN
- Serves static files globally
- Handles routing and UI

**Backend (Firebase):**
- Cloud Functions for API endpoints
- Firestore for database
- Hosted on Google Cloud

---

## 📦 Step 1: Prepare Your Project

### 1.1 Update Vercel Configuration

The `vercel.json` file is already configured. Verify it contains:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/frontend/build/static/$1"
    },
    {
      "src": "/favicon.ico",
      "dest": "/frontend/build/favicon.ico"
    },
    {
      "src": "/manifest.json",
      "dest": "/frontend/build/manifest.json"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/build/index.html"
    }
  ]
}
```

### 1.2 Add Build Script to Frontend Package.json

Ensure `frontend/package.json` has a `vercel-build` script:

```bash
cd frontend
```

Add this to the `scripts` section if not present:

```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "vercel-build": "react-scripts build",
  "test": "react-scripts test"
}
```

### 1.3 Create .vercelignore File

Create a `.vercelignore` file in the project root:

```bash
cd /home/a-raghavendra/Desktop/github_repos/project1
```

```
# .vercelignore
node_modules
functions/node_modules
functions/lib
.firebase
.firebaserc
firebase-debug.log
*.log
.env
.env.local
.DS_Store
```

---

## 🔥 Step 2: Deploy Firebase Backend (Production)

### 2.1 Login to Firebase

```bash
firebase login
```

### 2.2 Set Production Environment Variables

Create `functions/.env.production`:

```bash
cd functions
nano .env.production
```

Add your production values:

```env
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
RAZORPAY_KEY_SECRET=your_live_secret_key
NODE_ENV=production
ENABLE_PAYMENT_SIMULATION=false
```

**Important:** Use **live** Razorpay keys for production, not test keys!

### 2.3 Build Functions

```bash
cd functions
npm run build
```

### 2.4 Deploy Firebase Backend

```bash
cd ..
firebase deploy --only functions,firestore
```

**Expected Output:**
```
✔ Deploy complete!

Function URL (api): https://asia-south1-vending-machine-web.cloudfunctions.net/api
```

**Copy this URL** - you'll need it for Vercel!

### 2.5 Seed Production Database

```bash
cd functions
npm run seed:production
```

Verify products are created in [Firebase Console](https://console.firebase.google.com/).

---

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Push Code to GitHub

```bash
cd /home/a-raghavendra/Desktop/github_repos/project1

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - QR Vending Machine"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 3.2 Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository
5. Click **"Import"**

### 3.3 Configure Project Settings

**Framework Preset:** `Create React App`

**Root Directory:** `frontend` (⚠️ Important!)

**Build & Output Settings:**
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

### 3.4 Add Environment Variables

Click **"Environment Variables"** and add the following:

| Name | Value | Notes |
|------|-------|-------|
| `REACT_APP_FIREBASE_API_KEY` | `AIzaSyDuE7R5NI01rQdYY5BrPKfoMqK9bcRYo84` | From Firebase Console |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | `vending-machine-web.firebaseapp.com` | From Firebase Console |
| `REACT_APP_FIREBASE_PROJECT_ID` | `vending-machine-web` | Your Firebase Project ID |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | `vending-machine-web.firebasestorage.app` | From Firebase Console |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | `188303260362` | From Firebase Console |
| `REACT_APP_FIREBASE_APP_ID` | `1:188303260362:web:bbecd754740724c0cdd233` | From Firebase Console |
| `REACT_APP_RAZORPAY_KEY_ID` | `rzp_live_YOUR_KEY` | Your **LIVE** Razorpay Key |
| `REACT_APP_API_BASE_URL` | `https://asia-south1-vending-machine-web.cloudfunctions.net/api` | Your Firebase Function URL |
| `REACT_APP_ENV` | `production` | - |
| `REACT_APP_USE_EMULATOR` | `false` | Disable emulators |
| `REACT_APP_ENABLE_PAYMENT_SIMULATION` | `false` | Use real payments |

**How to get Firebase Config:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click ⚙️ Settings → Project Settings
4. Scroll to "Your apps" → Web app
5. Copy the config values

### 3.5 Deploy!

Click **"Deploy"**

Vercel will:
1. Clone your repository
2. Install dependencies
3. Build the React app
4. Deploy to global CDN

**Wait for deployment to complete** (~2-3 minutes)

---

## ✅ Step 4: Verify Deployment

### 4.1 Check Deployment URL

After deployment completes, you'll see:
```
✅ Production: https://your-app-name.vercel.app
```

### 4.2 Test the Website

Visit your Vercel URL and verify:

- ✅ Homepage loads correctly
- ✅ QR code display works
- ✅ "Browse demo" button navigates to products
- ✅ Products load from Firebase
- ✅ Payment flow works with Razorpay

### 4.3 Test on Mobile

1. Open your phone browser
2. Visit `https://your-app-name.vercel.app`
3. Test QR scanning functionality
4. Test purchasing a product

### 4.4 Check Backend Connection

Open browser console (F12) and verify:
- No CORS errors
- API calls to Firebase Functions succeed
- Products load correctly

---

## 🔧 Step 5: Configure Custom Domain (Optional)

### 5.1 Add Domain to Vercel

1. Go to your project in Vercel Dashboard
2. Click **"Settings"** → **"Domains"**
3. Enter your domain (e.g., `vendingmachine.com`)
4. Click **"Add"**

### 5.2 Update DNS Records

Add these DNS records at your domain registrar:

**For root domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 5.3 Wait for DNS Propagation

- Typically takes 10-60 minutes
- Check status at: https://dnschecker.org/

### 5.4 Enable HTTPS

Vercel automatically provisions SSL certificates via Let's Encrypt.

---

## 🔐 Step 6: Security Configuration

### 6.1 Update CORS Settings (Firebase)

Create `functions/src/middleware/cors.ts`:

```typescript
export const corsOptions = {
  origin: [
    'https://your-app-name.vercel.app',
    'https://www.your-domain.com',
    'http://localhost:3000' // For local development
  ],
  credentials: true
};
```

Update your Firebase functions to use these CORS settings.

### 6.2 Update Firestore Security Rules

Ensure `firestore.rules` has proper security:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /machines/{machineId} {
      allow read: if true;
      allow write: if false; // Only allow through Cloud Functions
    }
    
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Only allow through Cloud Functions
    }
    
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow write: if false; // Only allow through Cloud Functions
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

### 6.3 Enable Firebase App Check (Recommended)

1. Go to Firebase Console → App Check
2. Enable reCAPTCHA v3 for web
3. Add your Vercel domain to allowed domains

---

## 📊 Step 7: Monitoring & Analytics

### 7.1 Enable Vercel Analytics

1. Go to your project in Vercel
2. Click **"Analytics"** tab
3. Enable **Web Analytics** (free tier)

This tracks:
- Page views
- User sessions
- Performance metrics
- Geographic data

### 7.2 Enable Firebase Analytics

Add to `frontend/src/services/firebase.js`:

```javascript
import { getAnalytics } from 'firebase/analytics';

const analytics = getAnalytics(app);
```

### 7.3 Monitor Backend Performance

View Cloud Functions metrics:
```bash
firebase functions:log
```

Or use [Firebase Console](https://console.firebase.google.com/) → Functions → Usage

---

## 🔄 Step 8: Continuous Deployment

### 8.1 Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update homepage styling"
git push origin main
```

Vercel will:
1. Detect the push
2. Trigger a new build
3. Deploy to production
4. Send you a notification

### 8.2 Preview Deployments

Every pull request gets a preview URL:

```bash
git checkout -b feature/new-payment-option
# Make changes
git push origin feature/new-payment-option
```

Create a PR on GitHub → Vercel creates preview URL

### 8.3 Rollback Deployments

If something breaks:

1. Go to Vercel Dashboard → Deployments
2. Find a working deployment
3. Click **"..."** → **"Promote to Production"**

---

## 🚨 Troubleshooting

### Issue: "Module not found" during build

**Solution:**
```bash
# Make sure all dependencies are in package.json, not devDependencies
cd frontend
npm install --save package-name
```

### Issue: Environment variables not working

**Checklist:**
- ✅ Variables start with `REACT_APP_`
- ✅ Variables added in Vercel Dashboard
- ✅ Redeployed after adding variables
- ✅ No quotes around values in Vercel UI

**Solution:**
```bash
# Trigger redeploy
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

### Issue: CORS errors in production

**Solution:**

Update `functions/src/index.ts`:

```typescript
import cors from 'cors';

const corsOptions = {
  origin: 'https://your-app-name.vercel.app',
  credentials: true
};

export const api = onRequest({ cors: corsOptions }, async (req, res) => {
  // Your API code
});
```

Redeploy functions:
```bash
firebase deploy --only functions
```

### Issue: 404 errors on page refresh

**Solution:**

The `vercel.json` already handles this with the catch-all route:
```json
{
  "src": "/(.*)",
  "dest": "/frontend/build/index.html"
}
```

If still having issues, verify `vercel.json` is in project root.

### Issue: Build fails with memory error

**Solution:**

Increase Node memory in `frontend/package.json`:

```json
"scripts": {
  "build": "NODE_OPTIONS=--max_old_space_size=4096 react-scripts build",
  "vercel-build": "NODE_OPTIONS=--max_old_space_size=4096 react-scripts build"
}
```

### Issue: Payment not working in production

**Checklist:**
- ✅ Using **live** Razorpay keys (not test)
- ✅ Razorpay account activated for live mode
- ✅ Vercel domain added to Razorpay allowed domains
- ✅ `REACT_APP_API_BASE_URL` points to production Firebase URL

**Test:**
```bash
curl https://your-app-name.vercel.app
# Should return HTML

curl https://asia-south1-vending-machine-web.cloudfunctions.net/api/health
# Should return {"status":"healthy"}
```

---

## 📱 Step 9: QR Code Setup for Production

### 9.1 Generate Production QR Codes

1. Visit: `https://your-app-name.vercel.app/admin/qr-generator`
2. Select machine ID
3. Download QR code PNG
4. Print in high quality (300 DPI minimum)

### 9.2 QR Code Format

Each QR code encodes:
```
https://your-app-name.vercel.app/machine/machine-001
```

### 9.3 Physical Placement

- Print on weather-resistant material
- Place at eye level on vending machine
- Ensure good lighting for scanning
- Add text: "Scan to order"

---

## 💰 Step 10: Go Live with Payments

### 10.1 Activate Razorpay Live Mode

1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Complete KYC verification
3. Switch to **Live Mode** (toggle in top-right)
4. Generate Live API Keys:
   - Settings → API Keys → Generate Live Key
   - Copy `Key ID` and `Key Secret`

### 10.2 Update Environment Variables

**In Vercel:**
Update `REACT_APP_RAZORPAY_KEY_ID` to your live key

**In Firebase:**
```bash
cd functions
nano .env.production
```

Update to live keys:
```env
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
RAZORPAY_KEY_SECRET=your_live_secret_key
```

### 10.3 Configure Razorpay Webhooks

1. Go to Razorpay Dashboard → Webhooks
2. Create new webhook
3. URL: `https://asia-south1-vending-machine-web.cloudfunctions.net/api/webhook`
4. Events: Select `payment.authorized`, `payment.failed`
5. Copy webhook secret

Update functions:
```typescript
const webhookSecret = 'your_webhook_secret';
```

### 10.4 Test Live Payments

Use a real card with small amount (₹1) to verify:
- Payment gateway opens
- Payment processes successfully
- Stock updates in database
- Order confirmation works

---

## 📈 Step 11: Performance Optimization

### 11.1 Enable Vercel Edge Network

Already enabled by default! Your site is served from 300+ global edge locations.

### 11.2 Enable Image Optimization

If you add product images, use Vercel Image Optimization:

```jsx
import Image from 'next/image';

<Image 
  src="/products/cola.jpg" 
  alt="Cola"
  width={200}
  height={200}
  loading="lazy"
/>
```

### 11.3 Enable Compression

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

## 🎯 Post-Deployment Checklist

- ✅ Website accessible at Vercel URL
- ✅ All pages load correctly (Home, Machine, QR Generator)
- ✅ Products display from Firebase
- ✅ QR codes can be scanned
- ✅ Payment flow completes successfully
- ✅ Stock updates after purchase
- ✅ Mobile responsive on all devices
- ✅ HTTPS certificate active
- ✅ No console errors in browser
- ✅ Firebase Functions responding
- ✅ Analytics tracking enabled
- ✅ Custom domain configured (if applicable)
- ✅ Razorpay live keys configured
- ✅ Security rules deployed
- ✅ Backup strategy in place

---

## 📞 Support & Resources

### Vercel Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Deploy React App](https://vercel.com/guides/deploying-react-with-vercel)
- [Environment Variables](https://vercel.com/docs/environment-variables)

### Firebase Documentation
- [Cloud Functions](https://firebase.google.com/docs/functions)
- [Firestore](https://firebase.google.com/docs/firestore)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

### Razorpay Documentation
- [Payment Gateway](https://razorpay.com/docs/payments/)
- [Webhooks](https://razorpay.com/docs/webhooks/)
- [Test Cards](https://razorpay.com/docs/payments/payments/test-card-upi-details/)

---

## 🎉 You're Live!

Congratulations! Your QR-based vending machine website is now live on Vercel. 

**Your Production URLs:**
- Frontend: `https://your-app-name.vercel.app`
- API: `https://asia-south1-vending-machine-web.cloudfunctions.net/api`

**Next Steps:**
1. Monitor analytics and user behavior
2. Gather customer feedback
3. Iterate and improve
4. Scale to more vending machines!

---

**Happy Vending! 🥤🍫🍪**
