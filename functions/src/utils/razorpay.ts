/**
 * Razorpay Utility Module
 *
 * Provides Razorpay SDK initialization and helper functions for
 * payment processing and signature verification.
 */

import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import * as functions from 'firebase-functions';

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
export const getRazorpayInstance = (): Razorpay => {
  const { keyId, keySecret } = getRazorpayConfig();

  if (!keyId || !keySecret) {
    throw new Error(
      'Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// ============================================
// ORDER CREATION
// ============================================

interface CreateOrderOptions {
  amount: number; // Amount in paise (INR smallest unit)
  currency?: string; // Default: INR
  receipt: string; // Unique receipt ID
  notes?: Record<string, string>;
}

interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

/**
 * Create a new Razorpay order
 *
 * @param {CreateOrderOptions} options - Order creation options
 * @return {Promise<RazorpayOrder>} Razorpay order object
 */
export const createRazorpayOrder = async (
  options: CreateOrderOptions,
): Promise<RazorpayOrder> => {
  const razorpay = getRazorpayInstance();

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
    return order as RazorpayOrder;
  } catch (error) {
    functions.logger.error('Failed to create Razorpay order:', error);
    throw new Error('Failed to create payment order. Please try again.');
  }
};

// ============================================
// PAYMENT VERIFICATION
// ============================================

interface VerifyPaymentOptions {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

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
export const verifyPaymentSignature = (
  options: VerifyPaymentOptions,
): boolean => {
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
  const isValid = crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(razorpaySignature),
  );

  if (isValid) {
    functions.logger.info('Payment signature verified successfully', {
      orderId: razorpayOrderId,
    });
  } else {
    functions.logger.warn('Payment signature verification failed', {
      orderId: razorpayOrderId,
    });
  }

  return isValid;
};

// ============================================
// PAYMENT STATUS CHECK
// ============================================

/**
 * Fetch payment details from Razorpay
 *
 * @param {string} paymentId - Razorpay payment ID
 * @return {Promise<Object>} Payment details
 */
export const fetchPaymentDetails = async (paymentId: string) => {
  const razorpay = getRazorpayInstance();

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    functions.logger.error('Failed to fetch payment details:', error);
    throw new Error('Failed to fetch payment details');
  }
};

/**
 * Get Razorpay Key ID for frontend
 * (Safe to expose - this is the public key)
 * @return {string} Razorpay public key ID
 */
export const getRazorpayKeyId = (): string => {
  const { keyId } = getRazorpayConfig();
  return keyId;
};
