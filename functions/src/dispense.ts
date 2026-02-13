/**
 * Dispense Handler
 *
 * Endpoint to notify the vending machine to dispense a product.
 * This is called after successful payment verification.
 *
 * In a real implementation, this would:
 * 1. Send a command to the physical vending machine (via IoT protocol)
 * 2. Update the dispense status in Firestore
 * 3. Handle machine acknowledgment
 *
 * For this implementation, we add to a dispenseQueue that the
 * vending machine can poll or receive via WebSocket/MQTT.
 */

import { Request, Response } from 'express';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db } from './firebase';
import { validateDispenseInput, logValidationError } from './utils/validation';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface DispenseResponse {
  success: boolean;
  dispenseId?: string;
  message?: string;
  error?: string;
}

interface Order {
  productId: string;
  machineId: string;
  paymentStatus: 'pending' | 'success' | 'failed';
  dispensed: boolean;
}

// ============================================
// MAIN HANDLER
// ============================================

export const dispenseHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // ----------------------------------------
    // Step 1: Validate Input
    // ----------------------------------------
    const validation = validateDispenseInput(req.body);
    if (!validation.isValid) {
      logValidationError('dispense', validation.error!, req.body);
      res.status(400).json({
        success: false,
        error: validation.error,
      } as DispenseResponse);
      return;
    }

    const { machineId, productId, orderId } = req.body;

    functions.logger.info('Dispense request received', {
      machineId,
      productId,
      orderId,
    });

    // ----------------------------------------
    // Step 2: Verify Order Exists and is Paid
    // ----------------------------------------
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      functions.logger.warn('Order not found for dispense', { orderId });
      res.status(404).json({
        success: false,
        error: 'Order not found',
      } as DispenseResponse);
      return;
    }

    const order = orderDoc.data() as Order;

    // Verify order belongs to this machine
    if (order.machineId !== machineId) {
      functions.logger.warn('Machine ID mismatch', {
        orderId,
        expected: order.machineId,
        received: machineId,
      });
      res.status(400).json({
        success: false,
        error: 'Order does not belong to this machine',
      } as DispenseResponse);
      return;
    }

    // Verify order is paid
    if (order.paymentStatus !== 'success') {
      functions.logger.warn('Attempting to dispense unpaid order', {
        orderId,
        paymentStatus: order.paymentStatus,
      });
      res.status(400).json({
        success: false,
        error: 'Order payment not completed',
      } as DispenseResponse);
      return;
    }

    // Check if already dispensed
    if (order.dispensed) {
      functions.logger.warn('Order already dispensed', { orderId });
      res.status(400).json({
        success: false,
        error: 'Product has already been dispensed',
      } as DispenseResponse);
      return;
    }

    // ----------------------------------------
    // Step 3: Add to Dispense Queue
    // ----------------------------------------
    // In production, this would send a command to the physical machine
    // Here we add to a queue that the machine can poll

    const dispenseCommand = {
      orderId,
      machineId,
      productId,
      status: 'pending',
      command: 'DISPENSE',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 5 * 60 * 1000), // Expires in 5 minutes
      ),
    };

    const dispenseRef = await db
      .collection('dispenseQueue')
      .add(dispenseCommand);

    // Update order to mark dispense initiated
    await orderRef.update({
      dispenseInitiated: true,
      dispenseQueueId: dispenseRef.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info('Dispense command queued', {
      dispenseId: dispenseRef.id,
      orderId,
      machineId,
    });

    // ----------------------------------------
    // Step 4: Return Success
    // ----------------------------------------
    res.status(200).json({
      success: true,
      dispenseId: dispenseRef.id,
      message: 'Dispense command sent to machine',
    } as DispenseResponse);
  } catch (error) {
    functions.logger.error('Error processing dispense request:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({
      success: false,
      error: `Dispense failed: ${errorMessage}`,
    } as DispenseResponse);
  }
};

// ============================================
// MACHINE ACKNOWLEDGMENT HANDLER
// ============================================

/**
 * Called by the vending machine to confirm product was dispensed
 * POST /dispense/confirm
 * Body: { dispenseId: string, machineId: string, status: 'success' | 'failed' }
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const dispenseConfirmHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { dispenseId, machineId, status, errorCode } = req.body;

    if (!dispenseId || !machineId || !status) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: dispenseId, machineId, status',
      });
      return;
    }

    // Get dispense record
    const dispenseRef = db.collection('dispenseQueue').doc(dispenseId);
    const dispenseDoc = await dispenseRef.get();

    if (!dispenseDoc.exists) {
      res.status(404).json({
        success: false,
        error: 'Dispense record not found',
      });
      return;
    }

    const dispenseData = dispenseDoc.data()!;

    // Verify machine ID
    if (dispenseData.machineId !== machineId) {
      res.status(400).json({
        success: false,
        error: 'Machine ID mismatch',
      });
      return;
    }

    // Update dispense status
    await dispenseRef.update({
      status: status === 'success' ? 'completed' : 'failed',
      confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
      errorCode: errorCode || null,
    });

    // Update order dispensed status
    if (status === 'success') {
      await db.collection('orders').doc(dispenseData.orderId).update({
        dispensed: true,
        dispensedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    functions.logger.info('Dispense confirmation received', {
      dispenseId,
      machineId,
      status,
    });

    res.status(200).json({
      success: true,
      message: 'Confirmation received',
    });
  } catch (error) {
    functions.logger.error('Error processing dispense confirmation:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to process confirmation',
    });
  }
};
