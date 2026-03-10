/**
 * Vercel Serverless Function - Low Stock Products
 * GET /api/lowstock
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

const LOW_STOCK_THRESHOLD = 3;

export default async function handler(req, res) {
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
    // Get products with low stock
    const productsSnapshot = await db
      .collection('products')
      .where('stock', '<=', LOW_STOCK_THRESHOLD)
      .get();

    // Get all machines for location info
    const machinesSnapshot = await db.collection('machines').get();
    const machinesMap = {};
    machinesSnapshot.forEach((doc) => {
      machinesMap[doc.id] = doc.data();
    });

    const lowStockProducts = [];
    productsSnapshot.forEach((doc) => {
      const product = doc.data();
      const machine = machinesMap[product.machineId];
      lowStockProducts.push({
        product: {
          id: doc.id,
          ...product,
        },
        machineLocation: machine?.location || product.machineId,
      });
    });

    // Sort by stock (lowest first)
    lowStockProducts.sort((a, b) => a.product.stock - b.product.stock);

    return res.status(200).json({
      success: true,
      data: lowStockProducts,
      threshold: LOW_STOCK_THRESHOLD,
    });
  } catch (error) {
    console.error('Error fetching low stock:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to fetch low stock products: ${error.message}`,
    });
  }
}
