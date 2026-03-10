/**
 * Admin Products Handler
 *
 * Full CRUD operations for product management by admin.
 * Allows admin to add, update, delete, and view all products.
 */

import { Request, Response } from 'express';
import * as functions from 'firebase-functions';
import { db, FieldValue } from './firebase';

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
        imageUrl?: string;
        description?: string;
        createdAt?: FirebaseFirestore.FieldValue;
        updatedAt?: FirebaseFirestore.FieldValue;
}

interface ProductResponse {
        success: boolean;
        data?: Product | Product[];
        message?: string;
        error?: string;
}

// ============================================
// GET ALL PRODUCTS
// ============================================

/**
 * Get all products for admin management
 * GET /admin/products
 * Query params: machineId (optional) - filter by machine
 */
export const getAllProductsHandler = async (
        req: Request,
        res: Response,
): Promise<void> => {
        try {
                const { machineId } = req.query;

                let productsQuery: FirebaseFirestore.Query = db.collection('products');

                if (machineId && typeof machineId === 'string') {
                        productsQuery = productsQuery.where('machineId', '==', machineId);
                }

                const snapshot = await productsQuery.orderBy('name').get();

                const products: Product[] = [];
                snapshot.forEach((doc) => {
                        products.push({
                                id: doc.id,
                                ...doc.data(),
                        } as Product);
                });

                functions.logger.info('Retrieved all products for admin', {
                        count: products.length,
                        machineId: machineId || 'all',
                });

                res.status(200).json({
                        success: true,
                        data: products,
                } as ProductResponse);
        } catch (error) {
                functions.logger.error('Error getting products:', error);
                const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error';
                res.status(500).json({
                        success: false,
                        error: `Failed to get products: ${errorMessage}`,
                } as ProductResponse);
        }
};

// ============================================
// GET SINGLE PRODUCT
// ============================================

/**
 * Get a single product by ID
 * GET /admin/products/:productId
 */
export const getProductHandler = async (
        req: Request,
        res: Response,
): Promise<void> => {
        try {
                const { productId } = req.params;

                if (!productId) {
                        res.status(400).json({
                                success: false,
                                error: 'Product ID is required',
                        } as ProductResponse);
                        return;
                }

                const productDoc = await db.collection('products').doc(productId).get();

                if (!productDoc.exists) {
                        res.status(404).json({
                                success: false,
                                error: 'Product not found',
                        } as ProductResponse);
                        return;
                }

                res.status(200).json({
                        success: true,
                        data: {
                                id: productDoc.id,
                                ...productDoc.data(),
                        },
                } as ProductResponse);
        } catch (error) {
                functions.logger.error('Error getting product:', error);
                const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error';
                res.status(500).json({
                        success: false,
                        error: `Failed to get product: ${errorMessage}`,
                } as ProductResponse);
        }
};

// ============================================
// CREATE PRODUCT
// ============================================

/**
 * Create a new product
 * POST /admin/products
 * Body: { name, price, stock, machineId, category?, imageUrl?, description? }
 */
export const createProductHandler = async (
        req: Request,
        res: Response,
): Promise<void> => {
        try {
                const { name, price, stock, machineId, category, imageUrl, description } =
                        req.body;

                // Validate required fields
                if (!name || typeof name !== 'string') {
                        res.status(400).json({
                                success: false,
                                error: 'Product name is required',
                        } as ProductResponse);
                        return;
                }

                if (typeof price !== 'number' || price < 0) {
                        res.status(400).json({
                                success: false,
                                error: 'Valid price is required',
                        } as ProductResponse);
                        return;
                }

                if (typeof stock !== 'number' || stock < 0) {
                        res.status(400).json({
                                success: false,
                                error: 'Valid stock quantity is required',
                        } as ProductResponse);
                        return;
                }

                if (!machineId || typeof machineId !== 'string') {
                        res.status(400).json({
                                success: false,
                                error: 'Machine ID is required',
                        } as ProductResponse);
                        return;
                }

                // Verify machine exists
                const machineDoc = await db.collection('machines').doc(machineId).get();
                if (!machineDoc.exists) {
                        res.status(400).json({
                                success: false,
                                error: 'Machine not found',
                        } as ProductResponse);
                        return;
                }

                // Create product data
                const productData: Omit<Product, 'id'> = {
                        name: name.trim(),
                        price,
                        stock,
                        machineId,
                        category: category || 'general',
                        imageUrl: imageUrl || '',
                        description: description || '',
                        createdAt: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp(),
                };

                // Generate a custom ID based on machine and product name
                const productId = `prod-${machineId}-${name
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, '')
                        .substring(0, 20)}-${Date.now().toString(36)}`;

                await db.collection('products').doc(productId).set(productData);

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
                } as ProductResponse);
        } catch (error) {
                functions.logger.error('Error creating product:', error);
                const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error';
                res.status(500).json({
                        success: false,
                        error: `Failed to create product: ${errorMessage}`,
                } as ProductResponse);
        }
};

