# Fix Trending Data on Live Deployment

The deployed website is missing **trending information** and **sales data** that exists in the local version.

## What's Missing

| Feature | Local | Deployed |
|---------|-------|----------|
| Trending Badges | ✅ #1, #2, #3 etc. | ❌ Shows 0 Trending |
| Weekly Sales | ✅ Shows 87, 38, 35... | ❌ Shows "No data" |
| Sales Trends | ✅ Shows up/down % | ❌ Empty |
| Season Tags | ✅ Summer, Winter | ✅ All Season |
| Trending Count | ✅ 14 products | ❌ 0 products |

## Solution

Add trending and sales data to all products in production database.

### Option 1: Automatic Update (Recommended)

**Prerequisites:**
- Firebase CLI installed: `npm install -g firebase-tools`
- Logged in: `firebase login`

**Steps:**

```bash
# Navigate to functions directory
cd functions

# Install dependencies if needed
npm install

# Run the update script
node update-trending-data.js
```

**Output:**
```
🌱 Starting to add trending and sales data to production...

✅ Updated: Coca Cola 500ml (Trending #1)
✅ Updated: Sprite 500ml (Trending #2)
✅ Updated: Water 500ml (Trending #3)
[... more products ...]

🎉 Success! Updated 25 products

📊 Summary:
   Total products updated: 25
   Trending products: 12
   Products with sales data: 15
```

### Option 2: Manual Update via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `vending-machine-web`
3. Go to Firestore Database
4. Open **products** collection
5. For each product, add fields:

**Field 1: `trending`** (Type: Map)
```
trending: {
  isTrending: true,
  rank: 1,
  reason: "Top seller this season"
}
```

**Field 2: `salesData`** (Type: Map)
```
salesData: {
  lastWeek: 87,
  trend: "up",
  percentChange: 15
}
```

## What the Script Does

The `update-trending-data.js` script:
1. Connects to production Firebase database
2. Fetches all products
3. Adds trending badges to top products
4. Adds weekly sales numbers
5. Adds sales trends and percentage changes
6. Marks products as trending if applicable

## After Running

Once executed, your deployed dashboard will show:
- ✅ Trending badges on top 12 products
- ✅ Weekly sales numbers
- ✅ Up/down trend indicators
- ✅ Percentage changes (15%, 7%, 18%, etc.)
- ✅ Trending count will increase from 0 to 12+

## Verify It Worked

1. Go to your deployed website
2. Visit Admin Dashboard
3. Refresh the page
4. Check that:
   - Trending count increased
   - Weekly Sales column has numbers
   - Products have trending badges (#1, #2, etc.)

## Troubleshooting

**If Firebase auth fails:**
```bash
firebase login --reauth
```

**If script can't find database:**
```bash
# Verify project
firebase projects:list

# Use specific project
firebase --project vending-machine-web functions:shell
```

**If permission denied:**
- Make sure your Firebase account has Editor role on the project
- Or use service account credentials

## Rollback (If Needed)

To remove trending data:
```javascript
// In Firebase Console Firestore shell
db.collection('products').doc('prod-001-coke').update({
  trending: {
    isTrending: false,
    rank: 999,
    reason: ''
  },
  salesData: {
    lastWeek: 0,
    trend: 'stable',
    percentChange: 0
  }
})
```

---

**Status:** Ready to execute
**Time to complete:** 2-5 minutes
**Impact:** Full feature parity with local version
