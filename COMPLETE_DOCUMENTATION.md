# Complete Documentation - Vending Machine Web Application

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Frontend Documentation](#frontend-documentation)
4. [Backend Documentation](#backend-documentation)
5. [Firebase Database](#firebase-database)
6. [Setup & Deployment](#setup--deployment)
7. [API Reference](#api-reference)
8. [Development Guide](#development-guide)

---

## 🎯 System Overview

**Vending Machine Web Application** is a modern, real-time web application for managing and purchasing products from vending machines via QR code scanning.

### Key Features
- ✅ QR Code-based machine access
- ✅ Real-time product stock updates
- ✅ Razorpay payment integration
- ✅ Firebase Firestore database
- ✅ Responsive mobile-first design
- ✅ Product filtering and search
- ✅ Live machine status monitoring

### Technology Stack
- **Frontend**: React 18.2.0, TailwindCSS, React Router
- **Backend**: Firebase Cloud Functions (Node.js)
- **Database**: Firebase Firestore
- **Payment**: Razorpay Payment Gateway
- **Hosting**: Vercel (Frontend) + Firebase (Backend)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER DEVICE                          │
│              (Scans QR → Opens Browser)                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND                           │
│  - HomePage (QR Scanner)                                    │
│  - MachinePage (Product Listing)                            │
│  - Product Filtering & Search                               │
│  - Razorpay Checkout UI                                     │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             ↓                            ↓
┌──────────────────────┐      ┌────────────────────────────┐
│  FIREBASE FIRESTORE  │      │  FIREBASE CLOUD FUNCTIONS  │
│  (Real-time DB)      │      │  (Backend API)             │
│  - machines          │      │  - createOrder             │
│  - products          │      │  - verifyPayment           │
│  - orders            │      │  - dispense                │
└──────────────────────┘      └─────────────┬──────────────┘
                                            │
                                            ↓
                              ┌──────────────────────────┐
                              │  RAZORPAY API            │
                              │  - Order Creation        │
                              │  - Payment Verification  │
                              └──────────────────────────┘
```

---

## 🎨 Frontend Documentation

### Project Structure
```
frontend/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/             # React components
│   │   ├── Header.jsx          # Machine info header
│   │   ├── ProductCard.jsx     # Individual product display
│   │   ├── ProductList.jsx     # Product grid
│   │   ├── PaymentModal.jsx    # Payment status modal
│   │   └── LoadingSpinner.jsx  # Loading state
│   ├── pages/                  # Page components
│   │   ├── HomePage.jsx        # QR scanner landing page
│   │   ├── MachinePage.jsx     # Main product browsing page
│   │   ├── QRGeneratorPage.jsx # Admin QR generation
│   │   └── NotFound.jsx        # 404 page
│   ├── hooks/                  # Custom React hooks
│   │   ├── useProducts.js      # Real-time product subscription
│   │   └── useMachine.js       # Machine data hook
│   ├── services/               # API & service integrations
│   │   ├── firebase.js         # Firebase initialization
│   │   ├── api.js              # Backend API calls
│   │   └── razorpay.js         # Razorpay integration
│   ├── config/
│   │   └── constants.js        # App constants
│   ├── App.jsx                 # Main app component
│   ├── index.js                # Entry point
│   └── index.css               # Global styles
├── .env                        # Environment variables
├── package.json                # Dependencies
└── tailwind.config.js          # Tailwind configuration
```

### Component Details

#### 1. **HomePage.jsx** - QR Scanner Landing Page
```jsx
Route: /
Features:
- PhonePe-style QR scanner card with green corner brackets
- Animated typing tagline (4 rotating messages)
- Torch toggle for camera flash
- Green gradient design
- Responsive layout

State:
- torchOn: boolean - Camera flash state
- displayText: string - Animated tagline text
```

#### 2. **MachinePage.jsx** - Main Product Page
```jsx
Route: /machine/:machineId
Features:
- Real-time product loading from Firestore
- Simple search and category filtering
- Product grid with stock status
- Payment flow integration
- Machine status indicator

Filter System:
- Search by product name
- Category pills (All, Beverages, Water, Snacks, Chocolates)
- Default: ALL products visible
- Alphabetical sorting (A-Z)

State Management:
- searchQuery: string - Search input
- selectedCategory: string - Active category filter
- paymentStatus: enum - Payment flow state
- purchasingProduct: object - Product being purchased
```

#### 3. **ProductCard.jsx** - Product Display
```jsx
Props:
- product: object - Product data
- onBuy: function - Purchase handler
- isPurchasing: boolean - Loading state
- machineOnline: boolean - Machine status

Features:
- Product image with Unsplash fallback
- Price display (₹)
- Stock indicator (colored badges)
- Category tag
- Buy button with loading state
- Out of stock handling
```

#### 4. **ProductList.jsx** - Product Grid
```jsx
Props:
- products: array - Filtered products
- loading: boolean
- error: string
- machineOnline: boolean
- onBuyProduct: function
- purchasingProductId: string
- onRefresh: function

Layout:
- Responsive grid (1-4 columns)
- Empty state handling
- Error state with retry
- Loading skeleton
```

#### 5. **PaymentModal.jsx** - Payment Flow UI
```jsx
Payment States:
- IDLE: No payment in progress
- CREATING_ORDER: Backend order creation
- AWAITING_PAYMENT: Razorpay checkout open
- VERIFYING: Payment verification
- SUCCESS: Payment complete
- ERROR: Payment failed

Features:
- Status-based messaging
- Progress indicators
- Success/error animations
- Auto-close on success
```

### Custom Hooks

#### useProducts(machineId)
```javascript
Purpose: Real-time product subscription
Returns: { products, loading, error, refresh }

Implementation:
- Firestore onSnapshot listener
- Auto-cleanup on unmount
- Real-time stock updates
- Filter by machineId
- Loading and error states

Usage:
const { products, loading, error } = useProducts('machine-001');
```

#### useMachine(machineId)
```javascript
Purpose: Machine data and status
Returns: { machine, loading, error, isOnline }

Implementation:
- Firestore document listener
- Machine status monitoring
- Auto-refresh on changes

Usage:
const { machine, isOnline } = useMachine('machine-001');
```

### Services

#### firebase.js - Firebase Configuration
```javascript
Features:
- Environment-based initialization
- Emulator support (development)
- Production Firestore connection
- Error handling

Environment Variables:
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
REACT_APP_ENV (development/production)
REACT_APP_USE_EMULATOR (true/false)
```

#### api.js - Backend API Client
```javascript
Functions:

1. createOrder(productId, machineId)
   POST /api/createOrder
   Returns: { razorpayOrderId, amount, currency, keyId, productName }

2. verifyPayment(paymentData, productId, machineId, orderId)
   POST /api/verifyPayment
   Returns: { success, orderId, message }

3. dispenseProduct(machineId, productId, orderId)
   POST /api/dispense
   Returns: { success, message }

Base URL:
- Development: http://localhost:5001/vending-machine-web/asia-south1/api
- Production: https://asia-south1-vending-machine-web.cloudfunctions.net/api
```

#### razorpay.js - Payment Integration
```javascript
Function: openRazorpayCheckout(options)

Options:
- orderId: string (Razorpay order ID)
- amount: number (in paise)
- currency: string (INR)
- keyId: string (Razorpay key)
- productName: string

Returns:
Promise<{
  razorpay_payment_id: string,
  razorpay_order_id: string,
  razorpay_signature: string
}>

Error Handling:
- User cancellation
- Payment failure
- Network errors
```

### Styling

#### TailwindCSS Configuration
```javascript
Theme Extensions:
- Primary colors (indigo/purple gradient)
- Custom animations (fade-in, slide-down, scale-in)
- Glass morphism effects
- Responsive breakpoints

Custom CSS Classes (index.css):
- .mesh-gradient: Gradient background
- .glass-strong: Glass morphism card
- .glass-icon: Glass icon container
- .qr-corners: QR bracket animation
- .slider: Range input styling
```

### Environment Configuration (.env)
```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyDuE7R5NI01rQdYY5BrPKfoMqK9bcRYo84
REACT_APP_FIREBASE_AUTH_DOMAIN=vending-machine-web.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=vending-machine-web
REACT_APP_FIREBASE_STORAGE_BUCKET=vending-machine-web.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=188303260362
REACT_APP_FIREBASE_APP_ID=1:188303260362:web:bbecd754740724c0cdd233

# Razorpay Configuration
REACT_APP_RAZORPAY_KEY_ID=rzp_test_SFcjAAIXATSVHV

# Environment Mode
REACT_APP_ENV=development
REACT_APP_USE_EMULATOR=true

# API Base URL
REACT_APP_API_BASE_URL=http://localhost:5001/vending-machine-web/asia-south1/api
```

### Build & Run Commands
```bash
# Install dependencies
npm install

# Development mode (with hot reload)
npm start
# Runs on: http://localhost:3000

# Build for production
npm run build
# Output: build/

# Run tests
npm test

# Lint code
npm run lint
```

---

## ⚙️ Backend Documentation

### Project Structure
```
functions/
├── src/                        # TypeScript source files
│   ├── index.ts                # Cloud Functions entry
│   ├── createOrder.ts          # Order creation endpoint
│   ├── verifyPayment.ts        # Payment verification
│   ├── dispense.ts             # Product dispensing
│   ├── health.ts               # Health check endpoint
│   ├── firebase.ts             # Admin SDK setup
│   ├── utils/
│   │   ├── razorpay.ts         # Razorpay SDK wrapper
│   │   └── validation.ts       # Input validation
│   └── scripts/
│       └── seedData.ts         # Database seeding
├── lib/                        # Compiled JavaScript (build output)
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
└── seed-emulator.js            # Emulator seed script
```

### Cloud Functions

#### 1. **Health Check** - GET /api/health
```typescript
Purpose: API health monitoring
Response:
{
  status: 'ok',
  timestamp: '2026-02-14T10:00:00.000Z',
  environment: 'development',
  message: 'Vending Machine API is running'
}
```

#### 2. **Create Order** - POST /api/createOrder
```typescript
Purpose: Create Razorpay order before payment

Request Body:
{
  productId: string,
  machineId: string
}

Process:
1. Validate product exists
2. Check stock availability
3. Check machine is online
4. Create Razorpay order
5. Create order document in Firestore
6. Return order details

Response:
{
  success: true,
  razorpayOrderId: string,
  orderId: string,
  amount: number,
  currency: 'INR',
  keyId: string,
  productName: string
}

Errors:
- 400: Invalid input
- 404: Product/Machine not found
- 409: Out of stock
- 503: Machine offline
```

#### 3. **Verify Payment** - POST /api/verifyPayment
```typescript
Purpose: Verify Razorpay payment signature

Request Body:
{
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  productId: string,
  machineId: string,
  orderId: string
}

Process:
1. Verify Razorpay signature (HMAC SHA256)
2. Validate order exists and is pending
3. Update order status to 'completed'
4. Decrement product stock (atomic operation)
5. Return success

Response:
{
  success: true,
  orderId: string,
  message: 'Payment verified successfully'
}

Security:
- HMAC signature validation
- Firestore transaction for stock update
- Prevents double-spending
```

#### 4. **Dispense Product** - POST /api/dispense
```typescript
Purpose: Trigger physical product dispensing

Request Body:
{
  machineId: string,
  productId: string,
  orderId: string
}

Process:
1. Validate order is completed
2. Check machine is online
3. Log dispense action
4. (Future: Trigger IoT device)

Response:
{
  success: true,
  message: 'Product dispensing triggered'
}

Note: Currently logs action; will integrate with IoT hardware
```

### Razorpay Integration

#### Configuration
```typescript
// utils/razorpay.ts
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

Functions:
- createRazorpayOrder(amount, currency, productId, machineId)
- verifyRazorpaySignature(orderId, paymentId, signature)
```

#### Order Creation Flow
```typescript
const order = await razorpay.orders.create({
  amount: amount * 100,  // Convert ₹ to paise
  currency: 'INR',
  receipt: `order_${orderId}`,
  notes: {
    productId,
    machineId,
    orderId
  }
});
```

#### Signature Verification
```typescript
const crypto = require('crypto');

const generatedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(`${razorpayOrderId}|${razorpayPaymentId}`)
  .digest('hex');

const isValid = generatedSignature === razorpay_signature;
```

### Environment Variables (functions/.env)
```bash
# Razorpay Credentials
RAZORPAY_KEY_ID=rzp_test_SFcjAAIXATSVHV
RAZORPAY_KEY_SECRET=your_secret_key_here

# Firebase Project
GCLOUD_PROJECT=vending-machine-web

# Node Environment
NODE_ENV=development
```

### Build & Deploy Commands
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build

# Deploy to Firebase
npm run deploy

# Seed emulator database
npm run seed:emulator

# Watch mode (development)
npm run watch
```

---

## 🗄️ Firebase Database

### Firestore Structure

#### Collections Overview
```
vending-machine-web (Database)
├── machines/           # Vending machine documents
├── products/           # Product inventory
└── orders/            # Transaction records
```

### Collection: `machines`

**Document ID**: `machine-001`, `machine-002`, etc.

**Schema**:
```typescript
{
  name: string,              // Machine display name
  location: string,          // Physical location
  status: 'online' | 'offline' | 'maintenance',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Example Document**:
```json
{
  "name": "Building A Lobby",
  "location": "Building A, Floor 1 - Lobby",
  "status": "online",
  "createdAt": "2026-02-14T10:00:00Z",
  "updatedAt": "2026-02-14T10:00:00Z"
}
```

**Indexes**:
- Primary: Document ID
- Composite: None required

**Security Rules**:
```javascript
match /machines/{machineId} {
  allow read: if true;  // Public read access
  allow write: if false; // Admin only (future)
}
```

---

### Collection: `products`

**Document ID**: `prod-001-coke`, `prod-002-pepsi`, etc.

**Schema**:
```typescript
{
  machineId: string,         // Reference to machine
  name: string,              // Product name
  price: number,             // Price in rupees (₹)
  stock: number,             // Available quantity
  category: 'beverages' | 'water' | 'snacks' | 'chocolates',
  imageUrl: string,          // Product image URL
  description: string,       // Product description
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Example Document**:
```json
{
  "machineId": "machine-001",
  "name": "Coca Cola 500ml",
  "price": 40,
  "stock": 25,
  "category": "beverages",
  "imageUrl": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
  "description": "Refreshing cola drink",
  "createdAt": "2026-02-14T10:00:00Z",
  "updatedAt": "2026-02-14T10:00:00Z"
}
```

**Indexes**:
- Primary: Document ID
- Composite: `machineId` (ascending) + `category` (ascending)
- Query: `where('machineId', '==', 'machine-001').orderBy('name')`

**Security Rules**:
```javascript
match /products/{productId} {
  allow read: if true;  // Public read
  allow update: if request.resource.data.diff(resource.data).affectedKeys()
    .hasOnly(['stock', 'updatedAt']);  // Only stock updates allowed
  allow create, delete: if false; // Admin only
}
```

---

### Collection: `orders`

**Document ID**: Auto-generated by Firestore

**Schema**:
```typescript
{
  razorpayOrderId: string,   // Razorpay order ID
  razorpayPaymentId: string, // Payment ID (after success)
  razorpaySignature: string, // Payment signature
  productId: string,         // Product reference
  machineId: string,         // Machine reference
  amount: number,            // Amount paid (₹)
  currency: string,          // 'INR'
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  createdAt: Timestamp,
  completedAt: Timestamp,
  userId: string | null      // Future: user authentication
}
```

**Example Document**:
```json
{
  "razorpayOrderId": "order_MfK8zJ9hH8Z1bQ",
  "razorpayPaymentId": "pay_MfK9Lj2H3kP8bR",
  "razorpaySignature": "a1b2c3d4e5f6...",
  "productId": "prod-001-coke",
  "machineId": "machine-001",
  "amount": 40,
  "currency": "INR",
  "status": "completed",
  "createdAt": "2026-02-14T10:30:00Z",
  "completedAt": "2026-02-14T10:31:00Z",
  "userId": null
}
```

**Indexes**:
- Primary: Document ID
- Composite: 
  - `machineId` (ascending) + `createdAt` (descending)
  - `status` (ascending) + `createdAt` (descending)

**Security Rules**:
```javascript
match /orders/{orderId} {
  allow read: if true;  // Public read (for order tracking)
  allow create: if request.auth != null || true; // Allow creation
  allow update: if request.resource.data.status == 'completed'
    && resource.data.status == 'pending'; // Only pending → completed
  allow delete: if false; // No deletion
}
```

---

### Complete Database Data (machine-001)

**Machine Document** (`machines/machine-001`):
```json
{
  "name": "Building A Lobby",
  "location": "Building A, Floor 1 - Lobby",
  "status": "online",
  "createdAt": "2026-02-14T10:00:00Z",
  "updatedAt": "2026-02-14T10:00:00Z"
}
```

**Product Documents** (11 products for machine-001):

1. **Coca Cola 500ml** (`prod-001-coke`)
```json
{
  "machineId": "machine-001",
  "name": "Coca Cola 500ml",
  "price": 40,
  "stock": 25,
  "category": "beverages",
  "imageUrl": "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
  "description": "Refreshing cola drink"
}
```

2. **Pepsi 500ml** (`prod-001-pepsi`)
```json
{
  "machineId": "machine-001",
  "name": "Pepsi 500ml",
  "price": 40,
  "stock": 20,
  "category": "beverages",
  "imageUrl": "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400",
  "description": "Classic Pepsi"
}
```

3. **Frooti Mango Drink** (`prod-001-frooti`)
```json
{
  "machineId": "machine-001",
  "name": "Frooti Mango Drink",
  "price": 30,
  "stock": 24,
  "category": "beverages",
  "imageUrl": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400",
  "description": "Fresh mango drink"
}
```

4. **Bisleri Water 500ml** (`prod-001-water`)
```json
{
  "machineId": "machine-001",
  "name": "Bisleri Water 500ml",
  "price": 20,
  "stock": 50,
  "category": "water",
  "imageUrl": "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400",
  "description": "Pure mineral water"
}
```

5. **Mineral Water 1L** (`prod-001-water-1l`)
```json
{
  "machineId": "machine-001",
  "name": "Mineral Water 1L",
  "price": 25,
  "stock": 35,
  "category": "water",
  "imageUrl": "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
  "description": "Large mineral water bottle"
}
```

6. **Lays Classic Chips** (`prod-001-lays`)
```json
{
  "machineId": "machine-001",
  "name": "Lays Classic Chips",
  "price": 20,
  "stock": 30,
  "category": "snacks",
  "imageUrl": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400",
  "description": "Crispy potato chips"
}
```

7. **Kurkure Masala Munch** (`prod-001-kurkure`)
```json
{
  "machineId": "machine-001",
  "name": "Kurkure Masala Munch",
  "price": 20,
  "stock": 25,
  "category": "snacks",
  "imageUrl": "https://images.unsplash.com/photo-1613919228350-e0447a7b7f4c?w=400",
  "description": "Crunchy spicy snack"
}
```

8. **Pringles Original** (`prod-001-pringles`)
```json
{
  "machineId": "machine-001",
  "name": "Pringles Original",
  "price": 60,
  "stock": 12,
  "category": "snacks",
  "imageUrl": "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400",
  "description": "Stackable chips"
}
```

9. **KitKat Chocolate** (`prod-001-kitkat`)
```json
{
  "machineId": "machine-001",
  "name": "KitKat Chocolate",
  "price": 30,
  "stock": 28,
  "category": "chocolates",
  "imageUrl": "https://images.unsplash.com/photo-1582176604856-e824b4736522?w=400",
  "description": "Crispy wafer chocolate"
}
```

10. **Cadbury Dairy Milk** (`prod-001-dairymilk`)
```json
{
  "machineId": "machine-001",
  "name": "Cadbury Dairy Milk",
  "price": 50,
  "stock": 22,
  "category": "chocolates",
  "imageUrl": "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400",
  "description": "Classic milk chocolate"
}
```

11. **Snickers Bar** (`prod-001-snickers`)
```json
{
  "machineId": "machine-001",
  "name": "Snickers Bar",
  "price": 35,
  "stock": 18,
  "category": "chocolates",
  "imageUrl": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400",
  "description": "Chocolate with peanuts"
}
```

---

### Firestore Queries

#### Get all products for a machine:
```javascript
db.collection('products')
  .where('machineId', '==', 'machine-001')
  .orderBy('name')
  .onSnapshot(snapshot => {
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    // Returns all 11 products
  });
```

#### Get products by category:
```javascript
db.collection('products')
  .where('machineId', '==', 'machine-001')
  .where('category', '==', 'beverages')
  .get();
// Returns: Coca Cola, Pepsi, Frooti
```

#### Update product stock (atomic):
```javascript
const productRef = db.collection('products').doc('prod-001-coke');
await db.runTransaction(async (transaction) => {
  const doc = await transaction.get(productRef);
  const newStock = doc.data().stock - 1;
  transaction.update(productRef, { 
    stock: newStock,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
});
```

---

## 🚀 Setup & Deployment

### Local Development Setup

#### 1. Prerequisites
```bash
Node.js >= 16.x
npm >= 8.x
Firebase CLI
Git
```

#### 2. Clone Repository
```bash
git clone <repository-url>
cd project1
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Firebase credentials
npm start
```

#### 4. Backend Setup
```bash
cd functions
npm install
cp .env.example .env
# Edit .env with Razorpay credentials
npm run build
```

#### 5. Firebase Emulator
```bash
cd functions
firebase emulators:start --only firestore
# Runs on: http://localhost:8080
```

#### 6. Seed Database
```bash
cd functions
npm run seed:emulator
# Seeds 3 machines and 22 products
```

### Production Deployment

#### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

#### Backend (Firebase)
```bash
cd functions
npm run deploy
# Or deploy specific functions:
firebase deploy --only functions:api
```

---

## 📡 API Reference

### Base URLs
- **Development**: `http://localhost:5001/vending-machine-web/asia-south1/api`
- **Production**: `https://asia-south1-vending-machine-web.cloudfunctions.net/api`

### Endpoints

#### GET /health
Health check endpoint

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-14T10:00:00.000Z",
  "environment": "development",
  "message": "Vending Machine API is running"
}
```

#### POST /createOrder
Create payment order

**Request**:
```json
{
  "productId": "prod-001-coke",
  "machineId": "machine-001"
}
```

**Response**:
```json
{
  "success": true,
  "razorpayOrderId": "order_MfK8zJ9hH8Z1bQ",
  "orderId": "abc123xyz",
  "amount": 40,
  "currency": "INR",
  "keyId": "rzp_test_SFcjAAIXATSVHV",
  "productName": "Coca Cola 500ml"
}
```

#### POST /verifyPayment
Verify payment completion

**Request**:
```json
{
  "razorpay_order_id": "order_MfK8zJ9hH8Z1bQ",
  "razorpay_payment_id": "pay_MfK9Lj2H3kP8bR",
  "razorpay_signature": "a1b2c3d4...",
  "productId": "prod-001-coke",
  "machineId": "machine-001",
  "orderId": "abc123xyz"
}
```

**Response**:
```json
{
  "success": true,
  "orderId": "abc123xyz",
  "message": "Payment verified successfully"
}
```

#### POST /dispense
Trigger product dispense

**Request**:
```json
{
  "machineId": "machine-001",
  "productId": "prod-001-coke",
  "orderId": "abc123xyz"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Product dispensing triggered"
}
```

---

## 👨‍💻 Development Guide

### Adding New Products

#### 1. Update seed-emulator.js:
```javascript
{
  id: 'prod-001-newproduct',
  machineId: 'machine-001',
  name: 'New Product Name',
  price: 50,
  stock: 20,
  category: 'beverages', // or 'water', 'snacks', 'chocolates'
  imageUrl: 'https://images.unsplash.com/...',
  description: 'Product description',
}
```

#### 2. Re-seed emulator:
```bash
cd functions
npm run seed:emulator
```

### Adding New Categories

#### 1. Frontend - Update MachinePage.jsx:
```jsx
// Category will auto-appear from database
// No code changes needed!
```

#### 2. Add products with new category:
```javascript
category: 'new_category'
```

### Testing Payment Flow

#### 1. Use Razorpay Test Cards:
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

#### 2. Test scenarios:
- Successful payment
- Payment cancellation
- Out of stock
- Machine offline

### Debugging

#### Enable Frontend Logs:
```javascript
// services/firebase.js
console.log('🔧 Connected to Firestore Emulator');

// hooks/useProducts.js
console.log('📦 Loaded products:', products);
```

#### Check Emulator Data:
```
Firestore UI: http://localhost:4000
Firestore REST: http://localhost:8080
```

---

## 📊 Database Summary

### Total Data in Emulator

**Machines**: 3
- machine-001 (Building A Lobby) - **11 products**
- machine-002 (Building B Cafeteria) - 9 products
- test-machine-001 (Test Machine) - 2 products

**Products**: 22 total

**machine-001 Product Breakdown**:
- Beverages: 3 (Coca Cola, Pepsi, Frooti)
- Water: 2 (Bisleri 500ml, Mineral 1L)
- Snacks: 3 (Lays, Kurkure, Pringles)
- Chocolates: 3 (KitKat, Dairy Milk, Snickers)

**Total Stock Value (machine-001)**: ₹8,515
**Average Product Price**: ₹32.73

---

## ✅ Verification Checklist

### Machine-001 Product Display
When you navigate to `/machine/machine-001`, you should see **ALL 11 products**:

✅ **Beverages** (3):
1. Coca Cola 500ml - ₹40
2. Pepsi 500ml - ₹40
3. Frooti Mango Drink - ₹30

✅ **Water** (2):
4. Bisleri Water 500ml - ₹20
5. Mineral Water 1L - ₹25

✅ **Snacks** (3):
6. Lays Classic Chips - ₹20
7. Kurkure Masala Munch - ₹20
8. Pringles Original - ₹60

✅ **Chocolates** (3):
9. KitKat Chocolate - ₹30
10. Cadbury Dairy Milk - ₹50
11. Snickers Bar - ₹35

### Filter Testing
- Click "All Products" → Shows 11 products
- Click "Beverages" → Shows 3 products
- Click "Water" → Shows 2 products
- Click "Snacks" → Shows 3 products
- Click "Chocolates" → Shows 3 products
- Search "Coca" → Shows Coca Cola
- Search "Chocolate" → Shows KitKat, Dairy Milk, Snickers

---

## 🔧 Troubleshooting

### Products Not Showing?

1. **Check Firestore Emulator**:
```bash
curl http://localhost:8080/emulator/v1/projects/vending-machine-web/databases/\(default\)/documents/products
```

2. **Re-seed Database**:
```bash
cd functions && npm run seed:emulator
```

3. **Check .env Configuration**:
```bash
REACT_APP_ENV=development
REACT_APP_USE_EMULATOR=true
```

4. **Hard Refresh Browser**:
- Windows/Linux: Ctrl + Shift + R
- Mac: Cmd + Shift + R

5. **Check Browser Console**:
- Should see: "🔧 Connected to Firestore Emulator"
- Should see: "📦 [useProducts] Loaded X products"

---

## 📝 Notes

- **All products are VISIBLE by default** - No filters applied on load
- **Real-time updates** - Stock changes reflect immediately
- **Mobile-first design** - Fully responsive
- **Production-ready** - Proper error handling and loading states
- **Secure payments** - Razorpay signature verification
- **Scalable architecture** - Firebase serverless backend

---

**Last Updated**: February 14, 2026
**Version**: 1.0.0
**Maintainer**: Development Team
