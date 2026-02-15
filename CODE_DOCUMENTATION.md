# 📚 QR-Based Vending Machine System - Code Documentation

## 🌟 Project Overview

This is a **production-ready, full-stack QR-based vending machine system** built with React frontend and Firebase backend. The system enables contactless purchasing through QR code scanning, real-time inventory management, and secure payment processing using Razorpay.

---

## 🏗️ Architecture Summary

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

---

## 📁 Project Structure Breakdown

### Frontend (`frontend/`)
- **React 18** with functional components and hooks
- **Tailwind CSS** for styling with glassmorphism effects
- **React Router** for navigation
- **Firebase SDK** for real-time data
- **Razorpay Integration** for payments

### Backend (`functions/`)
- **Firebase Cloud Functions** (TypeScript)
- **Express.js** for API routing
- **Razorpay API** for payment processing
- **Firestore** for database operations

---

## 🧩 Frontend Code Analysis

### 1. **Application Entry Point**

#### `App.jsx` - Main Application Router
```jsx
/**
 * Purpose: Application routing and global configuration
 * Key Features:
 * - Route definition for QR-scanned machine pages
 * - Global toast notification setup with glassmorphism styling
 * - CORS-friendly routing structure
 */
```

**Main Routes:**
- `/machine/:machineId` → `MachinePage` (main vending interface)
- `/` → `HomePage` (QR scanner landing page)
- `*` → `NotFound` (404 page)

**Key Code Block:**
```jsx
<Toaster
  position="top-center"
  toastOptions={{
    style: {
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)', // Glassmorphism effect
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
    }
  }}
/>
```

---

### 2. **Landing Page with QR Scanner**

#### `HomePage.jsx` - Premium Landing Experience
```jsx
/**
 * Purpose: Modern fintech-style landing page with built-in QR scanner
 * Key Features:
 * - Animated typing text effect for taglines
 * - QR scanner with torch/flashlight support
 * - Glassmorphism card design
 * - Intersection Observer for scroll animations
 */
```

**Critical Code Blocks:**

**🎯 QR Code Processing:**
```jsx
const handleScan = useCallback((result) => {
  if (result && !scanProcessedRef.current) {
    scanProcessedRef.current = true;
    
    // Extract machine ID from QR URL
    const urlMatch = result.text.match(/\/machine\/([^\/\?]+)/);
    if (urlMatch) {
      const machineId = urlMatch[1];
      navigate(`/machine/${machineId}`);
    } else {
      toast.error('Invalid QR code format');
    }
  }
}, [navigate]);
```

**🔦 Torch Control:**
```jsx
const toggleTorch = useCallback(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    });
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities?.();
    
    if (capabilities?.torch) {
      await track.applyConstraints({ 
        advanced: [{ torch: !torchOn }] 
      });
      setTorchOn(!torchOn);
    }
  } catch (error) {
    toast.error('Could not toggle torch');
  }
}, [torchOn]);
```

**✨ Typing Animation Effect:**
```jsx
// Cycles through marketing taglines with typewriter effect
const taglines = [
  'Scan. Pay. Collect. It\'s that simple.',
  'Contactless vending, powered by QR.',
  'Real-time stock. Instant checkout.',
  'Your smart vending companion.',
];

useEffect(() => {
  // Complex state machine for typing/deleting animation
  if (!isDeleting && displayed.length < current.length) {
    timeout = setTimeout(() => 
      setDisplayed(current.slice(0, displayed.length + 1)), 50);
  } else if (isDeleting && displayed.length > 0) {
    timeout = setTimeout(() => 
      setDisplayed(current.slice(0, displayed.length - 1)), 30);
  }
}, [displayed, isDeleting, taglineIndex]);
```

---

### 3. **Main Vending Interface**

