# Stock Update API - Flow Diagrams & Architecture

## 1. Stock Update Flow Diagram

```
Admin Dashboard (Frontend)
        ↓
   [Click Stock Button]
        ↓
   StockEditModal Component
        ↓
   [Enter new stock value]
        ↓
   updateProductStock(productId, stock)
        ↓
   PATCH /api/admin/products/{productId}/stock
        ↓
   API Handler (/api/_.js)
        ↓
   Validate stock parameter
        ↓
   Firestore: products.doc(productId).update({stock})
        ↓
   Return Success Response
        ↓
   Frontend: Toast notification
        ↓
   Reload products list
        ↓
   UI updated with new stock
```

## 2. Stock Decrement on Payment Flow

```
User Purchase
        ↓
   CreateOrder API
   POST /api/createOrder
        ↓
   Create Razorpay Order
        ↓
   Show Payment Modal
        ↓
   User Completes Payment
        ↓
   PaymentModal receives response
        ↓
   VerifyPayment API
   POST /api/verifyPayment
        ↓
   Validate Razorpay signature
        ↓
   Update order status → completed
        ↓
   Fetch current stock: productDoc.stock
        ↓
   Decrement stock: Math.max(0, currentStock - 1)
        ↓
   Firestore: products.update({stock: newStock})
        ↓
   Trigger ESP8266 dispense signal
        ↓
   Return success to frontend
        ↓
   Product dispensed & stock updated
```

## 3. Low Stock Alert Flow

```
Admin Dashboard
        ↓
   [Click "Check Stock" Button]
        ↓
   checkAllStock() function
        ↓
   GET /api/admin/check-stock
        ↓
   API Handler iterates products
        ↓
   For each product with stock < threshold:
        ├── Check if alert exists
        ├── If not, create stockAlert doc
        └── Set status = "pending"
        ↓
   Return results
        ↓
   Fetch all alerts
   GET /api/admin-alerts
        ↓
   Display in Low Stock Alerts tab
        ↓
   Admin can:
        ├── Acknowledge → status = "acknowledged"
        ├── Resolve → status = "resolved"
        └── Refill stock → delete alert
```

## 4. API Handler Architecture

```
┌─────────────────────────────────────┐
│     /api/_.js (Catch-all Router)    │
├─────────────────────────────────────┤
│                                     │
│  Parse Request                      │
│  ├─ Method (GET/POST/PUT/PATCH)   │
│  ├─ URL Path                        │
│  ├─ Query Parameters                │
│  └─ Request Body                    │
│                                     │
│  Route Matching                     │
│  ├─ /admin-products → GET           │
│  ├─ /admin-machines → GET           │
│  ├─ /admin-alerts → GET             │
│  ├─ /admin-low-stock → GET          │
│  ├─ /admin/products → POST/PUT      │
│  ├─ /admin/products/{id} → PUT/DEL  │
│  ├─ /admin/products/{id}/stock → PATCH ◄── STOCK UPDATE
│  ├─ /createOrder → POST             │
│  ├─ /verifyPayment → POST           │
│  └─ /health → GET                   │
│                                     │
│  Firebase Integration               │
│  ├─ Firestore query/update          │
│  ├─ Error handling                  │
│  └─ Response formatting             │
│                                     │
└─────────────────────────────────────┘
```

## 5. Stock Update Handler Details

```
PATCH /api/admin/products/{productId}/stock
│
├─ Extract productId from URL regex
│  /^\/admin\/products\/([a-zA-Z0-9\-]+)\/stock$/
│
├─ Extract stock from request body
│  if (!stock) → return 400 error
│
├─ Firestore Operation
│  db.collection('products')
│    .doc(productId)
│    .update({ stock })
│
├─ Success Path
│  ├─ Log: "Updated stock for product {id} to {value}"
│  ├─ Response 200
│  └─ Return: {success: true, message: "Stock updated", stock}
│
└─ Error Path
   ├─ Log error details
   ├─ Response 500
   └─ Return: {success: false, error: message}
```

## 6. Frontend Component Hierarchy

```
AdminDashboard (Main Page)
│
├─ State Management
│  ├─ products (from useAllProducts hook)
│  ├─ machines (from useAllMachines hook)
│  ├─ lowStockProducts
│  ├─ stockAlerts
│  ├─ editingProduct
│  └─ editingStock
│
├─ UI Sections
│  ├─ Header
│  │  └─ Search, Filter, Refresh
│  │
│  ├─ Tabs
│  │  ├─ Products Tab
│  │  │  ├─ ProductCard (map products)
│  │  │  │  ├─ Stock Display
│  │  │  │  ├─ [Edit] Button → ProductEditModal
│  │  │  │  └─ [Update Stock] Button → StockEditModal ◄── HERE
│  │  │  └─ Add Product Button
│  │  │
│  │  ├─ Low Stock Tab
│  │  │  ├─ Low Stock Products List
│  │  │  └─ Check Stock Button
│  │  │
│  │  ├─ Alerts Tab
│  │  │  ├─ Alert List
│  │  │  ├─ [Acknowledge] Button
│  │  │  └─ [Resolve] Button
│  │  │
│  │  └─ Analytics Tab
│  │     ├─ Stock Distribution Chart
│  │     └─ Trend Analysis
│  │
│  └─ Modals
│     ├─ ProductEditModal
│     ├─ StockEditModal ◄── STOCK UPDATE MODAL
│     └─ DeleteConfirmation
│
└─ API Calls
   ├─ getStockAlerts()
   ├─ getLowStockProducts()
   ├─ updateProductStock() ◄── STOCK UPDATE CALL
   ├─ checkAllStock()
   └─ etc.
```

