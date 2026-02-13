# 📦 Dependencies Documentation

Complete list of all project dependencies and their purposes.

---

## 🎨 Frontend Dependencies

### Production Dependencies

#### Core Framework
- **react** (^18.2.0) - JavaScript library for building user interfaces
- **react-dom** (^18.2.0) - React package for working with the DOM
- **react-router-dom** (^6.18.0) - Routing library for React

#### Firebase
- **firebase** (^10.5.2) - Firebase SDK for web
  - Firestore (real-time database)
  - Hosting
  - Cloud Functions client

#### UI Components & Icons
- **lucide-react** (^0.292.0) - Icon library with React components
- **react-hot-toast** (^2.4.1) - Toast notifications

#### QR Code Functionality
- **react-qr-reader** (^3.0.0-beta-1) - QR code scanner component
- **qrcode** (latest) - QR code generator library

### Development Dependencies

#### Build Tools
- **react-scripts** (^5.0.1) - Scripts and configuration for Create React App

#### Styling
- **tailwindcss** (^3.3.5) - Utility-first CSS framework
- **postcss** (^8.4.31) - CSS transformation tool
- **autoprefixer** (^10.4.16) - PostCSS plugin to add vendor prefixes

#### Type Definitions
- **@types/react** (^18.2.37) - TypeScript definitions for React
- **@types/react-dom** (^18.2.15) - TypeScript definitions for React DOM

---

## ⚙️ Backend Dependencies (Firebase Functions)

### Production Dependencies

#### Firebase
- **firebase-admin** (^11.11.0) - Firebase Admin SDK for server-side
- **firebase-functions** (^4.9.0) - Cloud Functions SDK

#### API Framework
- **express** (^4.18.2) - Web application framework

#### Payment Processing
- **razorpay** (^2.9.2) - Razorpay payment gateway SDK

#### Utilities
- **cors** (^2.8.5) - CORS middleware

### Development Dependencies

#### TypeScript
- **typescript** (^4.9.5) - TypeScript compiler
- **@types/express** - Type definitions for Express
- **@types/cors** - Type definitions for CORS

#### Linting
- **eslint** (^8.57.0) - JavaScript linter
- **eslint-config-google** (^0.14.0) - Google's ESLint config

---

## 📊 Dependency Tree

```
Frontend (frontend/package.json)
├── react@18.2.0
│   └── react-dom@18.2.0
├── react-router-dom@6.18.0
├── firebase@10.5.2
├── lucide-react@0.292.0
├── react-hot-toast@2.4.1
├── react-qr-reader@3.0.0-beta-1
├── qrcode@latest
└── [dev] react-scripts@5.0.1
    ├── tailwindcss@3.3.5
    ├── postcss@8.4.31
    └── autoprefixer@10.4.16

Backend (functions/package.json)
├── firebase-admin@11.11.0
├── firebase-functions@4.9.0
├── express@4.18.2
├── razorpay@2.9.2
├── cors@2.8.5
└── [dev] typescript@4.9.5
    └── eslint@8.57.0
        └── eslint-config-google@0.14.0
```

---

## 🔄 Installing Dependencies

### Initial Setup

```bash
# Install all dependencies
cd frontend && npm install
cd ../functions && npm install
```

### Add New Dependency

```bash
# Frontend production dependency
cd frontend
npm install package-name

# Frontend dev dependency
npm install --save-dev package-name

# Backend production dependency
cd functions
npm install package-name

# Backend dev dependency
npm install --save-dev package-name
```

### Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Update specific package
npm update package-name

# Update all packages (be careful!)
npm update

# Use npm-check-updates for major versions
npx npm-check-updates -u
npm install
```

---

## 🔒 Security Considerations

### Known Vulnerabilities

Check for security issues:
```bash
npm audit
```

Fix automatically:
```bash
npm audit fix
```

### Recommended Versions

- **Node.js**: v18.x or v20.x (LTS)
- **npm**: v8.x or higher
- **React**: v18.x (latest stable)
- **Firebase**: v10.x (latest major)

---

## 📝 Dependency Notes

### Why These Packages?

#### react-qr-reader
- Used for camera-based QR scanning
- Supports modern browsers
- Uses native getUserMedia API
- **Note**: Legacy peer deps required (`--legacy-peer-deps`)

#### firebase@10.5.2
- Modular SDK (tree-shakeable)
- Smaller bundle size
- Real-time updates via Firestore
- Works with Firebase v9+ config

#### razorpay
- Official Razorpay SDK
- Supports UPI, cards, wallets
- Built-in signature verification
- PCI DSS compliant

#### tailwindcss
- Utility-first approach
- Smaller production CSS
- No runtime overhead
- Great for rapid development

#### lucide-react
- Modern icon set
- Tree-shakeable (import only what you need)
- Customizable with props
- Active maintenance

---

## ⚠️ Important Notes

### Legacy Peer Dependencies

Some packages require `--legacy-peer-deps` flag:

```bash
npm install react-qr-reader --legacy-peer-deps
npm install qrcode --legacy-peer-deps
```

This is due to React 18 compatibility issues with older packages.

### Firebase Version Compatibility

- **firebase** (client SDK): v10.x
- **firebase-admin** (server SDK): v11.x
- **firebase-functions**: v4.x

These must be compatible. Check Firebase release notes when updating.

### TypeScript in Functions

All functions use TypeScript, which compiles to JavaScript in `lib/` folder.

Build before deploying:
```bash
cd functions
npm run build
```

---

## 🔧 Package Scripts

### Frontend Scripts

```json
{
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject"
}
```

### Backend Scripts

```json
{
  "build": "tsc",
  "serve": "npm run build && firebase emulators:start --only functions",
  "shell": "npm run build && firebase functions:shell",
  "start": "npm run shell",
  "deploy": "firebase deploy --only functions",
  "logs": "firebase functions:log",
  "seed": "tsx src/scripts/seedData.ts"
}
```

---

## 📈 Bundle Size Optimization

### Frontend Bundle Analysis

```bash
cd frontend
npm install --save-dev source-map-explorer
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

### Reducing Bundle Size

- ✅ Use dynamic imports for routes
- ✅ Import only needed Lucide icons
- ✅ Enable code splitting
- ✅ Use production build
- ✅ Remove unused dependencies

---

## 🆕 Updating This Document

When adding/removing dependencies:

1. Update this file
2. Document why it's needed
3. Note any special installation steps
4. Update version compatibility info

---

**Last Updated**: February 2026
