# 🚀 Quick Reference Card

## Project: Vending Machine Web Application

---

## 📁 File Locations

### Documentation
- **Complete Guide**: `/COMPLETE_DOCUMENTATION.md`
- **Verification Steps**: `/VERIFICATION_GUIDE.md`
- **Machine-001 Products**: `/MACHINE_001_PRODUCTS.md`

### Frontend
- **Location**: `/frontend/`
- **Main Pages**: `/frontend/src/pages/`
- **Components**: `/frontend/src/components/`
- **Environment**: `/frontend/.env`

### Backend
- **Location**: `/functions/`
- **Cloud Functions**: `/functions/src/`
- **Seed Script**: `/functions/seed-emulator.js`

---

## 🎯 Quick Start

### 1. Start Firebase Emulator
```bash
cd /home/a-raghavendra/Desktop/github_repos/project1/functions
firebase emulators:start --only firestore
```
**URL**: http://localhost:8080

### 2. Seed Database
```bash
cd /home/a-raghavendra/Desktop/github_repos/project1/functions
npm run seed:emulator
```
**Result**: 11 products in machine-001

### 3. Start React App
```bash
cd /home/a-raghavendra/Desktop/github_repos/project1/frontend
npm start
```
**URL**: http://localhost:3000

### 4. Open Machine Page
```
http://localhost:3000/machine/machine-001
```
**Expected**: See all 11 products

---

## 🔍 Verify All Products Display

### Browser Console (F12)
Should see:
```
🔧 Connected to Firestore Emulator
📦 [useProducts] Loaded 11 products for machine-001
```

### Product Count Badge
Should show: **11 / 11**

### Product Grid
Should display **11 product cards** in alphabetical order

---

## 📦 Machine-001 Products (11 Total)

### Beverages (3)
- Coca Cola 500ml - ₹40
- Frooti Mango Drink - ₹30
- Pepsi 500ml - ₹40

### Water (2)
- Bisleri Water 500ml - ₹20
- Mineral Water 1L - ₹25

### Snacks (3)
- Kurkure Masala Munch - ₹20
- Lays Classic Chips - ₹20
- Pringles Original - ₹60

### Chocolates (3)
- Cadbury Dairy Milk - ₹50
- KitKat Chocolate - ₹30
- Snickers Bar - ₹35

---

## 🎨 Filter System

### Default State
- **Selected**: All Products
- **Displayed**: 11 products
- **Sort**: Alphabetical (A-Z)

### Category Filters
- **All Products**: 11 items
- **beverages**: 3 items
- **water**: 2 items
- **snacks**: 3 items
- **chocolates**: 3 items

### Search
- Type in search box
- Filters by product name
- Real-time updates

---

## 🔧 Environment Configuration

### Frontend `.env`
```bash
REACT_APP_ENV=development
REACT_APP_USE_EMULATOR=true
REACT_APP_API_BASE_URL=http://localhost:5001/vending-machine-web/asia-south1/api
```

### Backend `.env`
```bash
RAZORPAY_KEY_ID=rzp_test_SFcjAAIXATSVHV
RAZORPAY_KEY_SECRET=your_secret_key
```

---

## 🐛 Troubleshooting

### Products Not Showing?

**Solution 1**: Hard refresh browser
```
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

**Solution 2**: Re-seed database
```bash
cd functions && npm run seed:emulator
```

**Solution 3**: Check emulator is running
```bash
ps aux | grep firestore
```

**Solution 4**: Restart React server
```bash
pkill -f react-scripts
cd frontend && npm start
```

---

## 📊 Key Numbers

- **Total Products**: 11 (machine-001)
- **Categories**: 4 (beverages, water, snacks, chocolates)
- **Total Stock**: 289 items
- **Price Range**: ₹20 - ₹60
- **Average Price**: ₹32.73

---

## 🌐 URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:3000 | ✅ Running |
| Firestore Emulator | http://localhost:8080 | ✅ Running |
| Emulator UI | http://localhost:4000 | ✅ Available |
| Machine-001 Page | http://localhost:3000/machine/machine-001 | ✅ Shows 11 products |

---

## ✅ Success Checklist

- [x] Firestore emulator running on port 8080
- [x] Database seeded with 11 products (machine-001)
- [x] React dev server running on port 3000
- [x] Frontend `.env` configured for emulator
- [x] Browser shows "Connected to Firestore Emulator"
- [x] Product count badge shows "11 / 11"
- [x] All 11 products visible in grid
- [x] Category filters working (All, beverages, water, snacks, chocolates)
- [x] Search functionality working
- [x] Product cards show correct info (name, price, stock, category)

---

## 📞 Support

**Documentation Files**:
1. `COMPLETE_DOCUMENTATION.md` - Full technical documentation
2. `VERIFICATION_GUIDE.md` - Step-by-step verification
3. `MACHINE_001_PRODUCTS.md` - Product database details
4. `QUICK_REFERENCE.md` - This file

**Key Files to Check**:
- `/frontend/src/pages/MachinePage.jsx` - Product display logic
- `/frontend/src/hooks/useProducts.js` - Database connection
- `/functions/seed-emulator.js` - Product data

---

**Last Updated**: February 14, 2026
**Status**: ✅ All systems operational
**Products**: ✅ All 11 visible
