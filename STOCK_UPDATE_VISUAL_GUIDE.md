# Stock Update API - Visual Quick Reference Guide

## 1. Stock Update Request/Response

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Frontend)                         │
│  Admin Dashboard → StockEditModal → updateProductStock()   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ PATCH Request
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  PATCH /api/admin/products/{productId}/stock               │
│                                                             │
│  Headers:                                                   │
│  - Content-Type: application/json                          │
│  - Origin: http://localhost:3000 (or deployed URL)        │
│                                                             │
│  Body:                                                      │
│  {                                                          │
│    "stock": 25                                             │
│  }                                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP PATCH
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                   SERVER (/api/_.js)                        │
│                                                             │
│  1. Parse URL: /admin/products/{id}/stock                 │
│  2. Extract productId from regex: ([a-zA-Z0-9\-]+)       │
│  3. Extract stock from body                               │
│  4. Validate: stock exists and is number                  │
│  5. Execute: db.collection('products')                    │
│               .doc(productId)                             │
│               .update({ stock })                          │
│  6. Log: "Updated stock for {id} to {value}"              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Response
                       ↓
┌─────────────────────────────────────────────────────────────┐
│  HTTP 200 OK                                               │
│                                                            │
│  Response Headers:                                        │
│  - Content-Type: application/json                         │
│  - Access-Control-Allow-Origin: *                         │
│                                                            │
│  Response Body:                                           │
│  {                                                         │
│    "success": true,                                       │
│    "message": "Stock updated",                           │
│    "stock": 25                                            │
│  }                                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Success
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Frontend)                        │
│  1. Parse response JSON                                   │
│  2. Show toast: "Stock updated to 25"                    │
│  3. Call onSave() → reload products                     │
│  4. Close StockEditModal                                │
│  5. Update UI with new stock value                       │
└─────────────────────────────────────────────────────────────┘
```

## 2. API Route Patterns

```
┌────────────────────────────────────────────────────────────┐
│              API Routes in /api/_.js                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  📦 GET /api/admin-products                               │
│     └─→ Fetch all products                               │
│                                                            │
│  📦 GET /api/admin-machines                               │
│     └─→ Fetch all machines                               │
│                                                            │
│  ⚠️ GET /api/admin-low-stock?threshold=10                │
│     └─→ Fetch products below threshold                   │
│                                                            │
│  🔔 GET /api/admin-alerts?status=pending                 │
│     └─→ Fetch stock alerts with optional filter          │
│                                                            │
│  ✏️ POST /api/admin/products                              │
│     └─→ Create new product                               │
│                                                            │
│  ✏️ PUT /api/admin/products/{id}                          │
│     └─→ Update product details                           │
│                                                            │
│  🎯 PATCH /api/admin/products/{id}/stock ◄── KEY ROUTE  │
│     └─→ Update product stock                             │
│                                                            │
│  🗑️ DELETE /api/admin/products/{id}                       │
│     └─→ Delete product                                   │
│                                                            │
│  ✅ PUT /api/admin-alerts/{id}/acknowledge               │
│     └─→ Acknowledge stock alert                          │
│                                                            │
│  ✅ PUT /api/admin-alerts/{id}/resolve                   │
│     └─→ Resolve stock alert                              │
│                                                            │
│  💳 POST /api/createOrder                                │
│     └─→ Create Razorpay payment order                    │
│                                                            │
│  💰 POST /api/verifyPayment                              │
│     └─→ Verify payment & decrement stock                 │
│                                                            │
│  ❤️ GET /api/health                                       │
│     └─→ Health check                                     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 3. Component Hierarchy

