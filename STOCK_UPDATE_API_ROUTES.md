# Stock Update API Routes - Pre-Deployment Checklist

## Overview
This document outlines all API routes and functions related to stock updates in the Admin Dashboard. Use this checklist before deployment to ensure everything is working properly.

---

## 1. MAIN STOCK UPDATE ENDPOINTS

### 1.1 Update Product Stock (Primary Route)
**Endpoint:** `PATCH /api/admin/products/{productId}/stock`  
**Location:** `/api/_.js` (lines 177-192)  
**Method:** PATCH  
**Frontend Call:** `updateProductStock()` from `frontend/src/services/api.js` (lines 440-454)

**Request Body:**
```json
{
  "stock": 25
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Stock updated",
  "stock": 25
}
```

**Response Error:**
```json
{
  "success": false,
  "error": "Stock quantity required"
}
```

**UI Component:** StockEditModal in AdminDashboard.jsx (lines 879-930)

---

## 2. RELATED STOCK ENDPOINTS

### 2.1 Get Low Stock Products
**Endpoint:** `GET /api/admin-low-stock`  
**Location:** `/api/_.js` (lines 121-139)  
**Query Parameters:** 
- `threshold` (optional, default: 10) - Stock level threshold

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "productId",
      "name": "Product Name",
      "stock": 5,
      "machineId": "machineId",
      "price": 40
    }
  ]
}
```

**Frontend Call:** `getLowStockProducts()` from `frontend/src/services/api.js` (lines 273-287)

---

### 2.2 Check All Stock & Create Alerts
**Endpoint:** `GET /api/admin/check-stock`  
**Location:** Referenced in frontend but handler in `/api/_.js`  
**Method:** GET

**Response:**
```json
{
  "success": true,
  "message": "Stock check completed"
}
```

**Frontend Call:** `checkAllStock()` from `frontend/src/services/api.js` (lines 294-307)

---

### 2.3 Get Stock Alerts
**Endpoint:** `GET /api/admin-alerts`  
**Location:** `/api/_.js` (lines 104-119)  
**Query Parameters:**
- `status` (optional) - Filter by 'pending', 'acknowledged', or 'resolved'

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "alertId",
      "productId": "productId",
      "machineId": "machineId",
      "currentStock": 2,
      "threshold": 10,
      "status": "pending",
      "createdAt": "2026-03-11T..."
    }
  ]
}
```

**Frontend Call:** `getStockAlerts()` from `frontend/src/services/api.js` (lines 192-210)

---

### 2.4 Acknowledge Stock Alert
**Endpoint:** `PUT /api/admin-alerts/{alertId}/acknowledge`  
**Location:** `/api/_.js` (referenced in frontend)  
**Method:** PUT

**Response:**
```json
{
  "success": true,
  "message": "Alert acknowledged"
}
```

**Frontend Call:** `acknowledgeAlert()` from `frontend/src/services/api.js` (lines 213-237)

---

### 2.5 Resolve Stock Alert
**Endpoint:** `PUT /api/admin-alerts/{alertId}/resolve`  
**Location:** `/api/_.js` (referenced in frontend)  
**Method:** PUT

**Response:**
```json
{
  "success": true,
  "message": "Alert resolved"
}
```

**Frontend Call:** `resolveAlert()` from `frontend/src/services/api.js` (lines 241-265)

---

## 3. STOCK UPDATE IN PAYMENT FLOW

### 3.1 Stock Decremented on Payment Verification
**Endpoint:** `POST /api/verifyPayment`  
**Location:** `/api/_.js` (lines 293-322)  
**Automatic Action:** Stock is decremented by 1 when payment is verified

**Code Reference:**
```javascript
// Decrement product stock
const productDoc = await db.collection('products').doc(productId).get();
if (productDoc.exists) {
  const currentStock = productDoc.data().stock || 0;
  await db.collection('products').doc(productId).update({
    stock: Math.max(0, currentStock - 1),
  });
}
```

---

## 4. FRONTEND IMPLEMENTATION

### 4.1 Stock Update Modal
**File:** `frontend/src/pages/AdminDashboard.jsx` (lines 879-930)  
**Component:** `StockEditModal`

**Features:**
- Input field for new stock quantity
- Save button with loading state
- Toast notification on success/error
- Auto-closes on success

**Handler Function:**
```javascript
const handleSave = async () => {
  setSaving(true);
  try {
    await updateProductStock(product.id, Number(stock));
    toast.success(`Stock updated to ${stock}`);
    onSave();
    onClose();
  } catch (error) {
    toast.error('Failed to update stock');
  } finally {
    setSaving(false);
  }
};
```

---

### 4.2 Product Edit Modal - Stock Field
**File:** `frontend/src/pages/AdminDashboard.jsx` (lines 755-760)  
**Component:** `ProductEditModal`

**Features:**
- Stock field in product creation/editing
- Minimum value: 0
- Updates via `updateProduct()` function

---

### 4.3 Stock Visualization Components
**File:** `frontend/src/pages/AdminDashboard.jsx`

- **StockLevelIndicator** (lines 99-108): Color-coded stock display
  - Red: 0 units
  - Orange: 1-2 units
  - Yellow: 3-5 units
  - Green: >5 units

- **Stock Distribution Analytics** (lines 181-208): Pie chart showing:
  - Out of stock products
  - Critical stock (1-2 units)
  - Low stock (3-5 units)
  - Normal stock (>5 units)

---

## 5. PRE-DEPLOYMENT CHECKLIST

