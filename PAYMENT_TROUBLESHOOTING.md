# Payment Error: "Product not found" - Troubleshooting Guide

## Error Symptoms
- Click "Buy Now" button
- See "Payment Failed" modal
- Error message: "Product not found"

## Root Cause Analysis

The error occurs when the frontend sends a product ID to the backend that doesn't exist in Firestore.

### Verified Working:
✅ Backend API is running (`curl` test succeeded)
✅ Products exist in Firestore (22 products seeded)
✅ Firebase emulators are active
✅ Payment simulation is enabled

### Possible Causes:
1. **React app needs hard refresh** - Old cached data
2. **Wrong API_BASE_URL** - Pointing to wrong server
3. **Products not loaded in frontend** - Empty product list
4. **ID mismatch** - Frontend using wrong ID field

## Step-by-Step Fix

### Step 1: Hard Refresh Browser

**This fixes 90% of cases!**

```
Linux/Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

Or clear cache completely:
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Step 2: Verify Products Are Loading

1. Open browser console (F12)
2. Navigate to `http://localhost:3000`
3. Enter machine ID: `machine-001`
4. Look for console log:
   ```
   📦 [useProducts] Loaded products: {machineId: "machine-001", count: 11, ...}
   ```

If count is 0 or you don't see this log:
- The products aren't loading from Firestore
- Check if emulators are running
- Reseed the database

### Step 3: Check Console Logs When Clicking Buy

When you click "Buy Now", you should see:

```javascript
🛒 [Buy Product] Starting purchase: {
  productId: "prod-001-coke",  // ← Should start with "prod-"
  productName: "Coca Cola 500ml",
  machineId: "machine-001",
  ...
}

📡 [API] Creating order: {
  productId: "prod-001-coke",
  machineId: "machine-001",
  url: "http://localhost:5001/..."
}

📡 [API] Create order response: {
  status: 200,
  data: { success: true, ... }
}
```

**If you see a different productId format** (like numbers or UUIDs), the frontend is using cached/old data.

### Step 4: Verify API URL

Check browser console for the API URL being used:

```javascript
// Should be:
http://localhost:5001/vending-machine-web/asia-south1/api/createOrder

// NOT:
http://localhost:3000/...
https://production-url.com/...
```

If wrong, check [`frontend/.env`](frontend/.env):
```env
REACT_APP_API_BASE_URL=http://localhost:5001/vending-machine-web/asia-south1/api
```

### Step 5: Verify Emulators Are Running

```bash
# Check health endpoint
curl http://localhost:5001/vending-machine-web/asia-south1/api/health

# Should return:
# {"status":"healthy","timestamp":"...","service":"vending-machine-api","version":"1.0.0"}
```

If fails:
```bash
# Restart emulators
cd /home/a-raghavendra/Desktop/github_repos/project1
npm run emulators
```

Wait 10-15 seconds for them to fully start.

### Step 6: Reseed Database

If products aren't loading:

```bash
cd /home/a-raghavendra/Desktop/github_repos/project1/functions
node seed-emulator.js
```

Should see:
```
✅ Database seeded successfully!
📊 Summary:
  - Machines: 3
  - Products: 22
```

### Step 7: Restart React Dev Server

Sometimes React needs a full restart:

```bash
# Find and kill React process
ps aux | grep react-scripts
kill [PID]

# Start fresh
cd /home/a-raghavendra/Desktop/github_repos/project1/frontend
npm start
```

Wait for "Compiled successfully!" then hard refresh browser.

## Quick Diagnostic Checklist

Run these commands to verify everything:

```bash
# 1. Check emulators
curl -s http://localhost:5001/vending-machine-web/asia-south1/api/health | jq .

# 2. Count products in machine-001
curl -s "http://localhost:8080/v1/projects/vending-machine-web/databases/(default)/documents/products" | jq '[.documents[] | select(.fields.machineId.stringValue == "machine-001")] | length'
# Should return: 11

# 3. Test createOrder directly
curl -X POST http://localhost:5001/vending-machine-web/asia-south1/api/createOrder \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod-001-coke","machineId":"machine-001"}' | jq .
# Should return: {"success":true,"orderId":"...","mockPayment":true}

# 4. Check React is running
ps aux | grep react-scripts | grep -v grep
```

All tests passing? → Hard refresh browser (Ctrl+Shift+R)

## Still Not Working?

### Check Browser Console Errors

Look for:
- CORS errors → Backend not running
- Network errors → Wrong API URL
- 404 errors → Product doesn't exist
- Empty product list → Database not seeded

### Verify Product IDs Match

Products in database:
```bash
curl -s "http://localhost:8080/v1/projects/vending-machine-web/databases/(default)/documents/products" | jq -r '.documents[] | .name' | sed 's|.*/||' | grep "prod-001"
```

Should show:
```
prod-001-coke
prod-001-dairymilk
prod-001-frooti
prod-001-kitkat
prod-001-kurkure
prod-001-lays
prod-001-pepsi
prod-001-pringles
prod-001-snickers
prod-001-water
prod-001-water-1l
```

These IDs must match what the frontend sends!

## Common Solutions Summary

| Symptom | Solution |
|---------|----------|
| "Product not found" | Hard refresh browser (Ctrl+Shift+R) |
| Products don't appear | Reseed database: `node seed-emulator.js` |
| API errors | Restart emulators: `npm run emulators` |
| Still failing | Restart React: kill & `npm start` |
| Nothing works | Full restart: Kill all → Rebuild → Emulators → Seed → React → Hard refresh |

## Nuclear Option: Complete Reset

If nothing else works:

```bash
# 1. Kill everything
pkill -f "firebase emulators"
pkill -f "react-scripts"

# 2. Rebuild backend
cd /home/a-raghavendra/Desktop/github_repos/project1/functions
npm run build

# 3. Start emulators
cd /home/a-raghavendra/Desktop/github_repos/project1
nohup npm run emulators > /tmp/firebase.log 2>&1 &
sleep 15

# 4. Seed database
cd functions
node seed-emulator.js

# 5. Start React
cd ../frontend
npm start

# 6. In browser: Hard refresh (Ctrl+Shift+R)
```

## Debug Mode

Add this to check what product ID is being sent:

In browser console:
```javascript
// Intercept buy clicks
const originalFetch = window.fetch;
window.fetch = function(...args) {
    if (args[0].includes('createOrder')) {
        console.log('🔍 Intercepted createOrder request:', args);
    }
    return originalFetch.apply(this, args);
};
```

Then click "Buy Now" and check the logged request body.
