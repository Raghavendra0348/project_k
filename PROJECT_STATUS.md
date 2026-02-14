# 📊 Project Status Report — QR-Based Vending Machine System

**Generated**: February 14, 2026  
**Project**: QR-Based Real-Time Vending Machine System  
**Repository**: `project1`

---

## 📌 Executive Summary

This project is a **QR-based vending machine web app** that allows users to scan a QR code, browse products in real-time, pay via Razorpay, and trigger product dispensing. The frontend (React + Tailwind CSS) and backend (Firebase Cloud Functions + Express + TypeScript) are both largely implemented. The core purchase flow is functional in local development. However, there are **critical issues** around hardcoded credentials, a broken API URL in the `.env`, a missing route registration, and no refund logic that must be addressed before production readiness.

### Overall Completion: ~75%

| Area | Completion |
|------|-----------|
| Frontend UI & Components | 95% |
| Backend API & Payment Flow | 85% |
| Database & Security Rules | 90% |
| Infrastructure & Deployment | 50% |
| Testing | 0% |
| Production Readiness | 30% |

---

## 🏗️ Architecture & Tech Stack

```
User → QR Scan → React Frontend → Firestore (real-time) → Display Products
                      ↓
               Click Buy Now
                      ↓
         Cloud Functions (Express API)
                      ↓
             Razorpay Payment Gateway
                      ↓
         Verify Signature → Update Stock (atomic) → Dispense Queue
```

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + React Router | 18.2.0, 6.18.0 |
| Styling | Tailwind CSS | 3.3.5 |
| Icons | Lucide React | 0.292.0 |
| Notifications | react-hot-toast | 2.4.1 |
| QR Scanning | react-qr-reader | 3.0.0-beta-1 |
| QR Generation | qrcode | 1.5.4 |
| Backend | Firebase Cloud Functions + Express | 4.9.0, 4.18.2 |
| Language | TypeScript | 4.9.5 |
| Database | Cloud Firestore | — |
| Payments | Razorpay | 2.9.2 |
| Hosting | Firebase Hosting + Vercel (dual) | — |

---

## ✅ What's Fully Implemented & Working

### Frontend

| Feature | File(s) | Status |
|---------|---------|--------|
| Home page with hero, features, QR scanner | `frontend/src/pages/HomePage.jsx` | ✅ Working |
| Machine page (browse products) | `frontend/src/pages/MachinePage.jsx` | ✅ Working |
| QR Code Generator (Admin) | `frontend/src/pages/QRGeneratorPage.jsx` | ✅ Working |
| 404 Not Found page | `frontend/src/pages/NotFound.jsx` | ✅ Working |
| Product card with stock color-coding | `frontend/src/components/ProductCard.jsx` | ✅ Working |
| Product list grid (responsive) | `frontend/src/components/ProductList.jsx` | ✅ Working |
| Header with online/offline badge | `frontend/src/components/Header.jsx` | ✅ Working |
| Payment modal (all states) | `frontend/src/components/PaymentModal.jsx` | ✅ Working |
| Skeleton loading states | `frontend/src/components/LoadingSpinner.jsx` | ✅ Working |
| Real-time machine listener | `frontend/src/hooks/useMachine.js` | ✅ Working |
| Real-time product listener | `frontend/src/hooks/useProducts.js` | ⚠️ Partial (see issues) |
| API service (createOrder, verifyPayment, dispense) | `frontend/src/services/api.js` | ✅ Working |
| Razorpay checkout integration | `frontend/src/services/razorpay.js` | ✅ Working |
| Client-side routing | `frontend/src/App.jsx` | ✅ Working |
| Tailwind with custom theme | `frontend/tailwind.config.js` | ✅ Working |
| Mobile-first responsive design | All components | ✅ Working |

### Backend

