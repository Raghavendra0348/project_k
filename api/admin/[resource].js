/**
 * Dynamic API route handler for /api/admin/*
 * Handles: /api/admin/products, /api/admin/machines, /api/admin/alerts, /api/admin/low-stock
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
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
                return res.status(200).end();
        }

        const { resource } = req.query;
        console.log(`[${new Date().toISOString()}] ${req.method} /api/admin/${resource}`);

        try {
                // Route to appropriate handler based on resource
                switch (resource) {
                        case 'products':
                                return handleProducts(req, res);
                        case 'machines':
                                return handleMachines(req, res);
                        case 'alerts':
                                return handleAlerts(req, res);
                        case 'low-stock':
                                return handleLowStock(req, res);
                        default:
                                return res.status(404).json({ success: false, error: 'Resource not found' });
                }
        } catch (error) {
                console.error(`Error handling ${resource}:`, error);
                return res.status(500).json({
                        success: false,
                        error: error.message,
                });
        }
};

// ==================== PRODUCTS ====================
async function handleProducts(req, res) {
        if (req.method === 'GET') {
                try {
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
                        return res.status(200).json({
                                success: true,
                                data: products,
                        });
                } catch (error) {
                        console.error('Error fetching products:', error);
                        return res.status(500).json({
                                success: false,
                                error: error.message,
                        });
                }
        } else if (req.method === 'POST') {
                try {
                        const { name, price, stock, category, machineId, imageUrl, description, trending, season, salesData } = req.body;

                        if (!name || !machineId) {
                                return res.status(400).json({
                                        success: false,
                                        error: 'Missing required fields: name, machineId',
                                });
                        }

                        const productData = {
                                name,
                                price: price || 0,
                                stock: stock || 0,
                                category: category || 'general',
                                machineId,
                                imageUrl: imageUrl || '',
                                description: description || '',
                                trending: trending || { isTrending: false, rank: 0 },
                                season: season || 'all-season',
                                salesData: salesData || { lastWeek: 0, trend: 'stable', percentChange: 0 },
                                createdAt: new Date(),
                                updatedAt: new Date(),
                        };

                        const docRef = await db.collection('products').add(productData);

                        return res.status(201).json({
                                success: true,
                                data: {
                                        id: docRef.id,
                                        ...productData,
                                },
                        });
                } catch (error) {
                        console.error('Error creating product:', error);
                        return res.status(500).json({
                                success: false,
                                error: error.message,
                        });
                }
        } else {
                return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
}

// ==================== MACHINES ====================
async function handleMachines(req, res) {
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

                console.log(`Retrieved ${machines.length} machines`);
                return res.status(200).json({
                        success: true,
                        data: machines,
                });
        } catch (error) {
                console.error('Error fetching machines:', error);
                return res.status(500).json({
                        success: false,
                        error: error.message,
                });
        }
}

// ==================== ALERTS ====================
async function handleAlerts(req, res) {
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

                        console.log(`Retrieved ${alerts.length} alerts`);
                        return res.status(200).json({
                                success: true,
                                data: alerts,
                        });
                } catch (error) {
                        console.error('Error fetching alerts:', error);
                        return res.status(500).json({
                                success: false,
                                error: error.message,
                        });
                }
        } else {
                return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
}

// ==================== LOW STOCK ====================
async function handleLowStock(req, res) {
        if (req.method !== 'GET') {
                return res.status(405).json({ success: false, error: 'Method not allowed' });
        }

        try {
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
                return res.status(200).json({
                        success: true,
                        data: lowStockProducts,
                });
        } catch (error) {
                console.error('Error fetching low stock products:', error);
                return res.status(500).json({
                        success: false,
                        error: error.message,
                });
        }
}
