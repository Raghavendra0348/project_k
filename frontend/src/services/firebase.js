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
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID,
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
                // Use network IP for mobile access, localhost for desktop
                const emulatorHost = process.env.REACT_APP_EMULATOR_HOST || '10.33.184.164';
                connectFirestoreEmulator(db, emulatorHost, 8080);
                console.log(`🔧 Connected to Firestore Emulator at ${emulatorHost}:8080`);
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
