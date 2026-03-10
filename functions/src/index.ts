/**
 * Firebase Cloud Functions - Main Entry Point
 *
 * This file exports all cloud functions for the vending machine system.
 * Functions handle payment processing, order management, and machine communication.
 */

import * as functions from 'firebase-functions';
import cors from 'cors';
import express from 'express';

// Import function handlers
import { createOrderHandler } from './createOrder';
import { verifyPaymentHandler } from './verifyPayment';
import { dispenseHandler, dispenseConfirmHandler } from './dispense';
import { healthCheckHandler } from './health';
import {
  getAlertsHandler,
  acknowledgeAlertHandler,
  resolveAlertHandler,
  getLowStockProductsHandler,
  checkAllStockHandler,
} from './stockAlerts';
import {
  getAllProductsHandler,
  getProductHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  getAllMachinesHandler,
  updateStockHandler,
} from './adminProducts';

// Import ESP8266 sync functions (Firestore-only, no RTDB dependency)
import {
  syncDispenseToRTDB,
  syncDispenseUpdateToRTDB,
  esp8266ConfirmDispense,
} from './esp8266Sync';

// ============================================
// EXPRESS APP SETUP WITH CORS
// ============================================
const app = express();

// Configure CORS - allow all origins (whitelist specific origins if needed)
const corsOptions: cors.CorsOptions = {
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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

/**
 * Dispense Confirmation (From Vending Machine)
 * POST /dispense/confirm
 * Body: { dispenseId: string, machineId: string, status: 'success' | 'failed' }
 * Returns: { success: boolean, message: string }
 */
app.post('/dispense/confirm', dispenseConfirmHandler);

// ============================================
// ADMIN API ROUTES
// ============================================

/**
 * Get all stock alerts
 * GET /admin/alerts
 * Query: ?status=pending|acknowledged|resolved (optional)
 * Returns: { success: boolean, data: StockAlert[] }
 */
app.get('/admin/alerts', getAlertsHandler);

/**
 * Acknowledge a stock alert
 * POST /admin/alerts/:alertId/acknowledge
 * Returns: { success: boolean, message: string }
 */
app.post('/admin/alerts/:alertId/acknowledge', acknowledgeAlertHandler);

/**
 * Resolve a stock alert (after refilling)
 * POST /admin/alerts/:alertId/resolve
 * Returns: { success: boolean, message: string }
 */
app.post('/admin/alerts/:alertId/resolve', resolveAlertHandler);

/**
 * Get all low stock products
 * GET /admin/low-stock
 * Returns: { success: boolean, data: Product[], threshold: number }
 */
app.get('/admin/low-stock', getLowStockProductsHandler);

/**
 * Check all products and create alerts for low stock
 * POST /admin/check-stock
 * Returns: { success: boolean, alertsCreated: number, alertsSkipped: number }
 */
app.post('/admin/check-stock', checkAllStockHandler);

// ============================================
// ADMIN PRODUCT MANAGEMENT ROUTES
// ============================================

/**
 * Get all machines (for dropdowns)
 * GET /admin/machines
 * Returns: { success: boolean, data: Machine[] }
 */
app.get('/admin/machines', getAllMachinesHandler);

/**
 * Get all products
 * GET /admin/products
 * Query: ?machineId=xxx (optional)
 * Returns: { success: boolean, data: Product[] }
 */
app.get('/admin/products', getAllProductsHandler);

/**
 * Get a single product
 * GET /admin/products/:productId
 * Returns: { success: boolean, data: Product }
 */
app.get('/admin/products/:productId', getProductHandler);

/**
 * Create a new product
 * POST /admin/products
 * Body: { name, price, stock, machineId, category?, imageUrl?, description? }
 * Returns: { success: boolean, data: Product }
 */
app.post('/admin/products', createProductHandler);

/**
 * Update a product
 * PUT /admin/products/:productId
 * Body: { name?, price?, stock?, category?, imageUrl?, description? }
 * Returns: { success: boolean, data: Product }
 */
app.put('/admin/products/:productId', updateProductHandler);

/**
 * Quick stock update
 * PATCH /admin/products/:productId/stock
 * Body: { stock: number }
 * Returns: { success: boolean, message: string }
 */
app.patch('/admin/products/:productId/stock', updateStockHandler);

/**
 * Delete a product
 * DELETE /admin/products/:productId
 * Returns: { success: boolean, message: string }
 */
app.delete('/admin/products/:productId', deleteProductHandler);

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
      functions.logger.info('Payment successful (dispense already queued by verifyPayment):', {
        orderId,
        machineId: after.machineId,
        productId: after.productId,
      });

      // NOTE: Do NOT add to dispenseQueue here — verifyPayment.ts already
      // creates the dispense command. Adding here would cause duplicates
      // and the ESP8266 would loop the same product on the LCD.
    }

    return null;
  });

// ============================================
// ESP8266 SYNC EXPORTS
// ============================================

// Firestore trigger: Log & sync new dispense commands
export { syncDispenseToRTDB };

// Firestore trigger: Sync dispense status updates
export { syncDispenseUpdateToRTDB };

// HTTP endpoint for ESP8266 to confirm dispense completion
export { esp8266ConfirmDispense };
