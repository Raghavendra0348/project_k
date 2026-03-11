/**
 * GET /api/admin-products - Get all products (admin)
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

                        console.log(`[${new Date().toISOString()}] GET /api/admin-products - Retrieved ${products.length} products`);

                        return res.status(200).json({
                                success: true,
                                data: products,
                        });
                } catch (error) {
                        console.error(`[${new Date().toISOString()}] Error fetching products:`, error);
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
};