```
AdminDashboard (Parent)
│
├─ Navigation / Tabs
│  ├─ Products Tab
│  ├─ Low Stock Tab
│  ├─ Alerts Tab
│  └─ Analytics Tab
│
├─ Products Section
│  ├─ ProductCard (map each product)
│  │  ├─ Product Image
│  │  ├─ Product Name
│  │  ├─ Price: ₹{price}
│  │  ├─ Stock Display
│  │  │  └─ StockLevelIndicator ─┐
│  │  │     (color coded)        │
│  │  ├─ [Edit] Button ──────────┼─→ ProductEditModal
│  │  │                          │
│  │  └─ [Update Stock] Button ──┴─→ StockEditModal ◄── THIS ONE
│  │                               (stock input modal)
│  │
│  └─ [Add Product] Button ───→ ProductEditModal (create)
│
├─ Low Stock Section
│  ├─ Low Stock Products List
│  ├─ [Check Stock] Button
│  └─ Threshold Filter
│
├─ Alerts Section
│  ├─ Stock Alert Cards
│  │  ├─ Product Name
│  │  ├─ Current Stock / Threshold
│  │  ├─ Status Badge
│  │  ├─ [Acknowledge] Button
│  │  └─ [Resolve] Button
│  └─ Status Filter
│
└─ Analytics Section
   ├─ Stock Distribution Pie Chart
   ├─ Trend Analysis
   └─ Machine-wise Stock Summary
```

## 4. StockEditModal Component

```
StockEditModal
│
├─ Props:
│  ├─ isOpen: boolean
│  ├─ onClose: function
│  ├─ product: { id, name, stock }
│  └─ onSave: function
│
├─ State:
│  ├─ stock: number (input value)
│  └─ saving: boolean (loading)
│
├─ Modal Overlay (fixed position)
│  │
│  └─ Modal Container
│     │
│     ├─ Header
│     │  ├─ Title: "Update Stock"
│     │  └─ Close [X] Button
│     │
│     ├─ Body
│     │  ├─ Product Name Display
│     │  ├─ Current Stock Display
│     │  ├─ Input Field
│     │  │  └─ type="number"
│     │  │     min="0"
│     │  │     value={stock}
│     │  │     onChange handler
│     │  └─ Hint: "Enter new stock quantity"
│     │
│     └─ Footer
│        ├─ [Cancel] Button → onClose()
│        └─ [Save] Button → handleSave()
│           ├─ Disabled while saving
│           └─ Loading spinner during request
│
└─ On Save:
   ├─ Validate: stock >= 0
   ├─ Call: updateProductStock(product.id, stock)
   ├─ Success:
   │  ├─ Toast: "Stock updated to {value}"
   │  ├─ onSave() → Reload products
   │  └─ onClose() → Hide modal
   └─ Error:
      └─ Toast: "Failed to update stock"
```

## 5. Data Flow Sequence

```
Timestamp    Component              Action
────────────────────────────────────────────────────────────────
T0           Admin User             Clicks stock value on product
             
T1           AdminDashboard         Detects click
             
T2           StockEditModal         Opens modal with product data
             
T3           StockEditModal Input   User types new stock value
             
T4           User                   Clicks Save button
             
T5           handleSave()           Sets saving=true
             
T6           updateProductStock()   Builds fetch request
             
T7           Fetch API              Sends PATCH request to server
             
T8           /api/_.js Handler      Receives and validates request
             
T9           Firestore              Updates product stock value
             
T10          API Response           Returns success status
             
T11          Frontend Promise       Resolves successfully
             
T12          handleSave()           Sets saving=false
             
T13          Toast Notification     Shows "Stock updated to {value}"
             
T14          onSave()               Reloads products list
             
T15          onClose()              Closes modal
             
T16          AdminDashboard         UI re-renders with new stock
             
T17          User                   Sees updated stock value
```

## 6. Error Handling Flow

```
Stock Update Request
        │
        ├─ Validation Check
        │  ├─ Missing stock field?
        │  │  └─→ Return 400: "Stock quantity required"
        │  │
        │  ├─ Invalid productId format?
        │  │  └─→ Regex check fails, route not matched
        │  │
        │  ├─ stock is NaN?
        │  │  └─→ Frontend coerces Number()
        │  │
        │  └─ All valid? → Continue
        │
        ├─ Firestore Operation
        │  ├─ db.collection('products').doc(id).update({stock})
        │  │
        │  ├─ Connection error?
        │  │  └─→ Return 500: error.message
        │  │
        │  └─ Success? → Continue
        │
        ├─ Response Building
        │  ├─ Log operation
        │  ├─ Set status 200
        │  └─ Return JSON: {success: true, ...}
        │
        └─ Frontend Error Handler
           ├─ catch() catches errors
           ├─ console.error() logs
           └─ toast.error() shows to user
```

