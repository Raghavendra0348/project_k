/**
 * Vercel Serverless Function - Get All Machines (Admin)
 * GET /api/admin/machines
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
