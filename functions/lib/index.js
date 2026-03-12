"use strict";
/**
 * Firebase Cloud Functions - Main Entry Point
 *
 * This file exports all cloud functions for the vending machine system.
 * Functions handle payment processing, order management, and machine communication.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.esp8266ConfirmDispense = exports.syncDispenseUpdateToRTDB = exports.syncDispenseToRTDB = exports.onPaymentSuccess = exports.onOrderCreated = exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
// Import function handlers
const createOrder_1 = require("./createOrder");
const verifyPayment_1 = require("./verifyPayment");
const dispense_1 = require("./dispense");
const health_1 = require("./health");
const stockAlerts_1 = require("./stockAlerts");
const adminProducts_1 = require("./adminProducts");
// Import ESP8266 sync functions (Firestore-only, no RTDB dependency)
const esp8266Sync_1 = require("./esp8266Sync");
Object.defineProperty(exports, "syncDispenseToRTDB", { enumerable: true, get: function () { return esp8266Sync_1.syncDispenseToRTDB; } });
Object.defineProperty(exports, "syncDispenseUpdateToRTDB", { enumerable: true, get: function () { return esp8266Sync_1.syncDispenseUpdateToRTDB; } });
Object.defineProperty(exports, "esp8266ConfirmDispense", { enumerable: true, get: function () { return esp8266Sync_1.esp8266ConfirmDispense; } });
// ============================================
// EXPRESS APP SETUP WITH CORS
// ============================================
const app = (0, express_1.default)();
// Configure CORS - allow all origins (whitelist specific origins if needed)
const corsOptions = {
    origin: true, // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// ============================================
// API ROUTES
// ============================================
/**
 * Health Check Endpoint
 * GET /health
 * Returns server status
 */
app.get('/health', health_1.healthCheckHandler);
/**
 * Create Razorpay Order
 * POST /createOrder
 * Body: { productId: string, machineId: string }
 * Returns: { success: boolean, orderId: string, amount: number, currency: string }
 */
app.post('/createOrder', createOrder_1.createOrderHandler);
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
app.post('/verifyPayment', verifyPayment_1.verifyPaymentHandler);
/**
 * Dispense Product (Notify Vending Machine)
 * POST /dispense
 * Body: { machineId: string, productId: string, orderId: string }
 * Returns: { success: boolean, message: string }
 */
app.post('/dispense', dispense_1.dispenseHandler);
/**
 * Dispense Confirmation (From Vending Machine)
 * POST /dispense/confirm
 * Body: { dispenseId: string, machineId: string, status: 'success' | 'failed' }
 * Returns: { success: boolean, message: string }
 */
app.post('/dispense/confirm', dispense_1.dispenseConfirmHandler);
// ============================================
// ADMIN API ROUTES
// ============================================
/**
 * Get all stock alerts
 * GET /admin/alerts
 * Query: ?status=pending|acknowledged|resolved (optional)
 * Returns: { success: boolean, data: StockAlert[] }
 */
app.get('/admin/alerts', stockAlerts_1.getAlertsHandler);
/**
 * Acknowledge a stock alert
 * POST /admin/alerts/:alertId/acknowledge
 * Returns: { success: boolean, message: string }
 */
app.post('/admin/alerts/:alertId/acknowledge', stockAlerts_1.acknowledgeAlertHandler);
/**
 * Resolve a stock alert (after refilling)
 * POST /admin/alerts/:alertId/resolve
 * Returns: { success: boolean, message: string }
 */
app.post('/admin/alerts/:alertId/resolve', stockAlerts_1.resolveAlertHandler);
/**
 * Get all low stock products
 * GET /admin/low-stock
 * Returns: { success: boolean, data: Product[], threshold: number }
 */
app.get('/admin/low-stock', stockAlerts_1.getLowStockProductsHandler);
/**
 * Check all products and create alerts for low stock
 * POST /admin/check-stock
 * Returns: { success: boolean, alertsCreated: number, alertsSkipped: number }
 */
app.post('/admin/check-stock', stockAlerts_1.checkAllStockHandler);
// ============================================
// ADMIN PRODUCT MANAGEMENT ROUTES
// ============================================
/**
 * Get all machines (for dropdowns)
 * GET /admin/machines
 * Returns: { success: boolean, data: Machine[] }
 */
app.get('/admin/machines', adminProducts_1.getAllMachinesHandler);
/**
 * Get all products
 * GET /admin/products
 * Query: ?machineId=xxx (optional)
 * Returns: { success: boolean, data: Product[] }
 */
app.get('/admin/products', adminProducts_1.getAllProductsHandler);
/**
 * Get a single product
 * GET /admin/products/:productId
 * Returns: { success: boolean, data: Product }
 */
app.get('/admin/products/:productId', adminProducts_1.getProductHandler);
/**
 * Create a new product
 * POST /admin/products
 * Body: { name, price, stock, machineId, category?, imageUrl?, description? }
 * Returns: { success: boolean, data: Product }
 */
app.post('/admin/products', adminProducts_1.createProductHandler);
/**
 * Update a product
 * PUT /admin/products/:productId
 * Body: { name?, price?, stock?, category?, imageUrl?, description? }
 * Returns: { success: boolean, data: Product }
 */
app.put('/admin/products/:productId', adminProducts_1.updateProductHandler);
/**
 * Quick stock update
 * PATCH /admin/products/:productId/stock
 * Body: { stock: number }
 * Returns: { success: boolean, message: string }
 */
app.patch('/admin/products/:productId/stock', adminProducts_1.updateStockHandler);
/**
 * Delete a product
 * DELETE /admin/products/:productId
 * Returns: { success: boolean, message: string }
 */
app.delete('/admin/products/:productId', adminProducts_1.deleteProductHandler);
// ============================================
// EXPORT CLOUD FUNCTION
// ============================================
/**
 * Main API function
 * All HTTP endpoints are handled through this single function
 */
exports.api = functions
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
exports.onOrderCreated = functions
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
exports.onPaymentSuccess = functions
    .region('asia-south1')
    .firestore.document('orders/{orderId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;
    // Check if payment just became successful
    if (before.paymentStatus !== 'success' &&
        after.paymentStatus === 'success') {
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
//# sourceMappingURL=index.js.map