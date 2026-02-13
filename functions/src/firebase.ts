/**
 * Firebase Admin Initialization
 *
 * Centralized Firebase Admin SDK initialization.
 * Import db and adminSDK from this file instead of index.ts to avoid circular dependencies.
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
        admin.initializeApp();
}

// Export Firestore instance
export const db = admin.firestore();

// Export Admin SDK for timestamp operations, etc.
export const adminSDK = admin;