| Feature | File(s) | Status |
|---------|---------|--------|
| Express app with CORS | `functions/src/index.ts` | ✅ Working |
| Create Razorpay order | `functions/src/createOrder.ts` | ✅ Working |
| Verify payment signature (HMAC-SHA256) | `functions/src/verifyPayment.ts` | ✅ Working |
| Atomic stock update (Firestore transaction) | `functions/src/verifyPayment.ts` | ✅ Working |
| Dispense queue system | `functions/src/dispense.ts` | ✅ Working |
| Health check endpoint | `functions/src/health.ts` | ✅ Working |
| Input validation (all endpoints) | `functions/src/utils/validation.ts` | ✅ Working |
| Razorpay SDK wrapper | `functions/src/utils/razorpay.ts` | ✅ Working |
| Timing-safe signature comparison | `functions/src/utils/razorpay.ts` | ✅ Working |
| Firestore triggers (onOrderCreated, onPaymentSuccess) | `functions/src/index.ts` | ✅ Working |
| Seed data scripts (emulator + production) | `functions/seed-emulator.js`, `functions/src/scripts/seedData.ts` | ✅ Working |

### Infrastructure

| Feature | File(s) | Status |
|---------|---------|--------|
| Firestore security rules (read-only) | `firestore.rules` | ✅ Working |
| Composite indexes (products, orders) | `firestore.indexes.json` | ✅ Working |
| Firebase config (hosting, functions, emulators) | `firebase.json` | ✅ Working |
| TypeScript compilation (strict mode) | `functions/tsconfig.json` | ✅ Working |
| Quick start script | `quick-start.sh` | ✅ Working |

---

## ⚠️ Known Issues & Bugs

### 🔴 Critical Issues

| # | Issue | File | Details |
|---|-------|------|---------|
| 1 | **Hardcoded Firebase config** | `frontend/src/services/firebase.js` (lines 20-27) | Firebase API key, project ID, and app ID are hardcoded instead of using `REACT_APP_FIREBASE_*` environment variables. The `.env` has these values but they're ignored. This means credentials are committed to the git repo. |
| 2 | **Dispense confirm route not registered** | `functions/src/index.ts` | `dispenseConfirmHandler` is exported from `dispense.ts` (line 191) but no `app.post('/dispense/confirm', ...)` route exists in `index.ts`. The endpoint is unreachable. |
| 3 | **No refund implementation** | `functions/src/verifyPayment.ts` (lines 229-238) | When stock runs out during the atomic transaction (after payment was already collected), the order is marked `needsRefund: true` but **no actual Razorpay refund API call** is made. Customer's money is taken but product can't be delivered. |
| 4 | **CORS allows all origins** | `functions/src/index.ts` (line 27) | `origin: true` allows any website to call the API. No conditional restriction for production. |

### 🟡 Important Issues

| # | Issue | File | Details |
|---|-------|------|---------|
| 5 | **Stale closure in useProducts** | `frontend/src/hooks/useProducts.js` (line 98) | `previousStock` is read inside the `onSnapshot` callback but isn't in the `useEffect` dependency array (line 114). Stock change detection captures a stale reference. |
| 6 | **refresh() function is a no-op** | `frontend/src/hooks/useProducts.js` (lines 56-59) | `refresh()` sets loading/error state but doesn't re-trigger the subscription since `useEffect` only depends on `machineId`. |
| 7 | **Duplicate admin import in dispense.ts** | `functions/src/dispense.ts` (line 18) | Imports `* as admin from 'firebase-admin'` directly while `adminSDK` is available from `./firebase`. |
| 8 | **Unused canvasRef** | `frontend/src/pages/QRGeneratorPage.jsx` (line 20) | `const canvasRef = useRef(null)` is declared but never used. |
| 9 | **Missing useEffect dependency** | `frontend/src/pages/QRGeneratorPage.jsx` (lines 23-25) | `generateQRCode` is called inside `useEffect` but not in the dependency array. React will warn. |
| 10 | **Two competing QR scanner packages** | `frontend/package.json` | Both `react-qr-reader` (beta) and `react-qr-scanner` (alpha) are installed. Only `react-qr-reader` is used. |
| 11 | **Demo machines shown in production** | `frontend/src/pages/HomePage.jsx` (lines 196-216) | "Try Demo Machines" section with test links renders in all environments, not just development. |
| 12 | **No rate limiting** | `functions/src/index.ts` | No request throttling on any endpoint. An attacker could spam `/createOrder` to create thousands of Razorpay orders. |

### 🟢 Minor Issues

