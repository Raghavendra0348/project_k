# 📚 Documentation Index - QR Vending Machine System

## Complete Project Documentation Guide

---

## 📖 Quick Navigation

| Document | Description | Target Audience |
|----------|-------------|-----------------|
| [README.md](README.md) | Project overview & quick start | Everyone |
| [SETUP.md](SETUP.md) | Initial setup instructions | Developers |
| [RUN_GUIDE.md](RUN_GUIDE.md) | How to run the project | Developers |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture deep dive | Tech Leads/Architects |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment instructions | DevOps |
| [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) | Vercel + Firebase deployment | DevOps |

---

## 🗂️ Documentation Categories

### 1. 🚀 Getting Started
| File | Lines | Description |
|------|-------|-------------|
| `README.md` | 348 | Project overview, features, architecture diagram |
| `SETUP.md` | 436 | Complete setup guide with prerequisites |
| `RUN_GUIDE.md` | 389 | Step-by-step running instructions |
| `QUICK_REFERENCE.md` | 217 | Quick commands cheat sheet |

### 2. 🏗️ Architecture & Design
| File | Lines | Description |
|------|-------|-------------|
| `ARCHITECTURE.md` | 361 | System architecture, data flow, design patterns |
| `COMPLETE_DOCUMENTATION.md` | 1261 | Full technical documentation |
| `CODE_DOCUMENTATION.md` | - | Code-level documentation |
| `IMPLEMENTATION_PLAN.md` | 610 | Development roadmap & milestones |

### 3. 💳 Payment Integration
| File | Lines | Description |
|------|-------|-------------|
| `RAZORPAY_SETUP.md` | 219 | Razorpay configuration guide |
| `PAYMENT_TESTING_GUIDE.md` | 158 | Test card numbers, testing flows |
| `PAYMENT_TROUBLESHOOTING.md` | 264 | Common payment issues & fixes |

### 4. 🚢 Deployment
| File | Lines | Description |
|------|-------|-------------|
| `DEPLOYMENT.md` | 215 | General deployment overview |
| `VERCEL_DEPLOYMENT_GUIDE.md` | 736 | Complete Vercel + Firebase guide |
| `VERIFICATION_GUIDE.md` | 278 | Post-deployment verification steps |

### 5. 👥 User Guides
| File | Lines | Description |
|------|-------|-------------|
| `QR_USER_GUIDE.md` | 199 | End-user QR scanning guide |
| `MACHINE_001_PRODUCTS.md` | 273 | Sample machine product catalog |

### 6. 🔧 Development
| File | Lines | Description |
|------|-------|-------------|
| `CONTRIBUTING.md` | 507 | Contribution guidelines |
| `DEPENDENCIES.md` | 306 | Project dependencies explained |
| `RESPONSIVE_IMPROVEMENTS.md` | 180 | UI/UX improvements log |
| `PROJECT_STATUS.md` | 291 | Current project status |
| `PROJECT_READY.md` | 306 | Production readiness checklist |
| `GITHUB_CHECKLIST.md` | 344 | Pre-push checklist |

---

## 🆕 Latest Features (v2.0)

### Analytics Dashboard
The Admin Dashboard now includes comprehensive analytics:

#### Stock Distribution Charts
- **Pie Chart**: Visual breakdown of stock levels
  - Healthy (>5 units) - Green
  - Low (3-5 units) - Yellow
  - Critical (1-2 units) - Orange
  - Out of Stock - Gray

#### Sales Analytics
- **Bar Charts**: 
  - Sales by Category
  - Top Selling Products
  - Machine-wise Overview
- **Area Charts**: Stock vs Sales comparison

#### Trending Analysis
- **Donut Chart**: Trending vs Regular products
- Real-time trending badge indicators

#### Low Stock Alerts
- Sortable table of products needing attention
- Status indicators (Low/Critical/Out of Stock)
- Quick action buttons

---

## 📁 Project Structure