#### `MachinePage.jsx` - Core Product Purchasing Interface
```jsx
/**
 * Purpose: Main vending machine interface accessed via QR scan
 * URL Pattern: /machine/:machineId
 * 
 * Features:
 * - Real-time product listing with stock updates
 * - Advanced filtering and search
 * - Secure payment flow integration
 * - Machine status monitoring
 */
```

**🔄 Real-time Data Loading:**
```jsx
const { machineId } = useParams(); // Extract from URL
const { machine, loading: machineLoading } = useMachine(machineId);
const { products, loading: productsLoading } = useProducts(machineId);

// Filtered products based on search and category
const filteredProducts = useMemo(() => {
  return products.filter(product => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
}, [products, searchQuery, selectedCategory]);
```

**🛒 Purchase Flow Initiation:**
```jsx
const handleBuyProduct = useCallback(async (product) => {
  if (!product || product.stock === 0) return;
  
  setSelectedProduct(product);
  setPurchasing(true);
  
  try {
    // Step 1: Create order with backend
    const orderData = await createOrder(product.id, machineId);
    
    if (orderData.success) {
      setPaymentModal({
        isOpen: true,
        orderData,
        status: PAYMENT_STATUS.CREATED
      });
    }
  } catch (error) {
    toast.error(error.message || 'Failed to create order');
    setPurchasing(false);
  }
}, [machineId]);
```

---

### 4. **Real-time Data Management**

#### `useProducts.js` - Real-time Product Subscription Hook
```jsx
/**
 * Purpose: Firebase Firestore real-time subscription for product data
 * Key Features:
 * - Live stock updates across all connected users
 * - Automatic cleanup to prevent memory leaks
 * - Stock change detection for UI animations
 */
```

**🔥 Firestore Real-time Listener:**
```jsx
const productsQuery = query(
  collection(db, 'products'),
  where('machineId', '==', machineId)
);

// Real-time subscription
const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
  const updatedProducts = [];
  const newStockValues = {};

  snapshot.forEach((doc) => {
    const productData = { id: doc.id, ...doc.data() };
    updatedProducts.push(productData);
    newStockValues[doc.id] = productData.stock;
  });

  // Detect stock changes for animations
  updatedProducts.forEach((product) => {
    const prevStock = previousStock[product.id];
    if (prevStock !== undefined && prevStock !== product.stock) {
      product._stockChanged = true; // Flag for UI animation
    }
  });

  setProducts(updatedProducts);
  setPreviousStock(newStockValues);
  setLoading(false);
});

// Cleanup subscription on unmount
return () => unsubscribe();
```

---

### 5. **Backend API Communication**

#### `api.js` - Backend Service Layer
```jsx
/**
 * Purpose: HTTP client for Firebase Cloud Functions
 * Features:
 * - Typed request/response interfaces
 * - Error handling and logging
 * - Environment-based URL configuration
 */
```

**📡 Order Creation API:**
```javascript
export const createOrder = async (productId, machineId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/createOrder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, machineId })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create order');
    }
    
    return data; // Contains Razorpay order details
  } catch (error) {
    console.error('❌ [API] Error creating order:', error);
    throw error;
  }
};
```

**✅ Payment Verification API:**
```javascript
export const verifyPayment = async (paymentData, productId, machineId, internalOrderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verifyPayment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...paymentData, // Razorpay signature, payment ID, order ID
        productId,
        machineId,
        internalOrderId
      })
    });

    const data = await response.json();
    return data; // Contains success/failure status
  } catch (error) {
    throw error;
  }
};
```

---

### 6. **UI Components**

#### `ProductCard.jsx` - Glassmorphism Product Display
```jsx
/**
 * Purpose: Individual product display with modern UI
 * Features:
 * - Glassmorphism visual effects
 * - Stock status indicators with color coding
 * - Animation triggers for stock changes
 * - Responsive image handling
 */
```

