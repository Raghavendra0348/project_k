"use strict";
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
exports.createOrderHandler = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("./firebase");
const razorpay_1 = require("./utils/razorpay");
const validation_1 = require("./utils/validation");
// ============================================
// MAIN HANDLER
// ============================================
const createOrderHandler = async (req, res) => {
    try {
        const isPaymentSimulationEnabled = process.env.ENABLE_PAYMENT_SIMULATION === 'true';
        // ----------------------------------------
        // Step 1: Validate Input
        // ----------------------------------------
        const validation = (0, validation_1.validateCreateOrderInput)(req.body);
        if (!validation.isValid) {
            (0, validation_1.logValidationError)('createOrder', validation.error, req.body);
            res.status(400).json({
                success: false,
                error: validation.error,
            });
            return;
        }
        const { productId, machineId } = req.body;
        functions.logger.info('Creating order', { productId, machineId });
        // ----------------------------------------
        // Step 2: Fetch Product from Firestore
        // ----------------------------------------
        const productRef = firebase_1.db.collection('products').doc(productId);
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            functions.logger.warn('Product not found', { productId });
            res.status(404).json({
                success: false,
                error: 'Product not found',
            });
            return;
        }
        const product = productDoc.data();
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
            });
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
            });
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
        let razorpayOrderId;
        if (isPaymentSimulationEnabled) {
            functions.logger.warn('Payment simulation enabled - skipping Razorpay order creation');
            razorpayOrderId = `order_sim_${Date.now()}`;
        }
        else {
            const razorpayOrder = await (0, razorpay_1.createRazorpayOrder)({
                amount: amountInPaise,
                currency: 'INR',
                receipt: receiptId,
                notes: {
                    productId,
                    machineId,
                    productName: product.name,
                },
            });
            razorpayOrderId = razorpayOrder.id;
        }
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
            paymentStatus: 'pending',
            dispensed: false,
            createdAt: firebase_1.FieldValue.serverTimestamp(),
            updatedAt: firebase_1.FieldValue.serverTimestamp(),
        };
        const orderRef = await firebase_1.db.collection('orders').add(orderData);
        functions.logger.info('Order created successfully', {
            orderId: orderRef.id,
            razorpayOrderId,
            amount: amountInPaise,
            paymentSimulation: isPaymentSimulationEnabled,
        });
        // ----------------------------------------
        // Step 7: Return Order Details
        // ----------------------------------------
        const response = {
            success: true,
            orderId: orderRef.id,
            razorpayOrderId,
            amount: amountInPaise,
            currency: 'INR',
            keyId: (0, razorpay_1.getRazorpayKeyId)(),
            productName: product.name,
            mockPayment: isPaymentSimulationEnabled,
        };
        res.status(200).json(response);
    }
    catch (error) {
        functions.logger.error('Error creating order:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        res.status(500).json({
            success: false,
            error: `Failed to create order: ${errorMessage}`,
        });
    }
};
exports.createOrderHandler = createOrderHandler;
//# sourceMappingURL=createOrder.js.map