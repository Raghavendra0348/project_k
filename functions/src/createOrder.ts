/**
 * Create Order Handler
 *
 * Creates a Razorpay order for a product purchase.
 *
 * Flow:
 * 1. Validate input (productId, machineId)
 * 2. Fetch product from Firestore
 * 3. Verify product exists and belongs to the machine
 * 4. Check stock availability
 * 5. Create Razorpay order with product price
 * 6. Create pending order in Firestore
 * 7. Return order details to frontend
 */

import { Request, Response } from 'express';
import * as functions from 'firebase-functions';
import { db, FieldValue } from './firebase';
import { createRazorpayOrder, getRazorpayKeyId } from './utils/razorpay';
import {
  validateCreateOrderInput,
  logValidationError,
} from './utils/validation';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Product {
  name: string;
  price: number; // Price in INR (rupees)
  stock: number;
  machineId: string;
  imageUrl?: string;
  category?: string;
}

interface CreateOrderResponse {
  success: boolean;
  orderId?: string; // Internal Firestore order ID
  razorpayOrderId?: string; // Razorpay order ID
  amount?: number; // Amount in paise
  currency?: string;
  keyId?: string; // Razorpay public key ID
  productName?: string;
  error?: string;
}

// ============================================
// MAIN HANDLER
// ============================================

export const createOrderHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // ----------------------------------------
    // Step 1: Validate Input
    // ----------------------------------------
    const validation = validateCreateOrderInput(req.body);
    if (!validation.isValid) {
      logValidationError('createOrder', validation.error!, req.body);
      res.status(400).json({
        success: false,
        error: validation.error,
      } as CreateOrderResponse);
      return;
    }

    const { productId, machineId } = req.body as {
      productId: string;
      machineId: string;
    };

    functions.logger.info('Creating order', { productId, machineId });

    // ----------------------------------------
    // Step 2: Fetch Product from Firestore
    // ----------------------------------------
    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      functions.logger.warn('Product not found', { productId });
      res.status(404).json({
        success: false,
        error: 'Product not found',
      } as CreateOrderResponse);
      return;
    }

    const product = productDoc.data() as Product;

    // ----------------------------------------
    // Step 3: Verify Product Belongs to Machine
    // ----------------------------------------
    if (product.machineId !== machineId) {
      functions.logger.warn('Product machine mismatch', {
        productId,
        expectedMachine: product.machineId,
        requestedMachine: machineId,
      });
      res.status(400).json({
        success: false,
        error: 'Product not available in this machine',
      } as CreateOrderResponse);
      return;
    }

    // ----------------------------------------
    // Step 4: Check Stock Availability
    // ----------------------------------------
    if (product.stock <= 0) {
      functions.logger.warn('Product out of stock', {
        productId,
        stock: product.stock,
      });
      res.status(400).json({
        success: false,
        error: 'Product is out of stock',
      } as CreateOrderResponse);
      return;
    }

    // ----------------------------------------
    // Step 5: Create Razorpay Order
    // ----------------------------------------
    // Convert price from rupees to paise (Razorpay expects smallest currency unit)
    const amountInPaise = Math.round(product.price * 100);

    // Generate unique receipt ID (max 40 chars as per Razorpay)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const receiptId = `vm_${machineId}_${timestamp}`.slice(0, 40);

    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        productId,
        machineId,
        productName: product.name,
      },
    });

    const razorpayOrderId = razorpayOrder.id;

    // ----------------------------------------
    // Step 6: Create Pending Order in Firestore
    // ----------------------------------------
    const orderData = {
      productId,
      machineId,
      productName: product.name,
      amount: amountInPaise,
      currency: 'INR',
      razorpayOrderId,
      razorpayPaymentId: null,
      paymentStatus: 'pending' as const,
      dispensed: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const orderRef = await db.collection('orders').add(orderData);

    functions.logger.info('Order created successfully', {
      orderId: orderRef.id,
      razorpayOrderId,
      amount: amountInPaise,
    });

    // ----------------------------------------
    // Step 7: Return Order Details
    // ----------------------------------------
    const response: CreateOrderResponse = {
      success: true,
      orderId: orderRef.id,
      razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: getRazorpayKeyId(),
      productName: product.name,
    };

    res.status(200).json(response);
  } catch (error) {
    functions.logger.error('Error creating order:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    res.status(500).json({
      success: false,
      error: `Failed to create order: ${errorMessage}`,
    } as CreateOrderResponse);
  }
};
