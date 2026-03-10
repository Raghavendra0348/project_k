/**
 * Vercel Serverless Function - Verify Payment
 * POST /api/verifyPayment
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

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

// Verify Razorpay signature
function verifySignature(orderId, paymentId, signature) {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      productId,
      machineId,
      internalOrderId,
    } = req.body;

    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !productId || !machineId || !internalOrderId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Verify Razorpay signature
    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      console.error('Payment signature verification FAILED!');
      
      await db.collection('orders').doc(internalOrderId).update({
        paymentStatus: 'failed',
        failureReason: 'Signature verification failed',
        updatedAt: FieldValue.serverTimestamp(),
      });

      return res.status(400).json({
        success: false,
        error: 'Payment verification failed. Please contact support if amount was deducted.',
      });
    }

    // Atomic stock update with transaction
    const productRef = db.collection('products').doc(productId);
    const orderRef = db.collection('orders').doc(internalOrderId);

    try {
      await db.runTransaction(async (transaction) => {
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists) {
          throw new Error('Product not found');
        }

        const product = productDoc.data();

        if (product.machineId !== machineId) {
          throw new Error('Product machine mismatch');
        }

        if (product.stock <= 0) {
          throw new Error('Product is out of stock');
        }

        const orderDoc = await transaction.get(orderRef);

        if (!orderDoc.exists) {
          throw new Error('Order not found');
        }

        const order = orderDoc.data();

        if (order.razorpayOrderId !== razorpay_order_id) {
          throw new Error('Order ID mismatch');
        }

        if (order.paymentStatus === 'success') {
          throw new Error('Order already processed');
        }

        // Atomic updates
        transaction.update(productRef, {
          stock: FieldValue.increment(-1),
          updatedAt: FieldValue.serverTimestamp(),
        });

        transaction.update(orderRef, {
          paymentStatus: 'success',
          razorpayPaymentId: razorpay_payment_id,
          verifiedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
    } catch (transactionError) {
      console.error('Transaction failed:', transactionError);

      if (transactionError.message.includes('out of stock')) {
        // Initiate refund
        try {
          const refund = await razorpay.payments.refund(razorpay_payment_id, {
            speed: 'normal',
            notes: {
              reason: 'Product out of stock during transaction',
              orderId: internalOrderId,
            },
          });

          await db.collection('orders').doc(internalOrderId).update({
            paymentStatus: 'failed',
            failureReason: 'Out of stock during transaction',
            refundId: refund.id,
            refundStatus: 'initiated',
            updatedAt: FieldValue.serverTimestamp(),
          });
        } catch (refundError) {
          console.error('Refund failed:', refundError);
        }

        return res.status(400).json({
          success: false,
          error: 'Product went out of stock. Refund will be processed.',
        });
      }

      if (transactionError.message.includes('already processed')) {
        return res.status(400).json({
          success: false,
          error: 'This order has already been processed.',
        });
      }

      throw transactionError;
    }

    // Add to dispense queue for ESP8266
    const dispenseCommand = {
      orderId: internalOrderId,
      machineId,
      productId,
      status: 'pending',
      command: 'DISPENSE',
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)),
    };

    const dispenseRef = await db.collection('dispenseQueue').add(dispenseCommand);

    await db.collection('orders').doc(internalOrderId).update({
      dispenseInitiated: true,
      dispenseQueueId: dispenseRef.id,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      success: true,
      orderId: internalOrderId,
      dispenseId: dispenseRef.id,
      message: 'Payment successful! Your product will be dispensed.',
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      error: `Payment verification failed: ${error.message}`,
    });
  }
}
