"use strict";
/**
 * Stock Alerts Handler
 *
 * Manages low stock notifications for vending machine admins.
 * Creates alerts when product stock falls below threshold.
 *
 * Features:
 * - Check stock levels after each purchase
 * - Create alerts for low stock products
 * - Get all pending alerts for admin dashboard
 * - Mark alerts as acknowledged/resolved
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
exports.checkAllStockHandler = exports.getLowStockProductsHandler = exports.resolveAlertHandler = exports.acknowledgeAlertHandler = exports.getAlertsHandler = void 0;
exports.checkAndCreateStockAlert = checkAndCreateStockAlert;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("./firebase");
// ============================================
// CONSTANTS
// ============================================
const LOW_STOCK_THRESHOLD = 3; // Alert when stock is at or below this
// ============================================
// HELPER FUNCTIONS
// ============================================
/**
 * Check if an active alert already exists for a product
 */
async function alertExistsForProduct(productId) {
    const existingAlert = await firebase_1.db
        .collection('stockAlerts')
        .where('productId', '==', productId)
        .where('status', 'in', ['pending', 'acknowledged'])
        .limit(1)
        .get();
    return !existingAlert.empty;
}
/**
 * Get machine details by ID
 */
async function getMachineDetails(machineId) {
    const machineDoc = await firebase_1.db.collection('machines').doc(machineId).get();
    if (!machineDoc.exists)
        return null;
    return { id: machineDoc.id, ...machineDoc.data() };
}
/**
 * Create a new stock alert
 */
async function createStockAlert(product, machine) {
    const alertData = {
        productId: product.id,
        productName: product.name,
        machineId: product.machineId,
        machineLocation: machine.location,
        currentStock: product.stock,
        threshold: LOW_STOCK_THRESHOLD,
        status: 'pending',
        createdAt: firebase_1.FieldValue.serverTimestamp(),
        updatedAt: firebase_1.FieldValue.serverTimestamp(),
    };
    const alertRef = await firebase_1.db.collection('stockAlerts').add(alertData);
    functions.logger.info('Created low stock alert', {
        alertId: alertRef.id,
        productId: product.id,
        productName: product.name,
        machineId: product.machineId,
        currentStock: product.stock,
    });
    return alertRef.id;
}
// ============================================
// CHECK STOCK AND CREATE ALERT (Internal Function)
// ============================================
/**
 * Check stock level and create alert if below threshold
 * Called after successful payment verification
 */
async function checkAndCreateStockAlert(productId, currentStock) {
    try {
        // Only proceed if stock is at or below threshold
        if (currentStock > LOW_STOCK_THRESHOLD) {
            return;
        }
        // Check if alert already exists
        const alertExists = await alertExistsForProduct(productId);
        if (alertExists) {
            functions.logger.info('Alert already exists for product', { productId });
            return;
        }
        // Get product details
        const productDoc = await firebase_1.db.collection('products').doc(productId).get();
        if (!productDoc.exists) {
            functions.logger.error('Product not found for alert', { productId });
            return;
        }
        const product = { id: productDoc.id, ...productDoc.data() };
        // Get machine details
        const machine = await getMachineDetails(product.machineId);
        if (!machine) {
            functions.logger.error('Machine not found for alert', {
                machineId: product.machineId,
            });
            return;
        }
        // Create the alert
        await createStockAlert(product, machine);
    }
    catch (error) {
        functions.logger.error('Error checking/creating stock alert:', error);
        // Don't throw - this is a non-critical operation
    }
}
// ============================================
// GET ALL ALERTS HANDLER
// ============================================
/**
 * Get all stock alerts for admin dashboard
 * GET /admin/alerts
 * Query params: status (optional) - filter by alert status
 */
const getAlertsHandler = async (req, res) => {
    try {
        const { status } = req.query;
        let alertsQuery = firebase_1.db
            .collection('stockAlerts')
            .orderBy('createdAt', 'desc');
        // Filter by status if provided
        if (status &&
            ['pending', 'acknowledged', 'resolved'].includes(status)) {
            alertsQuery = firebase_1.db
                .collection('stockAlerts')
                .where('status', '==', status)
                .orderBy('createdAt', 'desc');
        }
        const alertsSnapshot = await alertsQuery.limit(100).get();
        const alerts = [];
        alertsSnapshot.forEach((doc) => {
            alerts.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        functions.logger.info('Retrieved stock alerts', { count: alerts.length });
        res.status(200).json({
            success: true,
            data: alerts,
        });
    }
    catch (error) {
        functions.logger.error('Error getting alerts:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: `Failed to get alerts: ${errorMessage}`,
        });
    }
};
exports.getAlertsHandler = getAlertsHandler;
// ============================================
// ACKNOWLEDGE ALERT HANDLER
// ============================================
/**
 * Mark an alert as acknowledged
 * POST /admin/alerts/:alertId/acknowledge
 */
const acknowledgeAlertHandler = async (req, res) => {
    try {
        const { alertId } = req.params;
        if (!alertId) {
            res.status(400).json({
                success: false,
                error: 'Alert ID is required',
            });
            return;
        }
        const alertRef = firebase_1.db.collection('stockAlerts').doc(alertId);
        const alertDoc = await alertRef.get();
        if (!alertDoc.exists) {
            res.status(404).json({
                success: false,
                error: 'Alert not found',
            });
            return;
        }
        await alertRef.update({
            status: 'acknowledged',
            acknowledgedAt: firebase_1.FieldValue.serverTimestamp(),
            updatedAt: firebase_1.FieldValue.serverTimestamp(),
        });
        functions.logger.info('Alert acknowledged', { alertId });
        res.status(200).json({
            success: true,
            message: 'Alert acknowledged successfully',
        });
    }
    catch (error) {
        functions.logger.error('Error acknowledging alert:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: `Failed to acknowledge alert: ${errorMessage}`,
        });
    }
};
exports.acknowledgeAlertHandler = acknowledgeAlertHandler;
// ============================================
// RESOLVE ALERT HANDLER
// ============================================
/**
 * Mark an alert as resolved (after refilling stock)
 * POST /admin/alerts/:alertId/resolve
 */