```
project1/
├── 📂 frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   │   ├── HomePage.jsx     # QR Scanner
│   │   │   ├── MachinePage.jsx  # Product listing
│   │   │   ├── AdminDashboard.jsx # 🆕 Analytics Dashboard
│   │   │   └── QRGeneratorPage.jsx
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API integrations
│   │   └── config/              # App configuration
│   └── package.json
│
├── 📂 functions/                # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts             # Function exports
│   │   ├── createOrder.ts       # Payment order creation
│   │   ├── verifyPayment.ts     # Payment verification
│   │   ├── dispense.ts          # Machine dispensing
│   │   ├── adminProducts.ts     # 🆕 Admin CRUD operations
│   │   ├── stockAlerts.ts       # 🆕 Stock alert system
│   │   └── esp8266Sync.ts       # 🆕 IoT integration
│   └── package.json
│
├── 📂 esp8266/                  # 🆕 IoT Hardware Code
│   ├── esp8266_dispense.ino     # Arduino sketch
│   └── README.md
│
├── 📂 emulator-data/            # Firebase emulator data
│
└── 📄 Configuration Files
    ├── firebase.json
    ├── firestore.rules
    ├── vercel.json
    └── package.json
```

---

## 🔐 Environment Variables

### Frontend (.env)
```env
REACT_APP_FIREBASE_API_KEY=xxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=xxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxx
REACT_APP_FIREBASE_APP_ID=xxx
REACT_APP_RAZORPAY_KEY_ID=rzp_xxx
REACT_APP_API_BASE_URL=https://xxx.cloudfunctions.net/api
REACT_APP_ENV=production
```

### Functions (.env)
```env
RAZORPAY_KEY_ID=rzp_xxx
RAZORPAY_KEY_SECRET=xxx
NODE_ENV=production
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Firebase rules deployed
- [ ] No sensitive data in code

### Firebase Deployment
```bash
firebase login
firebase deploy --only firestore:rules,functions
```

### Vercel Deployment
1. Connect GitHub repo to Vercel
2. Set root directory: `frontend`
3. Add environment variables
4. Deploy

### Post-Deployment
- [ ] Verify payment flow
- [ ] Test QR scanning
- [ ] Check analytics dashboard
- [ ] Verify stock updates

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/createOrder` | POST | Create Razorpay order |
| `/api/verifyPayment` | POST | Verify payment signature |
| `/api/dispense` | POST | Trigger product dispensing |
| `/api/products` | GET | Get all products |
| `/api/products` | POST | Create product (Admin) |
| `/api/products/:id` | PUT | Update product (Admin) |
| `/api/products/:id` | DELETE | Delete product (Admin) |
| `/api/products/:id/stock` | PATCH | Update stock level |
| `/api/alerts` | GET | Get stock alerts |
| `/api/alerts/:id/acknowledge` | POST | Acknowledge alert |
| `/api/alerts/:id/resolve` | POST | Resolve alert |
| `/api/machines` | GET | Get all machines |
| `/api/lowstock` | GET | Get low stock products |
| `/api/checkstock` | POST | Scan all stock levels |

---

## 🧪 Testing

### Test Payment Cards (Razorpay)
| Card Number | Result |
|-------------|--------|
| 4111 1111 1111 1111 | Success |
| 4000 0000 0000 0002 | Decline |

### Test URLs
- Local: `http://localhost:3000/machine/machine-001`
- Admin: `http://localhost:3000/admin`

---

## 📞 Support

For issues or questions:
1. Check [PAYMENT_TROUBLESHOOTING.md](PAYMENT_TROUBLESHOOTING.md)
2. Review [COMPLETE_DOCUMENTATION.md](COMPLETE_DOCUMENTATION.md)
3. Open a GitHub issue

---

## 📈 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Feb 2026 | Initial release |
| 2.0.0 | Mar 2026 | Analytics Dashboard, ESP8266 integration, Admin CRUD |

---

*Total Documentation: ~8,800+ lines across 19 markdown files*