### ✅ API Routes
- [ ] `PATCH /api/admin/products/{productId}/stock` - Test with valid/invalid productId
- [ ] `GET /api/admin-low-stock` - Test with different thresholds
- [ ] `GET /api/admin-alerts` - Test with status filters
- [ ] `PUT /api/admin-alerts/{alertId}/acknowledge` - Test acknowledgment flow
- [ ] `PUT /api/admin-alerts/{alertId}/resolve` - Test resolution flow
- [ ] `POST /api/verifyPayment` - Verify stock decrement on payment

### ✅ Environment Variables (Vercel)
- [ ] `FIREBASE_PROJECT_ID` is set
- [ ] `FIREBASE_CLIENT_EMAIL` is set
- [ ] `FIREBASE_PRIVATE_KEY` is set with proper newlines
- [ ] `RAZORPAY_KEY_ID` is set
- [ ] `RAZORPAY_KEY_SECRET` is set

### ✅ Firestore Configuration
- [ ] `products` collection has `stock` field (numeric)
- [ ] `stockAlerts` collection exists with proper schema
- [ ] Firestore indexes are deployed
- [ ] Security rules allow admin operations

### ✅ Firebase Rules
- [ ] Read/Write rules for `products` collection
- [ ] Read/Write rules for `stockAlerts` collection
- [ ] Read/Write rules for `orders` collection

### ✅ Frontend Testing
- [ ] Stock update modal opens correctly
- [ ] Stock input accepts numeric values only
- [ ] API call succeeds with proper request body
- [ ] Toast notifications display correctly
- [ ] Stock changes reflect in product list after update
- [ ] Low stock alerts display correctly

### ✅ Database Validation
- [ ] Stock values are numeric (not strings)
- [ ] Stock values are >= 0
- [ ] Alert status values are valid ('pending', 'acknowledged', 'resolved')
- [ ] Timestamps are properly formatted

### ✅ Error Handling
- [ ] Missing `stock` field returns 400 error
- [ ] Invalid product ID returns 404 error
- [ ] Database connection errors return 500 error
- [ ] CORS headers are properly set

---

## 6. COMMON ISSUES & SOLUTIONS

### Issue: Stock Update Returns 404
**Cause:** Product ID doesn't exist or is malformed  
**Solution:** 
1. Verify product ID is correct
2. Check Firebase console for product existence
3. Ensure product ID format matches expectations

### Issue: Stock Not Decreasing on Payment
**Cause:** Payment verification endpoint not called or stock field missing  
**Solution:**
1. Verify `/verifyPayment` endpoint is being called
2. Check Firestore for `stock` field in products
3. Review browser console for errors

### Issue: Low Stock Alerts Not Appearing
**Cause:** Threshold not set or alerts not created  
**Solution:**
1. Run stock check via `checkAllStock()` function
2. Verify threshold setting (default: 10)
3. Check Firestore `stockAlerts` collection exists

### Issue: API Timeout on Deployment
**Cause:** Firestore connection issues or slow queries  
**Solution:**
1. Check Firebase initialization in `/api/_.js`
2. Review Firestore indexes
3. Enable Cloud Functions debug logging
4. Check Vercel function logs

---

## 7. TESTING SCENARIOS

### Scenario 1: Manual Stock Update
```
1. Go to Admin Dashboard
2. Find a product
3. Click on stock value
4. Change quantity (e.g., from 20 to 15)
5. Click Save
6. Verify: Product shows new stock value
7. Refresh page and verify change persists
```

### Scenario 2: Stock Decrement on Purchase
```
1. Note product stock (e.g., 10)
2. Make a purchase through vending machine
3. Verify payment in Razorpay
4. Check Admin Dashboard stock (should be 9)
5. Verify stock change is immediate
```

### Scenario 3: Low Stock Alert
```
1. Update product stock to 5 units
2. Click "Check Stock" button
3. Verify alert appears in "Low Stock Alerts" tab
4. Acknowledge the alert
5. Verify status changes to "Acknowledged"
6. Refill stock to above threshold
7. Resolve the alert
8. Verify alert disappears
```

### Scenario 4: Error Handling
```
1. Attempt to update with invalid product ID
2. Verify error toast appears
3. Check browser console for error details
4. Verify error is logged in Vercel function logs
```

---

## 8. PERFORMANCE CONSIDERATIONS

- **Stock Updates:** Direct Firestore update (minimal latency)
- **Low Stock Queries:** Uses index on `products.stock` field
- **Alert Checks:** May iterate all products - consider pagination for scale
- **Caching:** Consider Redis for frequently accessed product lists

---

## 9. FIREBASE INDEXES REQUIRED

For optimal performance, ensure these indexes exist:

```
Collection: products
  - Field: stock (Ascending)
  - Field: machineId (Ascending)
  - Field: stock, machineId (Composite)

Collection: stockAlerts
  - Field: status (Ascending)
  - Field: status, createdAt (Composite)
```

---

## 10. API SUMMARY TABLE

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| PATCH | `/api/admin/products/{id}/stock` | Update product stock | ✅ Implemented |
| GET | `/api/admin-low-stock` | Fetch low stock products | ✅ Implemented |
| GET | `/api/admin-alerts` | Get stock alerts | ✅ Implemented |
| PUT | `/api/admin-alerts/{id}/acknowledge` | Acknowledge alert | ✅ Implemented |
| PUT | `/api/admin-alerts/{id}/resolve` | Resolve alert | ✅ Implemented |
| GET | `/api/admin/check-stock` | Trigger stock check | ✅ Implemented |
| POST | `/api/verifyPayment` | Verify payment & decrement stock | ✅ Implemented |

---

**Last Updated:** March 11, 2026  
**Status:** Pre-Deployment Review Complete