**🎨 Dynamic Stock Status:**
```jsx
const getStockStatus = (stock) => {
  if (stock === 0) {
    return {
      label: 'Out of Stock',
      className: 'stock-indicator text-red-500',
      dotColor: 'bg-red-500',
      bgStyle: { 
        background: 'rgba(239,68,68,0.08)', 
        border: '1px solid rgba(239,68,68,0.15)' 
      }
    };
  }
  if (stock <= STOCK_THRESHOLDS.CRITICAL) {
    return {
      label: `Only ${stock} left!`,
      className: 'stock-indicator stock-critical',
      dotColor: 'bg-red-400',
      bgStyle: { 
        background: 'rgba(239,68,68,0.06)', 
        border: '1px solid rgba(239,68,68,0.12)' 
      }
    };
  }
  // ... more conditions
};
```

**⚡ Stock Change Animation:**
```jsx
useEffect(() => {
  if (_stockChanged) {
    setShowAnimation(true);
    const timer = setTimeout(() => setShowAnimation(false), 1000);
    return () => clearTimeout(timer);
  }
}, [_stockChanged, stock]);

// CSS class triggers flash animation
<div className={`product-card ${showAnimation ? 'flash-update' : ''}`}>
```

---

## 🔧 Backend Code Analysis

### 1. **Firebase Cloud Functions Entry Point**

#### `index.ts` - Express Server Setup
```typescript
/**
 * Purpose: Main Cloud Functions entry point with Express routing
 * Features:
 * - CORS configuration for cross-origin requests
 * - Route handlers for all API endpoints
 * - Environment-based security controls
 */
```

**🌍 CORS Configuration:**
```typescript
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',')
  : [];

const corsOptions: cors.CorsOptions = {
  origin: process.env.NODE_ENV === 'production' && allowedOrigins.length > 0
    ? allowedOrigins  // Restricted origins in production
    : true,           // Allow all origins in development
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
```

**🛣️ API Route Setup:**
```typescript
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', healthCheckHandler);

// Order management endpoints
app.post('/createOrder', createOrderHandler);
app.post('/verifyPayment', verifyPaymentHandler);

// Machine communication endpoint
app.post('/dispense', dispenseHandler);

// Export as Firebase Function
export const api = functions
  .region('asia-south1')
  .https
  .onRequest(app);
```

---

### 2. **Order Creation Logic**

#### `createOrder.ts` - Razorpay Order Generation
```typescript
/**
 * Purpose: Creates Razorpay orders for product purchases
 * Security Features:
 * - Input validation for all parameters
 * - Stock availability checking
 * - Machine-product relationship verification
 * - Atomic order creation in Firestore
 */
```

**🔍 Input Validation:**
```typescript
const validation = validateCreateOrderInput(req.body);
if (!validation.isValid) {
  logValidationError('createOrder', validation.error!, req.body);
  res.status(400).json({
    success: false,
    error: validation.error,
  });
  return;
}

const { productId, machineId } = req.body;
```

**📦 Product and Stock Verification:**
```typescript
// Fetch product from Firestore
const productRef = db.collection('products').doc(productId);
const productDoc = await productRef.get();

if (!productDoc.exists) {
  res.status(404).json({
    success: false,
    error: 'Product not found',
  });
  return;
}

const product = productDoc.data() as Product;

// Verify product belongs to the machine
if (product.machineId !== machineId) {
  res.status(400).json({
    success: false,
    error: 'Product not available in this machine',
  });
  return;
}

// Check stock availability
if (product.stock === 0) {
  res.status(400).json({
    success: false,
    error: 'Product out of stock',
  });
  return;
}
```

**💳 Razorpay Order Creation:**
```typescript
// Create Razorpay order
const razorpayOrder = await createRazorpayOrder(
  product.price * 100, // Convert rupees to paise
  `order_${Date.now()}_${productId}`,
  {
    productId,
    machineId,
    productName: product.name,
  }
);

// Create internal order in Firestore
const orderRef = await db.collection('orders').add({
  productId,
  machineId,
  productName: product.name,
  amount: product.price * 100, // Amount in paise
  currency: 'INR',
  razorpayOrderId: razorpayOrder.id,
  paymentStatus: 'pending',
  createdAt: FieldValue.serverTimestamp(),
});

return {
  success: true,
  orderId: orderRef.id,
  razorpayOrderId: razorpayOrder.id,
  amount: razorpayOrder.amount,
  currency: razorpayOrder.currency,
  keyId: getRazorpayKeyId(),
  productName: product.name,
};
```

