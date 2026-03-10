/**
 * Vercel Serverless Function - Create Order
 * POST /api/createOrder
 */

import Razorpay from 'razorpay';
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

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { productId, machineId } = req.body;

    // Validate input
    if (!productId || !machineId) {
      return res.status(400).json({
        success: false,
        error: 'Missing productId or machineId',
      });
    }

    // Fetch product from Firestore
    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    const product = productDoc.data();

    // Verify product belongs to machine
    if (product.machineId !== machineId) {
      return res.status(400).json({
        success: false,
        error: 'Product not available in this machine',
      });
    }

    // Check stock
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Product is out of stock',
      });
    }

    // Create Razorpay order
    const amountInPaise = Math.round(product.price * 100);
    const timestamp = Date.now().toString().slice(-8);
    const receiptId = `vm_${machineId}_${timestamp}`.slice(0, 40);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        productId,
        machineId,
        productName: product.name,
      },
    });

    // Create pending order in Firestore
    const orderData = {
      productId,
      machineId,
      productName: product.name,
      amount: amountInPaise,
      currency: 'INR',
      razorpayOrderId: razorpayOrder.id,
      razorpayPaymentId: null,
      paymentStatus: 'pending',
      dispensed: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const orderRef = await db.collection('orders').add(orderData);

    return res.status(200).json({
      success: true,
      orderId: orderRef.id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      productName: product.name,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      error: `Failed to create order: ${error.message}`,
    });
  }
}
