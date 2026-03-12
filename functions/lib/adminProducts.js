"use strict";
/**
 * Admin Products Handler
 *
 * Full CRUD operations for product management by admin.
 * Allows admin to add, update, delete, and view all products.
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
exports.updateStockHandler = exports.getAllMachinesHandler = exports.deleteProductHandler = exports.updateProductHandler = exports.createProductHandler = exports.getProductHandler = exports.getAllProductsHandler = void 0;
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("./firebase");
// ============================================
// GET ALL PRODUCTS
// ============================================
/**
 * Get all products for admin management
 * GET /admin/products
 * Query params: machineId (optional) - filter by machine
 */
const getAllProductsHandler = async (req, res) => {
    try {
        const { machineId } = req.query;
        let productsQuery = firebase_1.db.collection('products');
        if (machineId && typeof machineId === 'string') {
            productsQuery = productsQuery.where('machineId', '==', machineId);
        }
        const snapshot = await productsQuery.orderBy('name').get();
        const products = [];
        snapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data(),
            });
        });
        functions.logger.info('Retrieved all products for admin', {
            count: products.length,
            machineId: machineId || 'all',
        });
        res.status(200).json({
            success: true,
            data: products,
        });
    }
    catch (error) {
        functions.logger.error('Error getting products:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: `Failed to get products: ${errorMessage}`,
        });
    }
};
exports.getAllProductsHandler = getAllProductsHandler;
// ============================================
// GET SINGLE PRODUCT
// ============================================
/**
 * Get a single product by ID
 * GET /admin/products/:productId
 */
const getProductHandler = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            res.status(400).json({
                success: false,
                error: 'Product ID is required',
            });
            return;
        }
        const productDoc = await firebase_1.db.collection('products').doc(productId).get();
        if (!productDoc.exists) {
            res.status(404).json({
                success: false,
                error: 'Product not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: {
                id: productDoc.id,
                ...productDoc.data(),
            },
        });
    }
    catch (error) {
        functions.logger.error('Error getting product:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: `Failed to get product: ${errorMessage}`,
        });
    }
};
exports.getProductHandler = getProductHandler;
// ============================================
// CREATE PRODUCT
// ============================================
/**
 * Create a new product
 * POST /admin/products
 * Body: { name, price, stock, machineId, category?, imageUrl?, description? }
 */
const createProductHandler = async (req, res) => {
    try {
        const { name, price, stock, machineId, category, imageUrl, description } = req.body;
        // Validate required fields
        if (!name || typeof name !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Product name is required',
            });
            return;
        }
        if (typeof price !== 'number' || price < 0) {
            res.status(400).json({
                success: false,
                error: 'Valid price is required',
            });
            return;
        }
        if (typeof stock !== 'number' || stock < 0) {
            res.status(400).json({
                success: false,
                error: 'Valid stock quantity is required',
            });
            return;
        }
        if (!machineId || typeof machineId !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Machine ID is required',
            });
            return;
        }
        // Verify machine exists
        const machineDoc = await firebase_1.db.collection('machines').doc(machineId).get();
        if (!machineDoc.exists) {
            res.status(400).json({
                success: false,
                error: 'Machine not found',
            });
            return;
        }
        // Create product data
        const productData = {
            name: name.trim(),
            price,
            stock,
            machineId,
            category: category || 'general',
            imageUrl: imageUrl || '',
            description: description || '',
            createdAt: firebase_1.FieldValue.serverTimestamp(),
            updatedAt: firebase_1.FieldValue.serverTimestamp(),
        };
        // Generate a custom ID based on machine and product name
        const productId = `prod-${machineId}-${name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .substring(0, 20)}-${Date.now().toString(36)}`;
        await firebase_1.db.collection('products').doc(productId).set(productData);
        functions.logger.info('Product created', {
            productId,
            name,
            machineId,
        });
        res.status(201).json({
            success: true,
            data: {
                id: productId,
                ...productData,
            },
            message: 'Product created successfully',
        });
    }
    catch (error) {
        functions.logger.error('Error creating product:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: `Failed to create product: ${errorMessage}`,
        });
    }
};
exports.createProductHandler = createProductHandler;
// ============================================
// UPDATE PRODUCT
// ============================================
/**
 * Update an existing product
 * PUT /admin/products/:productId
 * Body: { name?, price?, stock?, category?, imageUrl?, description? }
 */
