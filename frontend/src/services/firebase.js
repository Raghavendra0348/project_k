/**
 * Firebase Configuration & Initialization
 * 
 * Sets up Firebase SDK with Firestore for real-time database access.
 * All Firebase-related imports should come from this file.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// ============================================
// FIREBASE CONFIGURATION
// ============================================

/**
 * Firebase configuration object
 * Values come from environment variables for security
 */
const firebaseConfig = {
  apiKey: "AIzaSyDuE7R5NI01rQdYY5BrPKfoMqK9bcRYo84",
  authDomain: "vending-machine-web.firebaseapp.com",
  projectId: "vending-machine-web",
  storageBucket: "vending-machine-web.firebasestorage.app",
  messagingSenderId: "188303260362",
  appId: "1:188303260362:web:bbecd754740724c0cdd233"
};

// ============================================
// INITIALIZE FIREBASE
// ============================================

/**
 * Initialize Firebase app
 */
const app = initializeApp(firebaseConfig);

/**
 * Initialize Firestore database
 */
const db = getFirestore(app);

// ============================================
// EMULATOR CONNECTION (DEVELOPMENT ONLY)
// ============================================

/**
 * Connect to Firestore emulator in development
 * This allows testing without affecting production data
 */
if (process.env.REACT_APP_ENV === 'development' && process.env.REACT_APP_USE_EMULATOR === 'true') {
        try {
                connectFirestoreEmulator(db, 'localhost', 8080);
                console.log('🔧 Connected to Firestore Emulator');
        } catch (error) {
                // Emulator already connected (happens in hot reload)
                console.log('Firestore emulator connection skipped (already connected)');
        }
}

// ============================================
// EXPORTS
// ============================================

export { db };
export default app;
