/**
 * Catch-all API route handler for Vercel
 * Handles all /api/* requests
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

module.exports = async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
                return res.status(200).end();
        }

        const slug = req.query.slug || [];
        const pathname = '/' + (Array.isArray(slug) ? slug.join('/') : slug);

        // Parse request body for POST, PUT, PATCH
        let body = null;
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                if (typeof req.body === 'string') {
                        try {
                                body = JSON.parse(req.body);
                        } catch (e) {
                                body = req.body;
                        }
                } else {
                        body = req.body;
                }
        }

        // Attach parsed body to req for route handlers
        req.body = body;

        console.log(`[${new Date().toISOString()}] ${req.method} /api${pathname}`);

        try {
                // Route: GET /api/admin-products
                if (pathname === '/admin-products' && req.method === 'GET') {
                        const { machineId } = req.query;
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
                if (pathname === '/admin-machines' && req.method === 'GET') {
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
                if (pathname === '/admin-alerts' && req.method === 'GET') {
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

                        console.log(`Retrieved ${alerts.length} alerts`);
                        return res.status(200).json({ success: true, data: alerts });
                }

                // Route: GET /api/admin-low-stock
                if (pathname === '/admin-low-stock' && req.method === 'GET') {
                        const { threshold } = req.query;
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

                // Route: PUT /api/admin/products/{productId}
                const productUpdateMatch = pathname.match(/^\/admin\/products\/([a-zA-Z0-9\-]+)$/);
                if (productUpdateMatch && req.method === 'PUT') {
                        const productId = productUpdateMatch[1];
                        const updates = req.body;

                        await db.collection('products').doc(productId).update(updates);

                        console.log(`Updated product ${productId}`);
                        return res.status(200).json({ success: true, message: 'Product updated', id: productId });
                }

                // Route: PATCH /api/admin/products/{productId}/stock
                const stockUpdateMatch = pathname.match(/^\/admin\/products\/([a-zA-Z0-9\-]+)\/stock$/);
                if (stockUpdateMatch && req.method === 'PATCH') {
                        const productId = stockUpdateMatch[1];
                        const { stock } = req.body;

                        if (typeof stock === 'undefined') {
                                return res.status(400).json({ success: false, error: 'Stock quantity required' });
                        }

                        await db.collection('products').doc(productId).update({ stock });

                        console.log(`Updated stock for product ${productId} to ${stock}`);
                        return res.status(200).json({ success: true, message: 'Stock updated', stock });
                }

                // Route: DELETE /api/admin/products/{productId}
                const productDeleteMatch = pathname.match(/^\/admin\/products\/([a-zA-Z0-9\-]+)$/);
                if (productDeleteMatch && req.method === 'DELETE') {
                        const productId = productDeleteMatch[1];

                        await db.collection('products').doc(productId).delete();

                        console.log(`Deleted product ${productId}`);
                        return res.status(200).json({ success: true, message: 'Product deleted', id: productId });
                }

                // Route: GET /api/health
                if (pathname === '/health') {
                        return res.status(200).json({ success: true, status: 'OK', timestamp: new Date().toISOString() });
                }

                // Not found
                console.log(`Path not found: /api${pathname}`);
                return res.status(404).json({ success: false, error: `Endpoint not found: /api${pathname}`, path: pathname });

        } catch (error) {
                console.error(`Error handling /api${pathname}:`, error);
                return res.status(500).json({
                        success: false,
                        error: error.message,
                });
        }
};