---

### 3. **Payment Verification & Stock Management**

#### `verifyPayment.ts` - Critical Security Function
```typescript
/**
 * Purpose: MOST CRITICAL FUNCTION - Verifies payments and updates stock
 * Security Features:
 * - Razorpay signature verification (prevents fraud)
 * - Atomic Firestore transactions (prevents race conditions)
 * - Double-purchase prevention
 * - Negative stock protection
 */
```

**🔐 Payment Signature Verification:**
```typescript
// Extract Razorpay payment data
const {
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  productId,
  machineId,
  internalOrderId,
} = req.body;

// CRITICAL: Verify Razorpay signature using secret key
const isValidPayment = verifyPaymentSignature({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
});

if (!isValidPayment) {
  functions.logger.error('Payment signature verification failed', {
    razorpayOrderId: razorpay_order_id,
  });
  
  res.status(400).json({
    success: false,
    error: 'Payment verification failed',
  });
  return;
}
```

**⚛️ Atomic Stock Update Transaction:**
```typescript
/**
 * CRITICAL SECTION: Atomic transaction prevents race conditions
 * Multiple users can't buy the last item simultaneously
 */
await db.runTransaction(async (transaction) => {
  // Read current product data
  const productRef = db.collection('products').doc(productId);
  const productDoc = await transaction.get(productRef);
  
  if (!productDoc.exists) {
    throw new Error('Product not found');
  }
  
  const currentProduct = productDoc.data() as Product;
  
  // Verify stock availability
  if (currentProduct.stock === 0) {
    throw new Error('Product out of stock');
  }
  
  // ATOMIC OPERATIONS:
  // 1. Reduce stock by 1
  transaction.update(productRef, {
    stock: currentProduct.stock - 1,
    lastSold: FieldValue.serverTimestamp(),
  });
  
  // 2. Update order status to success
  const orderRef = db.collection('orders').doc(internalOrderId);
  transaction.update(orderRef, {
    paymentStatus: 'success',
    razorpayPaymentId: razorpay_payment_id,
    paymentVerifiedAt: FieldValue.serverTimestamp(),
  });
});

res.json({
  success: true,
  orderId: internalOrderId,
  message: 'Payment verified and stock updated',
});
```

---

### 4. **Database Configuration**

#### `firebase.ts` - Firebase Admin Setup
```typescript
/**
 * Purpose: Centralized Firebase Admin SDK initialization
 * Features:
 * - Singleton pattern (prevents multiple initializations)
 * - Firestore database instance export
 * - Field value operations for timestamps/increments
 */
```

**🔥 Firebase Admin Initialization:**
```typescript
import * as admin from 'firebase-admin';
import { FieldValue as FirestoreFieldValue } from '@google-cloud/firestore';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export Firestore instance for database operations
export const db = admin.firestore();

// Export FieldValue for timestamp and increment operations
export const FieldValue = FirestoreFieldValue;

// Usage examples:
// FieldValue.serverTimestamp() - for created/updated timestamps
// FieldValue.increment(-1) - for atomic stock decrements
```

---

## 🔧 Configuration & Constants

### `constants.js` - Application Configuration
```javascript
/**
 * Purpose: Central configuration management
 * Features:
 * - Environment-based API URLs
 * - Payment simulation toggle for development
 * - Razorpay configuration
 * - Stock threshold definitions
 */
```