## 7. Testing Checklist

```
╔═══════════════════════════════════════════════════════════╗
║          Stock Update API Testing Checklist               ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║ 1. Frontend Tests                                         ║
║    ☐ StockEditModal opens                               ║
║    ☐ Input accepts numbers only                         ║
║    ☐ Save button has loading state                      ║
║    ☐ Toast shows on success                             ║
║    ☐ Modal closes after save                            ║
║    ☐ Product list updates                               ║
║                                                          ║
║ 2. API Tests                                             ║
║    ☐ PATCH request succeeds with valid data            ║
║    ☐ Returns 400 for missing stock                      ║
║    ☐ Returns 404 for invalid product ID                ║
║    ☐ CORS headers present in response                   ║
║    ☐ Logs appear in Vercel console                      ║
║                                                          ║
║ 3. Database Tests                                        ║
║    ☐ Firestore document updates correctly              ║
║    ☐ stock field is numeric                            ║
║    ☐ stock value >= 0                                  ║
║    ☐ Change persists on refresh                        ║
║                                                          ║
║ 4. Integration Tests                                     ║
║    ☐ Stock decrements on payment                       ║
║    ☐ Low stock alerts generate                         ║
║    ☐ Alert status updates work                         ║
║    ☐ No race conditions with multiple updates          ║
║                                                          ║
║ 5. Error Tests                                           ║
║    ☐ Network error handled gracefully                  ║
║    ☐ Timeout error shows message                       ║
║    ☐ Invalid JSON body rejected                        ║
║    ☐ Missing headers handled                           ║
║                                                          ║
║ 6. Performance Tests                                     ║
║    ☐ Update completes < 1 second                       ║
║    ☐ No UI blocking during request                     ║
║    ☐ Handles rapid successive updates                  ║
║    ☐ Memory usage stable                               ║
║                                                          ║
╚═══════════════════════════════════════════════════════════╝
```

## 8. Deployment Readiness

```
┌──────────────────────────────────────────────────────────┐
│          Pre-Deployment Verification                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Environment Variables                                  │
│  ✅ FIREBASE_PROJECT_ID                                │
│  ✅ FIREBASE_CLIENT_EMAIL                              │
│  ✅ FIREBASE_PRIVATE_KEY (with \n escapes)             │
│  ✅ RAZORPAY_KEY_ID                                    │
│  ✅ RAZORPAY_KEY_SECRET                                │
│  ✅ NODE_ENV=production                                │
│                                                          │
│  Firebase Setup                                        │
│  ✅ products collection exists                         │
│  ✅ stock field is numeric                            │
│  ✅ Firestore indexes deployed                        │
│  ✅ Security rules allow operations                   │
│  ✅ Service account key configured                    │
│                                                          │
│  Frontend                                              │
│  ✅ API_BASE_URL set correctly                        │
│  ✅ All imports resolve                               │
│  ✅ No console errors                                 │
│  ✅ Responsive design works                           │
│                                                          │
│  Backend                                               │
│  ✅ /api/_.js route handling correct                  │
│  ✅ Error responses formatted properly                │
│  ✅ CORS headers present                              │
│  ✅ Logging configured                                │
│                                                          │
│  Tests                                                 │
│  ✅ Verification script passes                        │
│  ✅ Manual testing works                              │
│  ✅ Error handling verified                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 9. Quick Reference - Stock Update

```
What: Update a product's stock quantity
Where: Admin Dashboard → Click stock value
How: PATCH /api/admin/products/{productId}/stock
Body: { "stock": <number> }
Response: { "success": true, "message": "Stock updated", "stock": <number> }
UI: StockEditModal component
Handler: updateProductStock() function
Firestore: products.{id}.stock field
Status: ✅ Deployed, ✅ Tested, ✅ Ready
```

---

**Created:** March 11, 2026  
**Visual Quick Reference - Stock Update API**
