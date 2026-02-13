/**
 * Firebase Cloud Functions - Main Entry Point
 *
 * This file exports all cloud functions for the vending machine system.
 * Functions handle payment processing, order management, and machine communication.
 */

import * as functions from 'firebase-functions';
import cors from 'cors';
import express from 'express';
import { db, adminSDK as admin } from './firebase';

// Import function handlers
import { createOrderHandler } from './createOrder';
import { verifyPaymentHandler } from './verifyPayment';
import { dispenseHandler } from './dispense';
import { healthCheckHandler } from './health';

// ============================================
// EXPRESS APP SETUP WITH CORS
// ============================================
const app = express();

// Configure CORS to allow requests from any origin (for QR code scanning from any device)
const corsOptions: cors.CorsOptions = {
  origin: true, // Allow all origins in development; restrict in production
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ============================================
// API ROUTES
// ============================================

/**
 * Health Check Endpoint
 * GET /health
 * Returns server status
 */
app.get('/health', healthCheckHandler);

/**
 * Create Razorpay Order
 * POST /createOrder
 * Body: { productId: string, machineId: string }
 * Returns: { success: boolean, orderId: string, amount: number, currency: string }
 */
app.post('/createOrder', createOrderHandler);

/**
 * Verify Payment and Update Stock
 * POST /verifyPayment
 * Body: {
 *   razorpay_order_id: string,
 *   razorpay_payment_id: string,
 *   razorpay_signature: string,
 *   productId: string,
 *   machineId: string
 * }
 * Returns: { success: boolean, orderId: string, message: string }
 */
app.post('/verifyPayment', verifyPaymentHandler);

/**
 * Dispense Product (Notify Vending Machine)
 * POST /dispense
 * Body: { machineId: string, productId: string, orderId: string }
 * Returns: { success: boolean, message: string }
 */
app.post('/dispense', dispenseHandler);

// ============================================
// EXPORT CLOUD FUNCTION
// ============================================

/**
 * Main API function
 * All HTTP endpoints are handled through this single function
 */
export const api = functions
  .region('asia-south1') // Mumbai region for India (low latency)
  .runWith({
    timeoutSeconds: 60,
    memory: '256MB',
  })
  .https.onRequest(app);

// ============================================
// FIRESTORE TRIGGERS (Optional - for background processing)
// ============================================

/**
 * Trigger when a new order is created
 * Can be used for analytics, notifications, etc.
 */
export const onOrderCreated = functions
  .region('asia-south1')
  .firestore.document('orders/{orderId}')
  .onCreate(async (snapshot, context) => {
    const orderData = snapshot.data();
    const orderId = context.params.orderId;

    functions.logger.info('New order created:', {
      orderId,
      machineId: orderData.machineId,
      productId: orderData.productId,
      amount: orderData.amount,
    });

    // Add any additional processing here (e.g., send notifications)
    return null;
  });

/**
 * Trigger when order payment status changes to success
 * Automatically triggers dispense notification
 */
export const onPaymentSuccess = functions
  .region('asia-south1')
  .firestore.document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    // Check if payment just became successful
    if (
      before.paymentStatus !== 'success' &&
      after.paymentStatus === 'success'
    ) {
      functions.logger.info('Payment successful, triggering dispense:', {
        orderId,
        machineId: after.machineId,
        productId: after.productId,
      });

      // Add to dispense queue for the vending machine to pick up
      await db.collection('dispenseQueue').add({
        orderId,
        machineId: after.machineId,
        productId: after.productId,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return null;
  });