**🌍 Environment Configuration:**
```javascript
// Backend API URL (development vs production)
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  'http://localhost:5001/vending-machine-web/asia-south1/api';

// Payment simulation for local development
export const ENABLE_PAYMENT_SIMULATION = 
  process.env.REACT_APP_ENABLE_PAYMENT_SIMULATION === 'true';

// Razorpay public key (safe for frontend)
export const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || '';
```

**📊 Business Logic Constants:**
```javascript
// Stock level thresholds for UI indicators
export const STOCK_THRESHOLDS = {
  CRITICAL: 2,  // "Only 2 left!" warning
  LOW: 5,       // "Low stock" warning
  NORMAL: 6     // Regular stock display
};

// Error messages for consistent UX
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  OUT_OF_STOCK: 'This item is currently out of stock.',
  INVALID_QR: 'Invalid QR code. Please scan a valid machine QR.',
};
```

---

## 🔄 Data Flow Explanation

### 1. **QR Code Scan → Product Page Flow**
```
1. User scans QR code on vending machine
2. QR contains URL: https://yourapp.com/machine/MACHINE_001
3. React Router extracts machineId from URL
4. MachinePage component loads with machineId
5. useMachine() hook fetches machine details from Firestore
6. useProducts() hook subscribes to real-time product updates
7. User sees live product list with current stock
```

### 2. **Purchase Flow**
```
1. User clicks "Buy" on a product
2. Frontend calls createOrder(productId, machineId)
3. Backend validates product exists and has stock
4. Backend creates Razorpay order
5. Frontend opens Razorpay checkout modal
6. User completes payment
7. Frontend calls verifyPayment() with payment details
8. Backend verifies Razorpay signature
9. Backend atomically reduces stock in Firestore
10. All connected users see stock update in real-time
11. Machine receives dispense command
```

### 3. **Real-time Stock Updates**
```
1. Any stock change in Firestore triggers onSnapshot listeners
2. useProducts() hook receives updated data instantly
3. Component re-renders with new stock values
4. UI shows animation for changed stock
5. Out-of-stock products automatically disable purchase buttons
```

---

## 🔒 Security Features

### **Frontend Security**
- Input validation on all user inputs
- Environment-based API URL configuration
- Secure token handling for Razorpay
- XSS prevention through proper data sanitization

### **Backend Security**
- **Razorpay signature verification** (prevents payment fraud)
- **Input validation** on all API endpoints
- **CORS restrictions** for production environments
- **Atomic transactions** to prevent race conditions
- **Stock verification** before every operation

### **Database Security**
- Firestore security rules (not shown in code but implied)
- Server-side timestamps to prevent client manipulation
- Transaction-based stock updates

---

## 🚀 Performance Optimizations

### **Frontend Optimizations**
- React.memo and useMemo for expensive computations
- Image lazy loading in ProductCard
- Debounced search input
- Efficient re-rendering with proper dependency arrays

### **Backend Optimizations**
- Connection pooling in Firebase Admin
- Minimal data fetching (only required fields)
- Proper error handling to prevent crashes
- Logging for debugging and monitoring

---

## 🧪 Testing & Development Features

### **Payment Simulation**
```javascript
// For local development without real money
if (ENABLE_PAYMENT_SIMULATION) {
  // Mock successful payment
  return { success: true, mockPayment: true };
}
```

### **Development Tools**
- Comprehensive console logging
- Toast notifications for user feedback
- Error boundary handling
- Hot reloading for development

---

## 📱 Mobile-First Design

### **Responsive Features**
- Touch-friendly button sizes (44px minimum)
- QR scanner optimized for mobile cameras
- Glassmorphism effects that work on all devices
- Progressive Web App (PWA) ready

### **User Experience**
- One-handed operation support
- Clear visual feedback for all actions
- Accessible color contrasts
- Loading states for all operations

---

This documentation covers all the main code blocks and their functionality. The system is built with production-ready patterns, security best practices, and modern development techniques. Each component has a specific purpose and works together to create a seamless vending machine experience.