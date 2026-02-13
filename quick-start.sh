#!/bin/bash

# QR Vending Machine - Quick Start Script
# This script helps you get started quickly with the project

set -e  # Exit on error

echo "🏭 QR-Based Vending Machine System - Quick Start"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js detected: $NODE_VERSION"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm detected: $NPM_VERSION"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "⚠️  Firebase CLI not found. Installing globally..."
    npm install -g firebase-tools
    echo "✅ Firebase CLI installed"
else
    FIREBASE_VERSION=$(firebase --version)
    echo "✅ Firebase CLI detected: $FIREBASE_VERSION"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install frontend dependencies
echo "📱 Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo "✅ Frontend dependencies installed"

# Install backend dependencies
echo "⚙️  Installing backend dependencies..."
cd functions
npm install
cd ..
echo "✅ Backend dependencies installed"

echo ""
echo "🔧 Setting up environment files..."

# Check if .env files exist
if [ ! -f "frontend/.env" ]; then
    echo "Creating frontend/.env from template..."
    cp frontend/.env.example frontend/.env
    echo "⚠️  Please edit frontend/.env with your Firebase credentials"
fi

if [ ! -f "functions/.env" ]; then
    echo "Creating functions/.env from template..."
    cp functions/.env.example functions/.env
    echo "⚠️  Please edit functions/.env with your Razorpay credentials"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Configure environment variables:"
echo "   - Edit frontend/.env with Firebase config"
echo "   - Edit functions/.env with Razorpay keys"
echo ""
echo "2. Login to Firebase:"
echo "   firebase login"
echo ""
echo "3. Initialize Firebase (if not done):"
echo "   firebase init"
echo ""
echo "4. Seed database (optional but recommended):"
echo "   cd functions && npm run seed"
echo ""
echo "5. Start development servers:"
echo ""
echo "   Terminal 1 - Frontend:"
echo "   cd frontend && npm start"
echo ""
echo "   Terminal 2 - Backend:"
echo "   firebase emulators:start"
echo ""
echo "6. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For detailed instructions, see SETUP.md"
echo ""
echo "🎉 Happy coding!"
