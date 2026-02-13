# 🚀 Setup & Installation Guide

Complete guide to set up and run the QR-Based Vending Machine System locally and in production.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher recommended, v20 ideal)
  - Check: `node --version`
  - Download: https://nodejs.org/

- **npm** (comes with Node.js)
  - Check: `npm --version`

- **Firebase CLI**
  ```bash
  npm install -g firebase-tools
  ```
  - Check: `firebase --version`

- **Git**
  - Check: `git --version`

---

## 🔧 Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/project1.git
cd project1
```

### 2. Install Dependencies

Install dependencies for both frontend and backend:

```bash
# Install root dependencies (if any)
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../functions
npm install
```

### 3. Firebase Setup

#### a. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., "vending-machine-web")
4. Follow the setup wizard
5. Enable Google Analytics (optional)

#### b. Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose **Test mode** (for development) or **Production mode**
4. Select a location (e.g., asia-south1)

#### c. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register app with a nickname
5. Copy the configuration object

#### d. Initialize Firebase in Project

```bash
# Login to Firebase (if not already logged in)
firebase login

# Initialize Firebase in your project
firebase init
```

Select:
- ✅ Firestore
- ✅ Functions
- ✅ Hosting

Follow the prompts:
- Use existing project
- Select your Firebase project
- Accept defaults or customize as needed

### 4. Configure Environment Variables

#### Frontend Environment (`frontend/.env`)

Create `frontend/.env` file:

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env` with your Firebase config:

```env
# Get these from Firebase Console > Project Settings
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456:web:abc123

# For local development
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
REACT_APP_API_BASE_URL=http://localhost:5001/your-project-id/asia-south1/api
REACT_APP_ENV=development
```

#### Backend Environment (`functions/.env`)

Create `functions/.env` file:

```bash
cd ../functions
cp .env.example .env
```

Edit `functions/.env`:

```env
# Get from Razorpay Dashboard
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key

NODE_ENV=development
```

### 5. Razorpay Setup

#### a. Create Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up for a free account
3. Complete KYC (for production)

#### b. Get API Keys

1. Go to **Settings** > **API Keys**
2. Generate **Test Keys** for development
3. Copy **Key ID** and **Key Secret**
4. Add them to `functions/.env`

⚠️ **IMPORTANT**: 
- NEVER commit your secret keys to Git
- Use test keys for development
- Use live keys only in production

### 6. Seed Database (Optional but Recommended)

Populate your Firestore with test data:

```bash
cd functions
npm run seed
```

This creates:
- Test vending machines (machine-001, machine-002, etc.)
- Sample products with stock
- Product categories

---

## 🏃 Running the Project

### Development Mode (Local)

You need to run **two terminals** simultaneously:

#### Terminal 1: Frontend (React App)

```bash
cd frontend
npm start
```

The app will open at: http://localhost:3000

#### Terminal 2: Backend (Firebase Emulators)

```bash
# From project root
firebase emulators:start
```

This starts:
- **Functions**: http://localhost:5001
- **Firestore**: http://localhost:8080
- **Hosting**: http://localhost:5000
- **Emulator UI**: http://localhost:4000

### Verify Setup

1. Open http://localhost:3000
2. You should see the homepage with "Scan QR Code to Start"
3. Click development test machine links
4. Check if products load (requires database seeding)

---

## 🧪 Testing

### Test QR Code Flow

1. Visit http://localhost:3000/admin/qr-generator
2. Generate a QR code for `machine-001`
3. Download and display on another screen/phone
4. Go back to http://localhost:3000
5. Click "Scan QR Code to Start"
6. Scan the generated QR code
7. Verify redirection to machine page

### Test Payment Flow

1. Navigate to a machine page
2. Select a product
3. Click "Buy Now"
4. Use Razorpay test card:
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date
5. Verify stock updates in real-time

---

## 🚀 Deployment

### Build Frontend

```bash
cd frontend
npm run build
```

This creates an optimized production build in `frontend/build/`

### Deploy to Firebase

```bash
# From project root
firebase deploy
```

Or deploy specific services:

```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy only functions
firebase deploy --only functions

# Deploy only Firestore rules
firebase deploy --only firestore
```

### Production Environment Variables

Before deploying, update your `.env` files with production values:

**Frontend (`frontend/.env.production`)**:
```env
REACT_APP_FIREBASE_API_KEY=your_production_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456:web:abc123
REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
REACT_APP_API_BASE_URL=https://asia-south1-your-project.cloudfunctions.net/api
REACT_APP_ENV=production
```

**Backend Functions**:

Set production environment config:
```bash
firebase functions:config:set razorpay.key_id="rzp_live_xxxxxxxxxx"
firebase functions:config:set razorpay.key_secret="your_live_secret"
```

---

## 📦 Project Structure

```
project1/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API & Firebase services
│   │   ├── hooks/           # Custom React hooks
│   │   └── config/          # Configuration files
│   ├── .env.example         # Environment template
│   └── package.json         # Frontend dependencies
│
├── functions/               # Firebase Cloud Functions
│   ├── src/                 # TypeScript source
│   │   ├── utils/          # Utility functions
│   │   └── scripts/        # Database seeding
│   ├── lib/                # Compiled JavaScript (gitignored)
│   ├── .env.example        # Environment template
│   ├── package.json        # Backend dependencies
│   └── tsconfig.json       # TypeScript config
│
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore indexes
├── .gitignore             # Git ignore rules
├── README.md              # Project overview
├── SETUP.md               # This file
└── QR_USER_GUIDE.md       # User documentation
```

---

## 🔒 Security Checklist

Before pushing to GitHub or deploying:

- [ ] `.env` files are in `.gitignore`
- [ ] No hardcoded API keys in source code
- [ ] `rzp-key.csv` is in `.gitignore`
- [ ] Firebase service account JSON is in `.gitignore`
- [ ] Firestore security rules are configured
- [ ] Using test keys for development
- [ ] Production keys stored securely (not in repo)

---

## 🛠️ Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm start
```

### Firebase Emulators Won't Start

```bash
# Clear emulator data
firebase emulators:start --clear-data

# Check if ports are available
lsof -i :4000,5000,5001,8080
```

### Build Errors

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear React cache
rm -rf node_modules/.cache
```

### TypeScript Compilation Errors

```bash
cd functions
npm run build
```

Fix any TypeScript errors before deploying.

### Firestore Permission Denied

Check your `firestore.rules` file. For development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For development only!
    }
  }
}
```

⚠️ Change to proper security rules for production!

---

## 📞 Support

- **Firebase Documentation**: https://firebase.google.com/docs
- **Razorpay Documentation**: https://razorpay.com/docs
- **React Documentation**: https://react.dev

---

## 🎉 Success Checklist

After setup, you should be able to:

- [ ] Access frontend at http://localhost:3000
- [ ] See Firebase emulators running
- [ ] Generate QR codes at /admin/qr-generator
- [ ] Scan QR codes and navigate to machines
- [ ] Browse products with real-time stock
- [ ] Complete test payment
- [ ] See real-time updates across clients
- [ ] Deploy to Firebase successfully

---

**Happy coding! 🚀**