// ============================================
// UPDATE PRODUCT
// ============================================

/**
 * Update an existing product
 * PUT /admin/products/:productId
 * Body: { name?, price?, stock?, category?, imageUrl?, description? }
 */
export const updateProductHandler = async (
        req: Request,
        res: Response,
): Promise<void> => {
        try {
                const { productId } = req.params;
                const { name, price, stock, category, imageUrl, description } = req.body;

                if (!productId) {
                        res.status(400).json({
                                success: false,
                                error: 'Product ID is required',
                        } as ProductResponse);
                        return;
                }

                // Check if product exists
                const productRef = db.collection('products').doc(productId);
                const productDoc = await productRef.get();

                if (!productDoc.exists) {
                        res.status(404).json({
                                success: false,
                                error: 'Product not found',
                        } as ProductResponse);
                        return;
                }

                // Build update object with only provided fields
                const updateData: Partial<Product> & {
                        updatedAt: FirebaseFirestore.FieldValue;
                } = {
                        updatedAt: FieldValue.serverTimestamp(),
                };

                if (name !== undefined) {
                        if (typeof name !== 'string' || name.trim() === '') {
                                res.status(400).json({
                                        success: false,
                                        error: 'Invalid product name',
                                } as ProductResponse);
                                return;
                        }
                        updateData.name = name.trim();
                }

                if (price !== undefined) {
                        if (typeof price !== 'number' || price < 0) {
                                res.status(400).json({
                                        success: false,
                                        error: 'Invalid price',
                                } as ProductResponse);
                                return;
                        }
                        updateData.price = price;
                }

                if (stock !== undefined) {
                        if (typeof stock !== 'number' || stock < 0) {
                                res.status(400).json({
                                        success: false,
                                        error: 'Invalid stock quantity',
                                } as ProductResponse);
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
                } as ProductResponse);
        } catch (error) {
                functions.logger.error('Error updating product:', error);
                const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error';
                res.status(500).json({
                        success: false,
                        error: `Failed to update product: ${errorMessage}`,
                } as ProductResponse);
        }
};

// ============================================
// DELETE PRODUCT
// ============================================

/**
 * Delete a product
 * DELETE /admin/products/:productId
 */
export const deleteProductHandler = async (
        req: Request,
        res: Response,
): Promise<void> => {
        try {
                const { productId } = req.params;

                if (!productId) {
                        res.status(400).json({
                                success: false,
                                error: 'Product ID is required',
                        } as ProductResponse);
                        return;
                }

                // Check if product exists
                const productRef = db.collection('products').doc(productId);
                const productDoc = await productRef.get();

                if (!productDoc.exists) {
                        res.status(404).json({
                                success: false,
                                error: 'Product not found',
                        } as ProductResponse);
                        return;
                }

                const productData = productDoc.data();

                await productRef.delete();

                functions.logger.info('Product deleted', {
                        productId,
                        productName: productData?.name,
                });

                res.status(200).json({
                        success: true,
                        message: 'Product deleted successfully',
                } as ProductResponse);
        } catch (error) {
                functions.logger.error('Error deleting product:', error);
                const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error';
                res.status(500).json({
                        success: false,
                        error: `Failed to delete product: ${errorMessage}`,
                } as ProductResponse);
        }
};

// ============================================
// GET ALL MACHINES (for dropdowns)
// ============================================

/**
 * Get all machines for admin dropdowns
 * GET /admin/machines
 */
export const getAllMachinesHandler = async (
        req: Request,
        res: Response,
): Promise<void> => {
        try {
                const snapshot = await db.collection('machines').get();

                const machines: Array<{ id: string; location: string; status: string }> =
                        [];
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
        } catch (error) {
                functions.logger.error('Error getting machines:', error);
                const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error';
                res.status(500).json({
                        success: false,
                        error: `Failed to get machines: ${errorMessage}`,
                });
        }
};

// ============================================
// UPDATE STOCK (Quick action)
// ============================================

/**
 * Quick stock update for a product
 * PATCH /admin/products/:productId/stock
 * Body: { stock: number }
 */
export const updateStockHandler = async (
        req: Request,
        res: Response,
): Promise<void> => {
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

                const productRef = db.collection('products').doc(productId);
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
                        updatedAt: FieldValue.serverTimestamp(),
                });

                functions.logger.info('Stock updated', {
                        productId,
                        newStock: stock,
                });

                res.status(200).json({
                        success: true,
                        message: `Stock updated to ${stock}`,
                });
        } catch (error) {
                functions.logger.error('Error updating stock:', error);
                const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error';
                res.status(500).json({
                        success: false,
                        error: `Failed to update stock: ${errorMessage}`,
                });
        }
};
