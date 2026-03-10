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

import { Request, Response } from 'express';
import * as functions from 'firebase-functions';
import { db, FieldValue } from './firebase';

// ============================================
// CONSTANTS
// ============================================

const LOW_STOCK_THRESHOLD = 3; // Alert when stock is at or below this

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Product {
        id?: string;
        name: string;
        price: number;
        stock: number;
        machineId: string;
        category?: string;
}

interface Machine {
        id?: string;
        location: string;
        status: string;
}

interface StockAlert {
        id?: string;
        productId: string;
        productName: string;
        machineId: string;
        machineLocation: string;
        currentStock: number;
        threshold: number;
        status: 'pending' | 'acknowledged' | 'resolved';
        createdAt: FirebaseFirestore.FieldValue;
        updatedAt: FirebaseFirestore.FieldValue;
        acknowledgedAt?: FirebaseFirestore.FieldValue;
        resolvedAt?: FirebaseFirestore.FieldValue;
}

interface AlertResponse {
        success: boolean;
        data?: StockAlert[] | StockAlert;
        message?: string;
        error?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if an active alert already exists for a product
 */
async function alertExistsForProduct(productId: string): Promise<boolean> {
        const existingAlert = await db
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
async function getMachineDetails(machineId: string): Promise<Machine | null> {
        const machineDoc = await db.collection('machines').doc(machineId).get();
        if (!machineDoc.exists) return null;
        return { id: machineDoc.id, ...machineDoc.data() } as Machine;
}

/**
 * Create a new stock alert
 */
async function createStockAlert(
        product: Product & { id: string },
        machine: Machine,
): Promise<string> {
        const alertData: StockAlert = {
                productId: product.id,
                productName: product.name,
                machineId: product.machineId,
                machineLocation: machine.location,
                currentStock: product.stock,
                threshold: LOW_STOCK_THRESHOLD,
                status: 'pending',
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
        };

        const alertRef = await db.collection('stockAlerts').add(alertData);
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
export async function checkAndCreateStockAlert(
        productId: string,
        currentStock: number,
): Promise<void> {
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
                const productDoc = await db.collection('products').doc(productId).get();
                if (!productDoc.exists) {
                        functions.logger.error('Product not found for alert', { productId });
                        return;
                }

                const product = { id: productDoc.id, ...productDoc.data() } as Product & {
                        id: string;
                };

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
        } catch (error) {
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
export const getAlertsHandler = async (
        req: Request,
        res: Response,
): Promise<void> => {
        try {
                const { status } = req.query;

                let alertsQuery = db
                        .collection('stockAlerts')
                        .orderBy('createdAt', 'desc');

                // Filter by status if provided
                if (
                        status &&
                        ['pending', 'acknowledged', 'resolved'].includes(status as string)
                ) {
                        alertsQuery = db
                                .collection('stockAlerts')
                                .where('status', '==', status)
                                .orderBy('createdAt', 'desc');
                }

                const alertsSnapshot = await alertsQuery.limit(100).get();

                const alerts: StockAlert[] = [];
                alertsSnapshot.forEach((doc) => {
                        alerts.push({
                                id: doc.id,
                                ...doc.data(),
                        } as StockAlert);
                });

                functions.logger.info('Retrieved stock alerts', { count: alerts.length });

                res.status(200).json({
                        success: true,
                        data: alerts,
                } as AlertResponse);
        } catch (error) {
                functions.logger.error('Error getting alerts:', error);
                const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error';
                res.status(500).json({
                        success: false,
                        error: `Failed to get alerts: ${errorMessage}`,
                } as AlertResponse);
        }
};

// ============================================
// ACKNOWLEDGE ALERT HANDLER
// ============================================

/**
 * Mark an alert as acknowledged
 * POST /admin/alerts/:alertId/acknowledge
 */
export const acknowledgeAlertHandler = async (
        req: Request,
        res: Response,
): Promise<void> => {
        try {
                const { alertId } = req.params;

                if (!alertId) {
                        res.status(400).json({
                                success: false,
                                error: 'Alert ID is required',
                        } as AlertResponse);
                        return;
                }

                const alertRef = db.collection('stockAlerts').doc(alertId);
                const alertDoc = await alertRef.get();

                if (!alertDoc.exists) {
                        res.status(404).json({
                                success: false,
                                error: 'Alert not found',
                        } as AlertResponse);
                        return;
                }

                await alertRef.update({
                        status: 'acknowledged',
                        acknowledgedAt: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp(),
                });

                functions.logger.info('Alert acknowledged', { alertId });

                res.status(200).json({
                        success: true,
                        message: 'Alert acknowledged successfully',
                } as AlertResponse);
        } catch (error) {
                functions.logger.error('Error acknowledging alert:', error);
                const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error';
                res.status(500).json({
                        success: false,
                        error: `Failed to acknowledge alert: ${errorMessage}`,
                } as AlertResponse);
        }
};

// ============================================
// RESOLVE ALERT HANDLER
// ============================================

/**
 * Mark an alert as resolved (after refilling stock)
 * POST /admin/alerts/:alertId/resolve
 */
export const resolveAlertHandler = async (
        req: Request,
        res: Response,
): Promise<void> => {
        try {
                const { alertId } = req.params;

                if (!alertId) {
                        res.status(400).json({
                                success: false,
                                error: 'Alert ID is required',
                        } as AlertResponse);
                        return;
                }

                const alertRef = db.collection('stockAlerts').doc(alertId);
                const alertDoc = await alertRef.get();

                if (!alertDoc.exists) {
                        res.status(404).json({
                                success: false,
                                error: 'Alert not found',
                        } as AlertResponse);
                        return;
                }

                await alertRef.update({
                        status: 'resolved',
                        resolvedAt: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp(),
                });

                functions.logger.info('Alert resolved', { alertId });

                res.status(200).json({
                        success: true,
                        message: 'Alert resolved successfully',
                } as AlertResponse);
        } catch (error) {
                functions.logger.error('Error resolving alert:', error);
                const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error';
                res.status(500).json({
                        success: false,
                        error: `Failed to resolve alert: ${errorMessage}`,
                } as AlertResponse);
        }
};

// ============================================
// GET LOW STOCK PRODUCTS HANDLER
// ============================================

/**
 * Get all products with low stock (for admin overview)
 * GET /admin/low-stock
 */
export const getLowStockProductsHandler = async (
        req: Request,
        res: Response,
): Promise<void> => {
        try {
                // Get all products with stock <= threshold
                const productsSnapshot = await db
                        .collection('products')
                        .where('stock', '<=', LOW_STOCK_THRESHOLD)
                        .get();

                const lowStockProducts: Array<{
                        product: Product & { id: string };
                        machineLocation: string;
                }> = [];

                // Get machine details for each product
                for (const doc of productsSnapshot.docs) {
                        const product = { id: doc.id, ...doc.data() } as Product & { id: string };
                        const machine = await getMachineDetails(product.machineId);

                        lowStockProducts.push({
                                product,
                                machineLocation: machine?.location || 'Unknown Location',
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
        } catch (error) {
                functions.logger.error('Error getting low stock products:', error);
                const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error';
                res.status(500).json({
                        success: false,
                        error: `Failed to get low stock products: ${errorMessage}`,
                });
        }
};

// ============================================
// CHECK ALL PRODUCTS AND CREATE ALERTS
// ============================================

/**
 * Scan all products and create alerts for low stock items
 * POST /admin/check-stock
 * Useful for initial setup or manual checks
 */
export const checkAllStockHandler = async (
        req: Request,
        res: Response,
): Promise<void> => {
        try {
                // Get all products with low stock
                const productsSnapshot = await db
                        .collection('products')
                        .where('stock', '<=', LOW_STOCK_THRESHOLD)
                        .get();

                let alertsCreated = 0;
                let alertsSkipped = 0;

                for (const doc of productsSnapshot.docs) {
                        const product = { id: doc.id, ...doc.data() } as Product & { id: string };

                        // Check if alert already exists
                        const alertExists = await alertExistsForProduct(product.id);
                        if (alertExists) {
                                alertsSkipped++;
                                continue;
                        }

                        // Get machine details
                        const machine = await getMachineDetails(product.machineId);
                        if (!machine) continue;

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
        } catch (error) {
                functions.logger.error('Error checking all stock:', error);
                const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error';
                res.status(500).json({
                        success: false,
                        error: `Failed to check stock: ${errorMessage}`,
                });
        }
};
