# 📊 Machine-001 Product Database Summary

## Database Status: ✅ ACTIVE

**Total Products**: 11
**Machine ID**: machine-001
**Machine Name**: Building A Lobby
**Location**: Building A, Floor 1 - Lobby
**Status**: Online

---

## Complete Product List

### 🥤 Beverages (3 products)

| # | Product Name | Price | Stock | ID |
|---|--------------|-------|-------|-----|
| 1 | Coca Cola 500ml | ₹40 | 25 | prod-001-coke |
| 2 | Pepsi 500ml | ₹40 | 20 | prod-001-pepsi |
| 3 | Frooti Mango Drink | ₹30 | 24 | prod-001-frooti |

**Category Total**: ₹110 average, 69 items in stock

---

### 💧 Water (2 products)

| # | Product Name | Price | Stock | ID |
|---|--------------|-------|-------|-----|
| 4 | Bisleri Water 500ml | ₹20 | 50 | prod-001-water |
| 5 | Mineral Water 1L | ₹25 | 35 | prod-001-water-1l |

**Category Total**: ₹45 average, 85 items in stock

---

### 🍿 Snacks (3 products)

| # | Product Name | Price | Stock | ID |
|---|--------------|-------|-------|-----|
| 6 | Lays Classic Chips | ₹20 | 30 | prod-001-lays |
| 7 | Kurkure Masala Munch | ₹20 | 25 | prod-001-kurkure |
| 8 | Pringles Original | ₹60 | 12 | prod-001-pringles |

**Category Total**: ₹100 average, 67 items in stock

---

### 🍫 Chocolates (3 products)

| # | Product Name | Price | Stock | ID |
|---|--------------|-------|-------|-----|
| 9 | KitKat Chocolate | ₹30 | 28 | prod-001-kitkat |
| 10 | Cadbury Dairy Milk | ₹50 | 22 | prod-001-dairymilk |
| 11 | Snickers Bar | ₹35 | 18 | prod-001-snickers |

**Category Total**: ₹115 average, 68 items in stock

---

## Statistics

### Inventory Summary
- **Total Products**: 11
- **Total Stock**: 289 items
- **Total Value**: ₹9,235 (approx)
- **Average Price**: ₹32.73
- **Categories**: 4

### Price Range
- **Minimum**: ₹20 (Bisleri Water, Lays, Kurkure)
- **Maximum**: ₹60 (Pringles Original)
- **Median**: ₹30

### Stock Distribution
- **High Stock (>30)**: 2 products
- **Medium Stock (20-30)**: 7 products
- **Low Stock (<20)**: 2 products
- **Out of Stock**: 0 products

### Category Distribution
```
Beverages:   27% (3/11)
Water:       18% (2/11)
Snacks:      27% (3/11)
Chocolates:  27% (3/11)
```

---

## Frontend Filter Mapping

When you visit: `http://localhost:3000/machine/machine-001`

### Filter: "All Products" (Default)
**Shows**: All 11 products
**Count**: 11 / 11

### Filter: "beverages"
**Shows**: Coca Cola, Pepsi, Frooti
**Count**: 3 / 11

### Filter: "water"
**Shows**: Bisleri Water, Mineral Water 1L
**Count**: 2 / 11

### Filter: "snacks"
**Shows**: Lays, Kurkure, Pringles
**Count**: 3 / 11

### Filter: "chocolates"
**Shows**: KitKat, Cadbury Dairy Milk, Snickers
**Count**: 3 / 11

---

## Alphabetical Order (Default Sort)

1. Bisleri Water 500ml
2. Cadbury Dairy Milk
3. Coca Cola 500ml
4. Frooti Mango Drink
5. KitKat Chocolate
6. Kurkure Masala Munch
7. Lays Classic Chips
8. Mineral Water 1L
9. Pepsi 500ml
10. Pringles Original
11. Snickers Bar

---

## Firestore Collection Structure

```
products/
  ├── prod-001-coke
  │   ├── machineId: "machine-001"
  │   ├── name: "Coca Cola 500ml"
  │   ├── price: 40
  │   ├── stock: 25
  │   ├── category: "beverages"
  │   └── imageUrl: "https://..."
  │
  ├── prod-001-pepsi
  ├── prod-001-frooti
  ├── prod-001-water
  ├── prod-001-water-1l
  ├── prod-001-lays
  ├── prod-001-kurkure
  ├── prod-001-pringles
  ├── prod-001-kitkat
  ├── prod-001-dairymilk
  └── prod-001-snickers
```

---

## React Component Flow

```
MachinePage Component
  │
  ├─ useProducts('machine-001')
  │   └─ Firestore onSnapshot → 11 products
  │
  ├─ FilterBar Component
  │   ├─ Search Input
  │   └─ Category Pills (All, beverages, water, snacks, chocolates)
  │
  └─ ProductList Component
      └─ ProductCard × 11
          ├─ Product Image
          ├─ Product Name
          ├─ Price Badge
          ├─ Stock Badge
          ├─ Category Tag
          └─ Buy Button
```

---

## Expected UI State

### Initial Load
```
┌─────────────────────────────────────────┐
│  🔍 Search products...        [11 / 11] │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ [All Products] [beverages] [water]      │
│ [snacks] [chocolates]                   │
└─────────────────────────────────────────┘

Grid of 11 Product Cards (4 columns on desktop)
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│Card1│ │Card2│ │Card3│ │Card4│
└─────┘ └─────┘ └─────┘ └─────┘
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│Card5│ │Card6│ │Card7│ │Card8│
└─────┘ └─────┘ └─────┘ └─────┘
┌─────┐ ┌─────┐ ┌─────┐
│Card9│ │Cd10│ │Cd11│
└─────┘ └─────┘ └─────┘
```

### Filter: "beverages" Selected
```
┌─────────────────────────────────────────┐
│  🔍 Search products...         [3 / 11] │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ [All Products] [●beverages●] [water]    │
│ [snacks] [chocolates]                   │
└─────────────────────────────────────────┘

Grid of 3 Product Cards
┌─────┐ ┌─────┐ ┌─────┐
│Coke │ │Frooti│ │Pepsi│
└─────┘ └─────┘ └─────┘
```

---

## Database Query (Frontend Code)

```javascript
// hooks/useProducts.js
const q = query(
  collection(db, 'products'),
  where('machineId', '==', 'machine-001')
);

onSnapshot(q, (snapshot) => {
  const products = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  // Returns 11 products
});
```

---

## Verification Commands

### Check Database
```bash
cd /home/a-raghavendra/Desktop/github_repos/project1/functions
npm run seed:emulator
```

### Check Servers
```bash
# Firestore Emulator
curl http://localhost:8080

# React Dev Server
curl http://localhost:3000
```

### Open Application
```
Browser: http://localhost:3000/machine/machine-001
Expected: See all 11 products immediately
```

---

**Status**: ✅ All 11 products ready to display
**Last Verified**: February 14, 2026
**Environment**: Development (Local Emulator)
