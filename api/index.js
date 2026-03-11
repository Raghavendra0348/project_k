/**
 * API Gateway Router
 * Routes all /api requests to appropriate handlers
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin once
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

// CORS middleware
function setCORS(res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
        setCORS(res);

        if (req.method === 'OPTIONS') {
                return res.status(200).end();
        }

        const { pathname } = new URL(req.url, `http://${req.headers.host}`);
        console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);

        try {
                // Route: GET /api/admin-products
                if (pathname === '/api/admin-products' && req.method === 'GET') {
                        const { machineId } = req.query || {};
                        let query = db.collection('products');

                        if (machineId && machineId !== 'all') {
                                query = query.where('machineId', '==', machineId);
                        }

                        const snapshot = await query.get();
                        const products = [];

                        snapshot.forEach((doc) => {
                                products.push({
                                        id: doc.id,
                                        ...doc.data(),
                                });
                        });

                        console.log(`Retrieved ${products.length} products`);
                        return res.status(200).json({ success: true, data: products });
                }

                // Route: GET /api/admin-machines
                if (pathname === '/api/admin-machines' && req.method === 'GET') {
                        const snapshot = await db.collection('machines').get();
                        const machines = [];

                        snapshot.forEach((doc) => {
                                machines.push({
                                        id: doc.id,
                                        ...doc.data(),
                                });
                        });

                        console.log(`Retrieved ${machines.length} machines`);
                        return res.status(200).json({ success: true, data: machines });
                }

                // Route: GET /api/admin-alerts
                if (pathname === '/api/admin-alerts' && req.method === 'GET') {
                        const { status } = req.query || {};
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

                        console.log(`Retrieved ${alerts.length} alerts`);
                        return res.status(200).json({ success: true, data: alerts });
                }

                // Route: GET /api/admin-low-stock
                if (pathname === '/api/admin-low-stock' && req.method === 'GET') {
                        const { threshold } = req.query || {};
                        const stock_threshold = threshold ? parseInt(threshold) : 10;

                        const snapshot = await db.collection('products').where('stock', '<', stock_threshold).get();
                        const lowStockProducts = [];

                        snapshot.forEach((doc) => {
                                lowStockProducts.push({
                                        id: doc.id,
                                        ...doc.data(),
                                });
                        });

                        console.log(`Retrieved ${lowStockProducts.length} low stock products`);
                        return res.status(200).json({ success: true, data: lowStockProducts });
                }

                // Route: GET /api/health
                if (pathname === '/api/health') {
                        return res.status(200).json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
                }

                // Not found
                return res.status(404).json({ success: false, error: 'Endpoint not found' });

        } catch (error) {
                console.error(`Error handling ${pathname}:`, error);
                return res.status(500).json({
                        success: false,
                        error: error.message,
                });
        }
};
