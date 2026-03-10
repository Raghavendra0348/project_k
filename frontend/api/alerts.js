/**
 * Vercel Serverless Function - Stock Alerts
 * GET /api/alerts - Get all alerts
 * POST /api/alerts - Acknowledge/Resolve alerts
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

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

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { status } = req.query;

      let query = db.collection('stockAlerts').orderBy('createdAt', 'desc');
      
      if (status && status !== 'all') {
        query = query.where('status', '==', status);
      }

      const snapshot = await query.limit(100).get();
      
      const alerts = [];
      snapshot.forEach((doc) => {
        alerts.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return res.status(200).json({
        success: true,
        data: alerts,
      });
    }

    if (req.method === 'POST') {
      const { alertId, action } = req.body;

      if (!alertId || !action) {
        return res.status(400).json({
          success: false,
          error: 'Missing alertId or action',
        });
      }

      const alertRef = db.collection('stockAlerts').doc(alertId);

      if (action === 'acknowledge') {
        await alertRef.update({
          status: 'acknowledged',
          acknowledgedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else if (action === 'resolve') {
        await alertRef.update({
          status: 'resolved',
          resolvedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      return res.status(200).json({
        success: true,
        message: `Alert ${action}d successfully`,
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Error with alerts:', error);
    return res.status(500).json({
      success: false,
      error: `Failed: ${error.message}`,
    });
  }
}
