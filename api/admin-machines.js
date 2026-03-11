/**
 * GET /api/admin-machines - Get all machines (admin)
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
                const snapshot = await db.collection('machines').get();
                const machines = [];

                snapshot.forEach((doc) => {
                        machines.push({
                                id: doc.id,
                                ...doc.data(),
                        });
                });

                console.log(`[${new Date().toISOString()}] GET /api/admin-machines - Retrieved ${machines.length} machines`);

                return res.status(200).json({
                        success: true,
                        data: machines,
                });
        } catch (error) {
                console.error(`[${new Date().toISOString()}] Error fetching machines:`, error);
                return res.status(500).json({
                        success: false,
                        error: error.message,
                });
        }
};