const resolveAlertHandler = async (req, res) => {
    try {
        const { alertId } = req.params;
        if (!alertId) {
            res.status(400).json({
                success: false,
                error: 'Alert ID is required',
            });
            return;
        }
        const alertRef = firebase_1.db.collection('stockAlerts').doc(alertId);
        const alertDoc = await alertRef.get();
        if (!alertDoc.exists) {
            res.status(404).json({
                success: false,
                error: 'Alert not found',
            });
            return;
        }
        await alertRef.update({
            status: 'resolved',
            resolvedAt: firebase_1.FieldValue.serverTimestamp(),
            updatedAt: firebase_1.FieldValue.serverTimestamp(),
        });
        functions.logger.info('Alert resolved', { alertId });
        res.status(200).json({
            success: true,
            message: 'Alert resolved successfully',
        });
    }
    catch (error) {
        functions.logger.error('Error resolving alert:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: `Failed to resolve alert: ${errorMessage}`,
        });
    }
};
exports.resolveAlertHandler = resolveAlertHandler;
// ============================================
// GET LOW STOCK PRODUCTS HANDLER
// ============================================
/**
 * Get all products with low stock (for admin overview)
 * GET /admin/low-stock
 */
const getLowStockProductsHandler = async (req, res) => {
    try {
        // Get all products with stock <= threshold
        const productsSnapshot = await firebase_1.db
            .collection('products')
            .where('stock', '<=', LOW_STOCK_THRESHOLD)
            .get();
        const lowStockProducts = [];
        // Get machine details for each product
        for (const doc of productsSnapshot.docs) {
            const product = { id: doc.id, ...doc.data() };
            const machine = await getMachineDetails(product.machineId);
            lowStockProducts.push({
                product,
                machineLocation: (machine === null || machine === void 0 ? void 0 : machine.location) || 'Unknown Location',
            });
        }
        // Sort by stock (lowest first)
        lowStockProducts.sort((a, b) => a.product.stock - b.product.stock);
        functions.logger.info('Retrieved low stock products', {
            count: lowStockProducts.length,
        });
        res.status(200).json({
            success: true,
            data: lowStockProducts,
            threshold: LOW_STOCK_THRESHOLD,
        });
    }
    catch (error) {
        functions.logger.error('Error getting low stock products:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: `Failed to get low stock products: ${errorMessage}`,
        });
    }
};
exports.getLowStockProductsHandler = getLowStockProductsHandler;
// ============================================
// CHECK ALL PRODUCTS AND CREATE ALERTS
// ============================================
/**
 * Scan all products and create alerts for low stock items
 * POST /admin/check-stock
 * Useful for initial setup or manual checks
 */
const checkAllStockHandler = async (req, res) => {
    try {
        // Get all products with low stock
        const productsSnapshot = await firebase_1.db
            .collection('products')
            .where('stock', '<=', LOW_STOCK_THRESHOLD)
            .get();
        let alertsCreated = 0;
        let alertsSkipped = 0;
        for (const doc of productsSnapshot.docs) {
            const product = { id: doc.id, ...doc.data() };
            // Check if alert already exists
            const alertExists = await alertExistsForProduct(product.id);
            if (alertExists) {
                alertsSkipped++;
                continue;
            }
            // Get machine details
            const machine = await getMachineDetails(product.machineId);
            if (!machine)
                continue;
            // Create alert
            await createStockAlert(product, machine);
            alertsCreated++;
        }
        functions.logger.info('Stock check completed', {
            alertsCreated,
            alertsSkipped,
            totalLowStock: productsSnapshot.size,
        });
        res.status(200).json({
            success: true,
            message: `Stock check completed. ${alertsCreated} new alerts created, ${alertsSkipped} already had alerts.`,
            alertsCreated,
            alertsSkipped,
            totalLowStock: productsSnapshot.size,
        });
    }
    catch (error) {
        functions.logger.error('Error checking all stock:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: `Failed to check stock: ${errorMessage}`,
        });
    }
};
exports.checkAllStockHandler = checkAllStockHandler;
//# sourceMappingURL=stockAlerts.js.map