## 7. StockEditModal Component Flow

```
StockEditModal
│
├─ Props
│  ├─ isOpen (boolean)
│  ├─ onClose (function)
│  ├─ product (object with id, stock)
│  └─ onSave (function)
│
├─ State
│  ├─ stock (number) - current input value
│  └─ saving (boolean) - loading state
│
├─ Effects
│  └─ useEffect: sync stock when product changes
│
├─ Handlers
│  └─ handleSave()
│     ├─ setSaving(true)
│     ├─ Call: updateProductStock(product.id, Number(stock))
│     ├─ On Success:
│     │  ├─ toast.success(`Stock updated to ${stock}`)
│     │  ├─ onSave() → reload data
│     │  └─ onClose() → close modal
│     └─ On Error:
│        └─ toast.error('Failed to update stock')
│
├─ UI Elements
│  ├─ Modal backdrop (fixed, full screen)
│  ├─ Input field
│  │  └─ type="number", min="0"
│  ├─ Cancel Button → onClose()
│  └─ Save Button → handleSave() with loading spinner
│
└─ Conditional Render
   └─ if (!isOpen || !product) → return null
```

## 8. Data Flow on Stock Update

```
Frontend State (Before)
{
  products: [
    {
      id: "prod_123",
      name: "Cola",
      stock: 10,        ◄── Current value
      price: 40,
      machineId: "m1",
      ...
    }
  ]
}
        ↓
   User Updates Stock to 15
        ↓
   StockEditModal sends:
   PATCH /api/admin/products/prod_123/stock
   { "stock": 15 }
        ↓
   API Handler processes:
   db.collection('products')
     .doc('prod_123')
     .update({ stock: 15 })
        ↓
   Firestore (Updated)
   {
     id: "prod_123",
     stock: 15,         ◄── New value
     name: "Cola",
     ...
   }
        ↓
   API Returns:
   {
     success: true,
     message: "Stock updated",
     stock: 15
   }
        ↓
   Frontend State (After)
   {
     products: [
       {
         id: "prod_123",
         name: "Cola",
         stock: 15,       ◄── Updated!
         price: 40,
         machineId: "m1",
         ...
       }
     ]
   }
        ↓
   UI Re-renders
   └─ Product shows stock: 15
```

## 9. Error Handling Flow

```
Stock Update Request
        ↓
    ┌─── Validation ───┐
    │                  │
    ├─ stock exists?
    │  NO → 400 error
    │
    ├─ stock is number?
    │  NO → coerced to Number()
    │
    ├─ productId exists?
    │  NO → Firestore returns error
    │       → 500 error to frontend
    │
    └─ All valid → Proceed
        ↓
    Firestore Update
        ↓
    ┌─── Outcomes ───┐
    │                 │
    ├─ Success
    │  → Return 200 OK
    │
    └─ Firebase Error
       → Log error
       → Return 500 + error message
        ↓
    Frontend Error Handler
        ├─ catch(error)
        ├─ console.error()
        └─ toast.error('Failed to update stock')
```

## 10. Integration Points

### Frontend ↔ Backend
```
updateProductStock() [api.js]
        ↓
fetch(`${API_BASE_URL}/admin/products/${productId}/stock`)
        ↓
PATCH request with JSON body
        ↓
API Router (/api/_.js)
        ↓
Route matching & validation
        ↓
Firestore operation
        ↓
Response (200 or error)
        ↓
JSON parsing in frontend
        ↓
State update & UI refresh
```

### Firestore Integration
```
Products Collection
{
  docId_1: {
    name: "Cola",
    stock: 10,      ◄── Updated via PATCH
    price: 40,
    machineId: "m1",
    createdAt: timestamp,
    updatedAt: timestamp (auto-updated)
  }
}
```

## 11. Real-time Updates (Potential Optimization)

Current: Pull-based (user clicks refresh)

Future: Push-based (Firestore listeners)
```
// In ProductList component
useEffect(() => {
  const unsubscribe = db.collection('products')
    .where('machineId', '==', machineId)
    .onSnapshot(snapshot => {
      const products = [];
      snapshot.forEach(doc => {
        products.push({ id: doc.id, ...doc.data() });
      });
      setProducts(products);
    });

  return () => unsubscribe();
}, [machineId]);

// Results in immediate UI updates when stock changes
// across all devices without manual refresh
```

---

## Summary of Stock Update Flow

1. **User Action:** Click stock value in Admin Dashboard
2. **Modal:** StockEditModal opens with current stock
3. **Input:** User enters new stock quantity
4. **API Call:** updateProductStock(productId, stock)
5. **Request:** PATCH /api/admin/products/{productId}/stock
6. **Processing:** API validates and updates Firestore
7. **Response:** Success response returned to frontend
8. **Notification:** Toast shows success message
9. **Refresh:** Products list reloads
10. **Display:** UI updates with new stock value

---

**Last Updated:** March 11, 2026
