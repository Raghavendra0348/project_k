"use strict";
/**
 * Razorpay Utility Module
 *
 * Provides Razorpay SDK initialization and helper functions for
 * payment processing and signature verification.
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
exports.getRazorpayKeyId = exports.fetchPaymentDetails = exports.verifyPaymentSignature = exports.createRazorpayOrder = exports.getRazorpayInstance = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto = __importStar(require("crypto"));
const functions = __importStar(require("firebase-functions"));
// ============================================
// RAZORPAY CONFIGURATION
// ============================================
/**
 * Get Razorpay API credentials from environment variables
 *
 * IMPORTANT: As of 2026, functions.config() is deprecated.
 * Use .env file in the functions directory instead:
 *
 * functions/.env:
 *   RAZORPAY_KEY_ID=rzp_test_xxxxx
 *   RAZORPAY_KEY_SECRET=your_secret_key
 *
 * The .env file is automatically loaded by Firebase Functions.
 * @return {Object} Razorpay configuration with keyId and keySecret
 */
const getRazorpayConfig = () => {
    return {
        keyId: process.env.RAZORPAY_KEY_ID || '',
        keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    };
};
/**
 * Initialize and return Razorpay instance
 * @return {Razorpay} Razorpay SDK instance
 */
const getRazorpayInstance = () => {
    const { keyId, keySecret } = getRazorpayConfig();
    if (!keyId || !keySecret) {
        throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
    }
    return new razorpay_1.default({
        key_id: keyId,
        key_secret: keySecret,
    });
};
exports.getRazorpayInstance = getRazorpayInstance;
/**
 * Create a new Razorpay order
 *
 * @param {CreateOrderOptions} options - Order creation options
 * @return {Promise<RazorpayOrder>} Razorpay order object
 */
const createRazorpayOrder = async (options) => {
    const razorpay = (0, exports.getRazorpayInstance)();
    const orderOptions = {
        amount: options.amount,
        currency: options.currency || 'INR',
        receipt: options.receipt,
        notes: options.notes || {},
    };
    try {
        const order = await razorpay.orders.create(orderOptions);
        functions.logger.info('Razorpay order created:', {
            orderId: order.id,
            amount: order.amount,
        });
        return order;
    }
    catch (error) {
        functions.logger.error('Failed to create Razorpay order:', error);
        throw new Error('Failed to create payment order. Please try again.');
    }
};
exports.createRazorpayOrder = createRazorpayOrder;
/**
 * Verify Razorpay payment signature
 *
 * This is CRITICAL for security - never trust the frontend's payment status.
 * Always verify the signature server-side using the secret key.
 *
 * Signature is generated as: HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, secret)
 *
 * @param {VerifyPaymentOptions} options - Payment verification options
 * @return {boolean} true if signature is valid
 */
const verifyPaymentSignature = (options) => {
    const { keySecret } = getRazorpayConfig();
    if (!keySecret) {
        throw new Error('Razorpay secret key not configured');
    }
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = options;
    // Create the expected signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');
    // Compare signatures (constant-time comparison to prevent timing attacks)
    const isValid = crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpaySignature));
    if (isValid) {
        functions.logger.info('Payment signature verified successfully', {
            orderId: razorpayOrderId,
        });
    }
    else {
        functions.logger.warn('Payment signature verification failed', {
            orderId: razorpayOrderId,
        });
    }
    return isValid;
};
exports.verifyPaymentSignature = verifyPaymentSignature;
// ============================================
// PAYMENT STATUS CHECK
// ============================================
/**
 * Fetch payment details from Razorpay
 *
 * @param {string} paymentId - Razorpay payment ID
 * @return {Promise<Object>} Payment details
 */
const fetchPaymentDetails = async (paymentId) => {
    const razorpay = (0, exports.getRazorpayInstance)();
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    }
    catch (error) {
        functions.logger.error('Failed to fetch payment details:', error);
        throw new Error('Failed to fetch payment details');
    }
};
exports.fetchPaymentDetails = fetchPaymentDetails;
/**
 * Get Razorpay Key ID for frontend
 * (Safe to expose - this is the public key)
 * @return {string} Razorpay public key ID
 */
const getRazorpayKeyId = () => {
    const { keyId } = getRazorpayConfig();
    return keyId;
};
exports.getRazorpayKeyId = getRazorpayKeyId;
//# sourceMappingURL=razorpay.js.map