const updateProductHandler = async (req, res) => {
    try {
        const { productId } = req.params;
        const { name, price, stock, category, imageUrl, description } = req.body;
        if (!productId) {
            res.status(400).json({
                success: false,
                error: 'Product ID is required',
            });
            return;
        }
        // Check if product exists
        const productRef = firebase_1.db.collection('products').doc(productId);
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            res.status(404).json({
                success: false,
                error: 'Product not found',
            });
            return;
        }
        // Build update object with only provided fields
        const updateData = {
            updatedAt: firebase_1.FieldValue.serverTimestamp(),
        };
        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim() === '') {
                res.status(400).json({
                    success: false,
                    error: 'Invalid product name',
                });
                return;
            }
            updateData.name = name.trim();
        }
        if (price !== undefined) {
            if (typeof price !== 'number' || price < 0) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid price',
                });
                return;
            }
            updateData.price = price;
        }
        if (stock !== undefined) {
            if (typeof stock !== 'number' || stock < 0) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid stock quantity',
                });
                return;
            }
            updateData.stock = stock;
        }
        if (category !== undefined) {
            updateData.category = category;
        }
        if (imageUrl !== undefined) {
            updateData.imageUrl = imageUrl;
        }
        if (description !== undefined) {
            updateData.description = description;
        }
        await productRef.update(updateData);
        // Get updated product
        const updatedDoc = await productRef.get();
        functions.logger.info('Product updated', {
            productId,
            updatedFields: Object.keys(updateData),
        });
        res.status(200).json({
            success: true,
            data: {
                id: updatedDoc.id,
                ...updatedDoc.data(),
            },
            message: 'Product updated successfully',
        });
    }
    catch (error) {
        functions.logger.error('Error updating product:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: `Failed to update product: ${errorMessage}`,
        });
    }
};
exports.updateProductHandler = updateProductHandler;
// ============================================
// DELETE PRODUCT
// ============================================
/**
 * Delete a product
 * DELETE /admin/products/:productId
 */
const deleteProductHandler = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            res.status(400).json({
                success: false,
                error: 'Product ID is required',
            });
            return;
        }
        // Check if product exists
        const productRef = firebase_1.db.collection('products').doc(productId);
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            res.status(404).json({
                success: false,
                error: 'Product not found',
            });
            return;
        }
        const productData = productDoc.data();
        await productRef.delete();
        functions.logger.info('Product deleted', {
            productId,
            productName: productData === null || productData === void 0 ? void 0 : productData.name,
        });
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        });
    }
    catch (error) {
        functions.logger.error('Error deleting product:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: `Failed to delete product: ${errorMessage}`,
        });
    }
};
exports.deleteProductHandler = deleteProductHandler;
// ============================================
// GET ALL MACHINES (for dropdowns)
// ============================================
/**
 * Get all machines for admin dropdowns
 * GET /admin/machines
 */
const getAllMachinesHandler = async (req, res) => {
    try {
        const snapshot = await firebase_1.db.collection('machines').get();
        const machines = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            machines.push({
                id: doc.id,
                location: data.location,
                status: data.status,
            });
        });
        res.status(200).json({
            success: true,
            data: machines,
        });
    }
    catch (error) {
        functions.logger.error('Error getting machines:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: `Failed to get machines: ${errorMessage}`,
        });
    }
};
exports.getAllMachinesHandler = getAllMachinesHandler;
// ============================================
// UPDATE STOCK (Quick action)
// ============================================
/**
 * Quick stock update for a product
 * PATCH /admin/products/:productId/stock
 * Body: { stock: number }
 */
const updateStockHandler = async (req, res) => {
    try {
        const { productId } = req.params;
        const { stock } = req.body;
        if (!productId) {
            res.status(400).json({
                success: false,
                error: 'Product ID is required',
            });
            return;
        }
        if (typeof stock !== 'number' || stock < 0) {
            res.status(400).json({
                success: false,
                error: 'Valid stock quantity is required',
            });
            return;
        }
        const productRef = firebase_1.db.collection('products').doc(productId);
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            res.status(404).json({
                success: false,
                error: 'Product not found',
            });
            return;
        }
        await productRef.update({
            stock,
            updatedAt: firebase_1.FieldValue.serverTimestamp(),
        });
        functions.logger.info('Stock updated', {
            productId,
            newStock: stock,
        });
        res.status(200).json({
            success: true,
            message: `Stock updated to ${stock}`,
        });
    }
    catch (error) {
        functions.logger.error('Error updating stock:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: `Failed to update stock: ${errorMessage}`,
        });
    }
};
exports.updateStockHandler = updateStockHandler;
//# sourceMappingURL=adminProducts.js.map