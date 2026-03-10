/**
 * Vercel Serverless Function - Get Stock Alerts (Admin)
 * GET /api/admin/alerts
 * POST /api/admin/alerts/{id}/acknowledge
 * POST /api/admin/alerts/{id}/resolve
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

export default async function handler(req, res) {
        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
                return res.status(200).end();
        }

        if (req.method === 'GET') {
                return handleGetAlerts(req, res);
        } else if (req.method === 'POST') {
                return handlePostAlert(req, res);
        } else {
                return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
}

async function handleGetAlerts(req, res) {
        try {
                const { status } = req.query;

                let query = db.collection('stockAlerts');

                if (status && status !== 'all') {
                        query = query.where('status', '==', status);
                }

                const snapshot = await query.orderBy('createdAt', 'desc').get();

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
                        count: alerts.length,
                });
        } catch (error) {
                console.error('Error fetching alerts:', error);
                return res.status(500).json({
                        success: false,
                        error: error.message,
                });
        }
}

async function handlePostAlert(req, res) {
        try {
                const { id } = req.query;
                const { action } = req.body;

                if (!id || !action) {
                        return res.status(400).json({
                                success: false,
                                error: 'Missing required fields: id, action',
                        });
                }

                const alertRef = db.collection('stockAlerts').doc(id);
                const updateData = { updatedAt: new Date() };

                if (action === 'acknowledge') {
                        updateData.status = 'acknowledged';
                        updateData.acknowledgedAt = new Date();
                } else if (action === 'resolve') {
                        updateData.status = 'resolved';
                        updateData.resolvedAt = new Date();
                } else {
                        return res.status(400).json({
                                success: false,
                                error: 'Invalid action. Must be "acknowledge" or "resolve"',
                        });
                }

                await alertRef.update(updateData);

                return res.status(200).json({
                        success: true,
                        message: `Alert ${action}d successfully`,
                });
        } catch (error) {
                console.error('Error updating alert:', error);
                return res.status(500).json({
                        success: false,
                        error: error.message,
                });
        }
}
