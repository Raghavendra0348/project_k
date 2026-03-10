/**
 * Vercel Serverless Function - Get Low Stock Products (Admin)
 * GET /api/admin/low-stock
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
        try {
                admin.initializeApp({
                        credential: admin.credential.cert({
                                projectId: process.env.FIREBASE_PROJECT_ID,
                                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                                privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
                        }),
                });
        } catch (error) {
                console.error('Firebase initialization error:', error.message);
        }
}

const db = admin.firestore();

module.exports = async (req, res) => {
        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
                return res.status(200).end();
        }

        if (req.method !== 'GET') {
                return res.status(405).json({ success: false, error: 'Method not allowed' });
        }

        try {
                const threshold = 3; // Default threshold

                const snapshot = await db.collection('products')
                        .where('stock', '<=', threshold)
                        .get();

                const lowStockProducts = [];
                snapshot.forEach((doc) => {
                        lowStockProducts.push({
                                id: doc.id,
                                ...doc.data(),
                        });
                });

                return res.status(200).json({
                        success: true,
                        data: lowStockProducts,
                        threshold: threshold,
                });
        } catch (error) {
                console.error('Error fetching low stock products:', error);
                return res.status(500).json({
                        success: false,
                        error: error.message,
                });
        }
};
