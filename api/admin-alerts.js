/**
 * GET /api/admin-alerts - Get stock alerts (admin)
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
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
                return res.status(200).end();
        }

        if (req.method === 'GET') {
                try {
                        const { status } = req.query;
                        let query = db.collection('stockAlerts');

                        if (status && status !== 'all') {
                                query = query.where('status', '==', status);
                        }

                        const snapshot = await query.get();
                        const alerts = [];

                        snapshot.forEach((doc) => {
                                alerts.push({
                                        id: doc.id,
                                        ...doc.data(),
                                });
                        });

                        console.log(`[${new Date().toISOString()}] GET /api/admin-alerts - Retrieved ${alerts.length} alerts`);

                        return res.status(200).json({
                                success: true,
                                data: alerts,
                        });
                } catch (error) {
                        console.error(`[${new Date().toISOString()}] Error fetching alerts:`, error);
                        return res.status(500).json({
                                success: false,
                                error: error.message,
                        });
                }
        } else {
                return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
};
