# 🏭 QR-Based Real-Time Vending Machine System

A production-ready, scalable vending machine web application that enables real-time product browsing, purchasing, and inventory management through QR code scanning.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     QR Scan      ┌──────────────────────────────────────┐
│   Vending    │ ──────────────── │         User's Mobile Browser         │
│   Machine    │   /machine/xyz   │         (React + Tailwind)            │
└──────────────┘                  └──────────────────────────────────────┘
       │                                          │
       │                                          │ Real-time
       │                                          │ Firestore
       │                                          │ Listeners
       │                                          ▼
       │                          ┌──────────────────────────────────────┐
       │                          │        Firebase Firestore             │
       │                          │   ┌─────────┐ ┌─────────┐ ┌────────┐ │
       │                          │   │Machines │ │Products │ │Orders  │ │
       │                          │   └─────────┘ └─────────┘ └────────┘ │
       │                          └──────────────────────────────────────┘
       │                                          ▲
       │                                          │
       │                          ┌──────────────────────────────────────┐
       │      POST /dispense      │     Firebase Cloud Functions          │
       │◄─────────────────────────│  ┌────────────┐  ┌─────────────────┐ │
       │                          │  │Create Order│  │Verify Payment   │ │
       │                          │  │   API      │  │& Update Stock   │ │
       │                          │  └────────────┘  └─────────────────┘ │
       │                          └──────────────────────────────────────┘
       │                                          ▲
       │                                          │
       │                          ┌──────────────────────────────────────┐
       │                          │         Razorpay Gateway              │
       │                          │   ┌─────────────────────────────┐    │
       │                          │   │  Payment Processing          │    │
       │                          │   │  Signature Verification      │    │
       │                          │   └─────────────────────────────┘    │
       │                          └──────────────────────────────────────┘
```

## 📁 Project Structure

```
project1/
├── frontend/                     # React Frontend Application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/           # Reusable UI Components
│   │   │   ├── ProductCard.jsx   # Individual product display
│   │   │   ├── ProductList.jsx   # Product grid with real-time updates
│   │   │   ├── Header.jsx        # App header with machine info
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── PaymentModal.jsx  # Razorpay checkout modal
│   │   ├── pages/
│   │   │   ├── MachinePage.jsx   # Main vending machine page
│   │   │   └── NotFound.jsx      # 404 page
│   │   ├── hooks/
│   │   │   ├── useProducts.js    # Real-time products listener
│   │   │   └── useMachine.js     # Machine data hook
│   │   ├── services/
│   │   │   ├── firebase.js       # Firebase configuration
│   │   │   ├── api.js            # Backend API calls
│   │   │   └── razorpay.js       # Razorpay integration
│   │   ├── config/
│   │   │   └── constants.js      # App constants
│   │   ├── App.jsx               # Main app with routing
│   │   ├── index.js              # Entry point
│   │   └── index.css             # Tailwind CSS imports
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
├── functions/                    # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts              # Function exports
│   │   ├── createOrder.ts        # Create Razorpay order
│   │   ├── verifyPayment.ts      # Verify payment & update stock
│   │   ├── dispense.ts           # Notify vending machine
│   │   └── utils/
│   │       ├── razorpay.ts       # Razorpay SDK wrapper
│   │       └── validation.ts     # Input validation helpers
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── firestore.rules               # Firestore security rules
├── firestore.indexes.json        # Firestore indexes
├── firebase.json                 # Firebase configuration
├── .firebaserc                   # Firebase project config
└── README.md                     # This file
```

## 🔄 Payment Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                         PAYMENT FLOW DIAGRAM                            │
└────────────────────────────────────────────────────────────────────────┘

    User                    Frontend              Backend              Razorpay
      │                        │                     │                     │
      │  1. Click "Buy"        │                     │                     │
      │───────────────────────>│                     │                     │
      │                        │                     │                     │
      │                        │  2. POST /createOrder                     │
      │                        │    {productId, machineId}                 │
      │                        │────────────────────>│                     │
      │                        │                     │                     │
      │                        │                     │  3. Create Order    │
      │                        │                     │────────────────────>│
      │                        │                     │                     │
      │                        │                     │  4. Order ID        │
      │                        │                     │<────────────────────│
      │                        │                     │                     │
      │                        │  5. Return orderId  │                     │
      │                        │<────────────────────│                     │
      │                        │                     │                     │
      │  6. Open Razorpay      │                     │                     │
      │     Checkout Modal     │                     │                     │
      │<───────────────────────│                     │                     │
      │                        │                     │                     │
      │  7. Enter Payment      │                     │                     │
      │     Details            │                     │                     │
      │───────────────────────>│                     │                     │
      │                        │                     │                     │
      │                        │  8. Payment to Razorpay                   │
      │                        │────────────────────────────────────────-->│
      │                        │                     │                     │
      │                        │  9. Payment Response (signature)          │
      │                        │<─────────────────────────────────────────│
      │                        │                     │                     │
      │                        │  10. POST /verifyPayment                  │
      │                        │    {orderId, paymentId, signature}        │
      │                        │────────────────────>│                     │
      │                        │                     │                     │
      │                        │                     │  11. Verify         │
      │                        │                     │      Signature      │
      │                        │                     │────────────────────>│
      │                        │                     │                     │
      │                        │                     │  12. Signature OK   │
      │                        │                     │<────────────────────│
      │                        │                     │                     │
      │                        │                     │  13. Transaction:   │
      │                        │                     │      - Check stock  │
      │                        │                     │      - Reduce stock │
      │                        │                     │      - Create order │
      │                        │                     │                     │
      │                        │  14. Success        │                     │
      │                        │<────────────────────│                     │
      │                        │                     │                     │
      │  15. Show Success      │                     │  16. POST /dispense │
      │      Message           │                     │────────────────────>│
      │<───────────────────────│                     │     (to machine)    │
      │                        │                     │                     │
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Razorpay Account (Test Mode)

### 1. Clone & Install

```bash
# Install frontend dependencies
cd frontend
npm install