| # | Issue | File | Details |
|---|-------|------|---------|
| 13 | Hardcoded copyright year `© 2024` | `frontend/src/pages/HomePage.jsx` (line 230) | Should be dynamic or updated to 2026. |
| 14 | Low memory limit (256MB) | `functions/src/index.ts` (line 84) | May be insufficient under load; 512MB recommended for Express. |
| 15 | Empty string fallback for Razorpay key | `frontend/src/config/constants.js` (line 30) | If env var missing, checkout fails silently with no helpful error. |
| 16 | Console.log in production code | Multiple frontend files | Debug `console.log` statements remain in services and hooks. |
| 17 | Firebase Emulator UI disabled | `firebase.json` | `"ui": { "enabled": false }` prevents local debugging UI. |

---

## ❌ Not Implemented

| Feature | Priority | Effort | Notes |
|---------|----------|--------|-------|
| **Unit / Integration Tests** | High | Medium | jest is configured but zero test files exist. No test coverage at all. |
| **Production Deployment Pipeline** | High | Medium | `.env` points to localhost. No production `.env` file. No CI/CD pipeline. |
| **Razorpay Webhooks** | High | Low | Server-to-server payment confirmation as backup to client-side flow. `RAZORPAY_WEBHOOK_SECRET` in `.env` is unused. |
| **Refund System** | High | Medium | Orders marked `needsRefund` but no actual refund processing. |
| **User Authentication** | Medium | Medium | No login/auth. No per-user purchase history or abuse prevention. |
| **Admin Dashboard** | Medium | High | No way to manage machines/products/orders except Firebase Console. |
| **PWA Support** | Low | Low | Mobile-web-app meta tags exist but no service worker or manifest. |
| **Analytics / Monitoring** | Low | Low | No Firebase Analytics, Performance Monitoring, or Crashlytics. |
| **Inventory Alerts** | Low | Low | No notifications when stock runs low. |
| **Multi-language Support** | Low | Medium | Hardcoded English strings. |

---

## 🔒 Security Assessment

### 🔴 Must Fix

1. **Hardcoded Firebase config in source code** — Use `process.env.REACT_APP_*` variables in `firebase.js`
2. **No CORS restriction for production** — Restrict `origin` to your deployment domains
3. **No rate limiting** — Add `express-rate-limit` or Firebase App Check

### 🟡 Should Fix

4. **No Firebase App Check** — Can't distinguish legitimate app traffic from bot/script abuse
5. **No authentication** — Any user with a machine URL can repeatedly initiate purchases
6. **No Razorpay webhook verification** — Only relying on client-side verification callback

### ✅ Already Good

- ✅ Server-side payment signature verification (HMAC-SHA256)
- ✅ Timing-safe comparison prevents timing attacks
- ✅ Atomic Firestore transactions prevent race conditions
- ✅ Firestore rules deny all client-side writes
- ✅ Input validation on all endpoints with regex
- ✅ Sensitive files in `.gitignore`

---

## 📈 Improvement Roadmap

### Phase 1: Bug Fixes & Critical Security (1-2 days)

- [ ] Fix `firebase.js` to use environment variables instead of hardcoded config
- [ ] Register `/dispense/confirm` route in `index.ts`
- [ ] Fix `useProducts.js` stale closure (use `useRef` for `previousStock`)
- [ ] Fix `useProducts.js` refresh function
- [ ] Remove unused `react-qr-scanner` package
- [ ] Remove `canvasRef` from `QRGeneratorPage.jsx`
- [ ] Fix QRGeneratorPage `useEffect` dependency warning
- [ ] Update copyright year

### Phase 2: Production Readiness (3-5 days)

- [ ] Implement Razorpay refund for out-of-stock-after-payment cases
- [ ] Add `express-rate-limit` middleware to all endpoints
- [ ] Restrict CORS to deployment domain in production
- [ ] Create production `.env` files with deployed Cloud Functions URL
- [ ] Upgrade to Firebase Blaze plan for Cloud Functions deployment
- [ ] Deploy Cloud Functions to Firebase
- [ ] Deploy frontend to Firebase Hosting or Vercel
- [ ] Implement Razorpay webhook endpoint as fallback
- [ ] Remove all `console.log` statements or gate behind `NODE_ENV`
- [ ] Conditionally hide demo machines section in production

