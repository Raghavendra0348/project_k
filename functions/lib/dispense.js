"use strict";
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
exports.dispenseConfirmHandler = exports.dispenseHandler = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("./firebase");
const validation_1 = require("./utils/validation");
// ============================================
// MAIN HANDLER
// ============================================
const dispenseHandler = async (req, res) => {
    try {
        // ----------------------------------------
        // Step 1: Validate Input
        // ----------------------------------------
        const validation = (0, validation_1.validateDispenseInput)(req.body);
        if (!validation.isValid) {
            (0, validation_1.logValidationError)('dispense', validation.error, req.body);
            res.status(400).json({
                success: false,
                error: validation.error,
            });
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
        const orderRef = firebase_1.db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();
        if (!orderDoc.exists) {
            functions.logger.warn('Order not found for dispense', { orderId });
            res.status(404).json({
                success: false,
                error: 'Order not found',
            });
            return;
        }
        const order = orderDoc.data();
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
            });
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
            });
            return;
        }
        // Check if already dispensed
        if (order.dispensed) {
            functions.logger.warn('Order already dispensed', { orderId });
            res.status(400).json({
                success: false,
                error: 'Product has already been dispensed',
            });
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
            createdAt: firebase_1.FieldValue.serverTimestamp(),
            expiresAt: firebase_1.Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)),
        };
        const dispenseRef = await firebase_1.db
            .collection('dispenseQueue')
            .add(dispenseCommand);
        // Update order to mark dispense initiated
        await orderRef.update({
            dispenseInitiated: true,
            dispenseQueueId: dispenseRef.id,
            updatedAt: firebase_1.FieldValue.serverTimestamp(),
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
        });
    }
    catch (error) {
        functions.logger.error('Error processing dispense request:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: `Dispense failed: ${errorMessage}`,
        });
    }
};
exports.dispenseHandler = dispenseHandler;
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
const dispenseConfirmHandler = async (req, res) => {
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
        const dispenseRef = firebase_1.db.collection('dispenseQueue').doc(dispenseId);
        const dispenseDoc = await dispenseRef.get();
        if (!dispenseDoc.exists) {
            res.status(404).json({
                success: false,
                error: 'Dispense record not found',
            });
            return;
        }
        const dispenseData = dispenseDoc.data();
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
            confirmedAt: firebase_1.FieldValue.serverTimestamp(),
            errorCode: errorCode || null,
        });
        // Update order dispensed status
        if (status === 'success') {
            await firebase_1.db.collection('orders').doc(dispenseData.orderId).update({
                dispensed: true,
                dispensedAt: firebase_1.FieldValue.serverTimestamp(),
                updatedAt: firebase_1.FieldValue.serverTimestamp(),
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
    }
    catch (error) {
        functions.logger.error('Error processing dispense confirmation:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process confirmation',
        });
    }
};
exports.dispenseConfirmHandler = dispenseConfirmHandler;
//# sourceMappingURL=dispense.js.map