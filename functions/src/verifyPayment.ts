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

import { Request, Response } from 'express';
import * as functions from 'firebase-functions';
import { db, FieldValue } from './firebase';
import { verifyPaymentSignature, getRazorpayInstance } from './utils/razorpay';
import {
  validateVerifyPaymentInput,
  logValidationError,
} from './utils/validation';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Product {
  name: string;
  price: number;
  stock: number;
  machineId: string;
}

interface Order {
  productId: string;
  machineId: string;
  razorpayOrderId: string;
  paymentStatus: 'pending' | 'success' | 'failed';
}

interface VerifyPaymentResponse {
  success: boolean;
  orderId?: string;
  message?: string;
  error?: string;
}

// ============================================
// MAIN HANDLER
// ============================================

export const verifyPaymentHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // ----------------------------------------
    // Step 1: Validate Input
    // ----------------------------------------
    const validation = validateVerifyPaymentInput(req.body);
    if (!validation.isValid) {
      logValidationError('verifyPayment', validation.error!, req.body);
      res.status(400).json({
        success: false,
        error: validation.error,
      } as VerifyPaymentResponse);
      return;
    }

    /* eslint-disable camelcase */
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      productId,
      machineId,
      internalOrderId,
    } = req.body;
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
    const isValidSignature = verifyPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!isValidSignature) {
      functions.logger.error(
        'Payment signature verification FAILED - Potential fraud!',
        {
          razorpayOrderId: razorpay_order_id,
          productId,
          machineId,
        },
      );
      /* eslint-enable camelcase */

      // Update order status to failed
      await db.collection('orders').doc(internalOrderId).update({
        paymentStatus: 'failed',
        failureReason: 'Signature verification failed',
        updatedAt: FieldValue.serverTimestamp(),
      });

      res.status(400).json({
        success: false,
        error:
          'Payment verification failed. Please contact support if amount was deducted.',
      } as VerifyPaymentResponse);
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

    const productRef = db.collection('products').doc(productId);
    const orderRef = db.collection('orders').doc(internalOrderId);

    try {
      await db.runTransaction(async (transaction) => {
        // Read current product data
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists) {
          throw new Error('Product not found');
        }

        const product = productDoc.data() as Product;

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

        const order = orderDoc.data() as Order;

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
          stock: FieldValue.increment(-1),
          updatedAt: FieldValue.serverTimestamp(),
        });

        // 2. Update order status to success
        transaction.update(orderRef, {
          paymentStatus: 'success',
          // eslint-disable-next-line camelcase
          razorpayPaymentId: razorpay_payment_id,
          verifiedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        functions.logger.info('Transaction completed successfully', {
          productId,
          newStock: product.stock - 1,
          orderId: internalOrderId,
        });
      });
    } catch (transactionError) {
      functions.logger.error('Transaction failed:', transactionError);

      const errorMessage =
        transactionError instanceof Error ?
          transactionError.message :
          'Transaction failed';

      // Special handling for out of stock
      if (errorMessage.includes('out of stock')) {
        // Initiate Razorpay refund
        let refundId: string | null = null;
        try {
          const razorpay = getRazorpayInstance();
          const refund = await razorpay.payments.refund(
            razorpay_payment_id,
            {
              speed: 'normal',
              notes: {
                reason: 'Product out of stock during transaction',
                orderId: internalOrderId,
              },
            },
          );
          refundId = refund.id;
          functions.logger.info('Refund initiated successfully', {
            refundId: refund.id,
            paymentId: razorpay_payment_id,
            orderId: internalOrderId,
          });
        } catch (refundError) {
          functions.logger.error('Refund initiation failed:', refundError);
        }

        await db.collection('orders').doc(internalOrderId).update({
          paymentStatus: 'failed',
          failureReason: 'Out of stock during transaction',
          needsRefund: !refundId,
          refundId: refundId || null,
          refundStatus: refundId ? 'initiated' : 'pending',
          updatedAt: FieldValue.serverTimestamp(),
        });

        res.status(400).json({
          success: false,
          error: 'Product went out of stock. Refund will be processed.',
        } as VerifyPaymentResponse);
        return;
      }

      // Special handling for already processed
      if (errorMessage.includes('already processed')) {
        res.status(400).json({
          success: false,
          error: 'This order has already been processed.',
        } as VerifyPaymentResponse);
        return;
      }

      throw transactionError;
    }

    // ----------------------------------------
    // Step 4: Success Response
    // ----------------------------------------
    functions.logger.info('Payment verified and stock updated successfully', {
      orderId: internalOrderId,
      productId,
      machineId,
    });

    res.status(200).json({
      success: true,
      orderId: internalOrderId,
      message: 'Payment successful! Your product will be dispensed.',
    } as VerifyPaymentResponse);
  } catch (error) {
    functions.logger.error('Error verifying payment:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    res.status(500).json({
      success: false,
      error: `Payment verification failed: ${errorMessage}`,
    } as VerifyPaymentResponse);
  }
};
