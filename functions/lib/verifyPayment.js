"use strict";
/**
 * Verify Payment Handler
 *
 * CRITICAL SECURITY FUNCTION
 *
 * Verifies Razorpay payment signature and updates stock atomically.
 * This is the most important function for preventing fraud.
 *
 * Flow:
 * 1. Validate all input parameters
 * 2. Verify Razorpay signature using secret key
 * 3. REJECT if verification fails (potential fraud)
 * 4. Use Firestore TRANSACTION to:
 *    a. Check current stock
 *    b. Reduce stock by 1
 *    c. Update order status to success
 * 5. Return success response
 *
 * The transaction ensures:
 * - No race conditions (multiple users buying last item)
 * - No double purchases
 * - No negative stock
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPaymentHandler = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("./firebase");
const razorpay_1 = require("./utils/razorpay");
const validation_1 = require("./utils/validation");
const stockAlerts_1 = require("./stockAlerts");
// ============================================
// MAIN HANDLER
// ============================================
const verifyPaymentHandler = async (req, res) => {
    try {
        const isPaymentSimulationEnabled = process.env.ENABLE_PAYMENT_SIMULATION === 'true';
        // ----------------------------------------
        // Step 1: Validate Input
        // ----------------------------------------
        const validation = (0, validation_1.validateVerifyPaymentInput)(req.body);
        if (!validation.isValid) {
            (0, validation_1.logValidationError)('verifyPayment', validation.error, req.body);
            res.status(400).json({
                success: false,
                error: validation.error,
            });
            return;
        }
        /* eslint-disable camelcase */
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, productId, machineId, internalOrderId, } = req.body;
        /* eslint-enable camelcase */
        functions.logger.info('Verifying payment', {
            // eslint-disable-next-line camelcase
            razorpayOrderId: razorpay_order_id,
            productId,
            machineId,
            internalOrderId,
        });
        // ----------------------------------------
        // Step 2: Verify Razorpay Signature
        // ----------------------------------------
        // THIS IS CRITICAL - Never trust frontend payment status
        /* eslint-disable camelcase */
        let isValidSignature = false;
        if (isPaymentSimulationEnabled) {
            functions.logger.warn('Payment simulation enabled - skipping Razorpay signature verification');
            isValidSignature = true;
        }
        else {
            isValidSignature = (0, razorpay_1.verifyPaymentSignature)({
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
            });
        }
        if (!isValidSignature) {
            functions.logger.error('Payment signature verification FAILED - Potential fraud!', {
                razorpayOrderId: razorpay_order_id,
                productId,
                machineId,
            });
            /* eslint-enable camelcase */
            // Update order status to failed
            await firebase_1.db.collection('orders').doc(internalOrderId).update({
                paymentStatus: 'failed',
                failureReason: 'Signature verification failed',
                updatedAt: firebase_1.FieldValue.serverTimestamp(),
            });
            res.status(400).json({
                success: false,
                error: 'Payment verification failed. Please contact support if amount was deducted.',
            });
            return;
        }
        functions.logger.info('Payment signature verified successfully');
        // ----------------------------------------
        // Step 3: Atomic Stock Update with Transaction
        // ----------------------------------------
        // This transaction ensures:
        // - Race condition prevention
        // - No double purchases
        // - No negative stock
        const productRef = firebase_1.db.collection('products').doc(productId);
        const orderRef = firebase_1.db.collection('orders').doc(internalOrderId);
        try {
            await firebase_1.db.runTransaction(async (transaction) => {
                // Read current product data
                const productDoc = await transaction.get(productRef);
                if (!productDoc.exists) {
                    throw new Error('Product not found');
                }
                const product = productDoc.data();
                // Verify product belongs to machine (double-check)
                if (product.machineId !== machineId) {
                    throw new Error('Product machine mismatch');
                }
                // Check stock availability
                if (product.stock <= 0) {
                    throw new Error('Product is out of stock');
                }
                // Read order to verify it's pending
                const orderDoc = await transaction.get(orderRef);
                if (!orderDoc.exists) {
                    throw new Error('Order not found');
                }
                const order = orderDoc.data();
                // Verify order matches Razorpay order ID
                // eslint-disable-next-line camelcase
                if (order.razorpayOrderId !== razorpay_order_id) {
                    throw new Error('Order ID mismatch');
                }
                // Verify order is still pending (prevent double processing)
                if (order.paymentStatus === 'success') {
                    throw new Error('Order already processed');
                }
                // ========================================
                // ATOMIC UPDATES
                // ========================================
                // 1. Reduce stock by 1
                transaction.update(productRef, {
                    stock: firebase_1.FieldValue.increment(-1),
                    updatedAt: firebase_1.FieldValue.serverTimestamp(),
                });
                // 2. Update order status to success
                transaction.update(orderRef, {
                    paymentStatus: 'success',
                    // eslint-disable-next-line camelcase
                    razorpayPaymentId: razorpay_payment_id,
                    verifiedAt: firebase_1.FieldValue.serverTimestamp(),
                    updatedAt: firebase_1.FieldValue.serverTimestamp(),
                });
                functions.logger.info('Transaction completed successfully', {
                    productId,
                    newStock: product.stock - 1,
                    orderId: internalOrderId,
                });
                // Check and create stock alert if stock is low
                // Note: product.stock - 1 is the new stock after this purchase
                await (0, stockAlerts_1.checkAndCreateStockAlert)(productId, product.stock - 1);
            });
        }
        catch (transactionError) {
            functions.logger.error('Transaction failed:', transactionError);
            const errorMessage = transactionError instanceof Error ?
                transactionError.message :
                'Transaction failed';
            // Special handling for out of stock
            if (errorMessage.includes('out of stock')) {
                // Initiate Razorpay refund (skip during simulation)
                let refundId = null;
                if (!isPaymentSimulationEnabled) {
                    try {
                        const razorpay = (0, razorpay_1.getRazorpayInstance)();
                        const refund = await razorpay.payments.refund(razorpay_payment_id, {
                            speed: 'normal',
                            notes: {
                                reason: 'Product out of stock during transaction',
                                orderId: internalOrderId,
                            },
                        });
                        refundId = refund.id;
                        functions.logger.info('Refund initiated successfully', {
                            refundId: refund.id,
                            paymentId: razorpay_payment_id,
                            orderId: internalOrderId,
                        });
                    }
                    catch (refundError) {
                        functions.logger.error('Refund initiation failed:', refundError);
                    }
                }
                await firebase_1.db.collection('orders').doc(internalOrderId).update({
                    paymentStatus: 'failed',
                    failureReason: 'Out of stock during transaction',
                    needsRefund: !refundId,
                    refundId: refundId || null,
                    refundStatus: refundId ? 'initiated' : 'pending',
                    updatedAt: firebase_1.FieldValue.serverTimestamp(),
                });
                res.status(400).json({
                    success: false,
                    error: 'Product went out of stock. Refund will be processed.',
                });
                return;
            }
            // Special handling for already processed
            if (errorMessage.includes('already processed')) {
                res.status(400).json({
                    success: false,
                    error: 'This order has already been processed.',
                });
                return;
            }
            throw transactionError;
        }
        // ----------------------------------------
        // Step 4: Add to Dispense Queue for ESP8266
        // ----------------------------------------
        // This creates a document that ESP8266 can listen to in real-time
        const dispenseCommand = {
            orderId: internalOrderId,
            machineId,
            productId,
            status: 'pending',
            command: 'DISPENSE',
            createdAt: firebase_1.FieldValue.serverTimestamp(),
            expiresAt: firebase_1.Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)),
        };
        const dispenseRef = await firebase_1.db
            .collection('dispenseQueue')
            .add(dispenseCommand);
        // Update order with dispense queue reference
        await firebase_1.db.collection('orders').doc(internalOrderId).update({
            dispenseInitiated: true,
            dispenseQueueId: dispenseRef.id,
            updatedAt: firebase_1.FieldValue.serverTimestamp(),
        });
        functions.logger.info('Dispense command added to queue for ESP8266', {
            dispenseId: dispenseRef.id,
            orderId: internalOrderId,
            machineId,
            productId,
        });
        // ----------------------------------------
        // Step 5: Success Response
        // ----------------------------------------
        functions.logger.info('Payment verified and stock updated successfully', {
            orderId: internalOrderId,
            productId,
            machineId,
        });
        res.status(200).json({
            success: true,
            orderId: internalOrderId,
            dispenseId: dispenseRef.id,
            message: 'Payment successful! Your product will be dispensed.',
        });
    }
    catch (error) {
        functions.logger.error('Error verifying payment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            error: `Payment verification failed: ${errorMessage}`,
        });
    }
};
exports.verifyPaymentHandler = verifyPaymentHandler;
//# sourceMappingURL=verifyPayment.js.map