# Install functions dependencies
cd ../functions
npm install
```

### 2. Configure Environment Variables

**Frontend (.env)**
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxx
REACT_APP_API_BASE_URL=https://your-region-your-project.cloudfunctions.net
```

**Functions (.env)**
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
```

### 3. Initialize Firebase

```bash
firebase login
firebase init
# Select: Firestore, Functions, Hosting
```

### 4. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 5. Seed Test Data

```bash
cd functions
npm run seed  # Or manually add data via Firebase Console
```

### 6. Run Locally

```bash
# Terminal 1: Functions emulator
cd functions
npm run serve

# Terminal 2: Frontend
cd frontend
npm start
```

### 7. Deploy to Production

```bash
# Deploy functions
cd functions
npm run deploy

# Deploy frontend
cd frontend
npm run build
firebase deploy --only hosting
# OR deploy to Vercel
vercel --prod
```

## 🧪 Test Mode Instructions

### Razorpay Test Cards

| Card Number | Expiry | CVV | Result |
|-------------|--------|-----|--------|
| 4111 1111 1111 1111 | Any future | Any | Success |
| 4000 0000 0000 0002 | Any future | Any | Decline |

### Test UPI
- Use any UPI ID ending with `@razorpay`
- Example: `success@razorpay`

### Test Flow
1. Open: `http://localhost:3000/machine/test-machine-001`
2. Products load with real-time stock
3. Click "Buy" on any product
4. Complete payment with test card
5. Watch stock update instantly

## 📊 Database Schema

### machines/{machineId}
```javascript
{
  location: "Building A, Floor 2",
  status: "online",  // "online" | "offline"
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### products/{productId}
```javascript
{
  name: "Coca Cola 500ml",
  price: 40,          // in INR (smallest unit: paise x 100)
  stock: 25,
  machineId: "machine-001",
  imageUrl: "https://...",
  category: "beverages",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### orders/{orderId}
```javascript
{
  productId: "product-001",
  machineId: "machine-001",
  amount: 4000,       // in paise
  razorpayOrderId: "order_xxxxx",
  razorpayPaymentId: "pay_xxxxx",
  paymentStatus: "success",  // "pending" | "success" | "failed"
  dispensed: false,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🔒 Security Features

1. **Backend-only Payment Verification**: Razorpay signature verified on server
2. **Firestore Transactions**: Atomic stock updates prevent race conditions
3. **Input Validation**: All inputs validated server-side
4. **Security Rules**: Frontend cannot directly modify stock
5. **Environment Variables**: All secrets stored securely

## 📱 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/createOrder` | Create Razorpay order |
| POST | `/verifyPayment` | Verify payment & update stock |
| POST | `/dispense` | Notify machine to dispense |
| GET | `/health` | Health check endpoint |

## 🛠️ Development

### Running Tests
```bash
cd functions
npm test

cd frontend
npm test
```

### Linting
```bash
npm run lint
```

## 📄 License

MIT License - See LICENSE file for details.