### Phase 3: Quality & Reliability (1-2 weeks)

- [ ] Add unit tests for all Cloud Functions handlers
- [ ] Add integration tests for the payment flow
- [ ] Add React component tests (React Testing Library)
- [ ] Set up CI/CD (GitHub Actions)
- [ ] Add Firebase App Check
- [ ] Add structured logging with log levels
- [ ] Upgrade `firebase-functions` to v5.x
- [ ] Increase function memory to 512MB

### Phase 4: Feature Enhancements (2-4 weeks)

- [ ] Build admin dashboard (manage machines, products, orders)
- [ ] Add user authentication (optional sign-in for purchase history)
- [ ] Add PWA support (service worker, offline page, install prompt)
- [ ] Add Firebase Analytics and Performance Monitoring
- [ ] Add inventory alert notifications (email/SMS when stock is low)
- [ ] Add order history page accessible via QR scan
- [ ] Add multiple payment method support (UPI intent, wallets)

---

## 📊 Dependency Health

| Package | Current | Latest (Feb 2026) | Risk |
|---------|---------|-------------------|------|
| react | 18.2.0 | 19.x | 🟡 Major update available |
| firebase | 10.5.2 | 11.x | 🟡 Major update available |
| firebase-functions | 4.9.0 | 5.x+ | 🔴 Deprecated, breaking changes |
| firebase-admin | 11.11.0 | 12.x | 🟡 Major update available |
| react-qr-reader | 3.0.0-beta-1 | — | 🔴 Unmaintained beta |
| tailwindcss | 3.3.5 | 4.x | 🟡 Major update available |
| react-router-dom | 6.18.0 | 7.x | 🟡 Major update available |
| typescript | 4.9.5 | 5.x | 🟡 Major update available |

---

## 📁 File-by-File Status

### Frontend (`frontend/src/`)

| File | LOC | Status | Issues |
|------|-----|--------|--------|
| `App.jsx` | 74 | ✅ Clean | — |
| `index.js` | 18 | ✅ Clean | — |
| `index.css` | ~50 | ✅ Clean | — |
| `components/Header.jsx` | ~100 | ✅ Clean | — |
| `components/ProductCard.jsx` | ~180 | ✅ Clean | — |
| `components/ProductList.jsx` | ~120 | ✅ Clean | — |
| `components/PaymentModal.jsx` | ~250 | ✅ Clean | — |
| `components/LoadingSpinner.jsx` | ~80 | ✅ Clean | — |
| `pages/MachinePage.jsx` | 254 | ✅ Clean | — |
| `pages/HomePage.jsx` | 232 | ⚠️ Minor | Demo links in prod, old copyright |
| `pages/QRGeneratorPage.jsx` | 177 | ⚠️ Minor | Unused ref, missing dep |
| `pages/NotFound.jsx` | ~60 | ✅ Clean | — |
| `hooks/useMachine.js` | 94 | ✅ Clean | — |
| `hooks/useProducts.js` | 135 | ⚠️ Bugs | Stale closure, broken refresh |
| `services/firebase.js` | 66 | 🔴 Critical | Hardcoded credentials |
| `services/api.js` | 165 | ✅ Clean | — |
| `services/razorpay.js` | 187 | ✅ Clean | — |
| `config/constants.js` | 104 | ✅ Clean | — |

### Backend (`functions/src/`)

| File | LOC | Status | Issues |
|------|-----|--------|--------|
| `index.ts` | 153 | ⚠️ Issue | Missing dispense/confirm route, CORS |
| `createOrder.ts` | 198 | ✅ Clean | — |
| `verifyPayment.ts` | 281 | ⚠️ Issue | No refund implementation |
| `dispense.ts` | 264 | ⚠️ Minor | Duplicate admin import |
| `health.ts` | ~30 | ✅ Clean | — |
| `firebase.ts` | 20 | ✅ Clean | — |
| `utils/razorpay.ts` | 198 | ✅ Clean | — |
| `utils/validation.ts` | ~150 | ✅ Clean | — |

---

**End of Report**

*This document should be updated as issues are resolved and features are added.*
