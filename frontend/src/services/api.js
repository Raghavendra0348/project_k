/**
 * Backend API Service
 * 
 * Handles all HTTP requests to Firebase Cloud Functions.
 * Provides typed interfaces for request/response data.
 */

import { API_BASE_URL } from '../config/constants';

// ============================================
// TYPE DEFINITIONS (JSDoc for JavaScript)
// ============================================

/**
 * @typedef {Object} CreateOrderResponse
 * @property {boolean} success
 * @property {string} [orderId] - Internal Firestore order ID
 * @property {string} [razorpayOrderId] - Razorpay order ID
 * @property {number} [amount] - Amount in paise
 * @property {string} [currency]
 * @property {string} [keyId] - Razorpay public key
 * @property {string} [productName]
 * @property {string} [error]
 */

/**
 * @typedef {Object} VerifyPaymentResponse
 * @property {boolean} success
 * @property {string} [orderId]
 * @property {string} [message]
 * @property {string} [error]
 */

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Create a Razorpay order for a product purchase
 * 
 * @param {string} productId - Product to purchase
 * @param {string} machineId - Machine the product belongs to
 * @returns {Promise<CreateOrderResponse>}
 */
export const createOrder = async (productId, machineId) => {
        try {
                console.log('📡 [API] Creating order:', { productId, machineId, url: `${API_BASE_URL}/createOrder` });

                const response = await fetch(`${API_BASE_URL}/createOrder`, {
                        method: 'POST',
                        headers: {
                                'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                                productId,
                                machineId,
                        }),
                });

                const data = await response.json();
                console.log('📡 [API] Create order response:', { status: response.status, data });

                if (!response.ok) {
                        throw new Error(data.error || 'Failed to create order');
                }

                return data;
        } catch (error) {
                console.error('❌ [API] Error creating order:', error);
                throw error;
        }
};

/**
 * Verify payment after Razorpay checkout
 * 
 * This is called after successful Razorpay payment to:
 * 1. Verify the payment signature
 * 2. Update stock atomically
 * 3. Mark order as successful
 * 
 * @param {Object} paymentData - Payment data from Razorpay
 * @param {string} paymentData.razorpay_order_id
 * @param {string} paymentData.razorpay_payment_id
 * @param {string} paymentData.razorpay_signature
 * @param {string} productId - Product that was purchased
 * @param {string} machineId - Machine ID
 * @param {string} internalOrderId - Our internal order ID from Firestore
 * @returns {Promise<VerifyPaymentResponse>}
 */
export const verifyPayment = async (paymentData, productId, machineId, internalOrderId) => {
        try {
                const response = await fetch(`${API_BASE_URL}/verifyPayment`, {
                        method: 'POST',
                        headers: {
                                'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                                ...paymentData,
                                productId,
                                machineId,
                                internalOrderId,
                        }),
                });

                const data = await response.json();

                if (!response.ok) {
                        throw new Error(data.error || 'Payment verification failed');
                }

                return data;
        } catch (error) {
                console.error('Error verifying payment:', error);
                throw error;
        }
};

/**
 * Trigger product dispense (called after successful payment)
 * 
 * @param {string} machineId - Machine to dispense from
 * @param {string} productId - Product to dispense
 * @param {string} orderId - Order ID for reference
 * @returns {Promise<Object>}
 */
export const dispenseProduct = async (machineId, productId, orderId) => {
        try {
                const response = await fetch(`${API_BASE_URL}/dispense`, {
                        method: 'POST',
                        headers: {
                                'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                                machineId,
                                productId,
                                orderId,
                        }),
                });

                const data = await response.json();

                if (!response.ok) {
                        throw new Error(data.error || 'Dispense request failed');
                }

                return data;
        } catch (error) {
                console.error('Error dispensing product:', error);
                throw error;
        }
};

/**
 * Health check for API
 * 
 * @returns {Promise<Object>}
 */
export const healthCheck = async () => {
        try {
                const response = await fetch(`${API_BASE_URL}/health`);
                return await response.json();
        } catch (error) {
                console.error('API health check failed:', error);
                throw error;
        }
};

// ============================================
// ADMIN API FUNCTIONS
// ============================================

/**
 * @typedef {Object} StockAlert
 * @property {string} id - Alert ID
 * @property {string} productId - Product ID
 * @property {string} productName - Product name
 * @property {string} machineId - Machine ID
 * @property {string} machineLocation - Machine location
 * @property {number} currentStock - Current stock level
 * @property {number} threshold - Low stock threshold
 * @property {'pending' | 'acknowledged' | 'resolved'} status - Alert status
 * @property {Object} createdAt - Timestamp
 */

/**
 * Get all stock alerts for admin dashboard
 * 
 * @param {string} [status] - Filter by status ('pending', 'acknowledged', 'resolved')
 * @returns {Promise<{success: boolean, data: StockAlert[]}>}
 */
export const getStockAlerts = async (status = null) => {
        try {
                const url = status
                        ? `${API_BASE_URL}/admin-alerts?status=${status}`
                        : `${API_BASE_URL}/admin-alerts`;

                const response = await fetch(url);
                const data = await response.json();

                if (!response.ok) {
                        throw new Error(data.error || 'Failed to fetch alerts');
                }

                return data;
        } catch (error) {
                console.error('Error fetching stock alerts:', error);
                throw error;
        }
};

/**
 * Acknowledge a stock alert
 * 
 * @param {string} alertId - Alert ID to acknowledge
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const acknowledgeAlert = async (alertId) => {
        try {
                const response = await fetch(`${API_BASE_URL}/admin/alerts/${alertId}/acknowledge`, {
                        method: 'POST',
                        headers: {
                                'Content-Type': 'application/json',
                        },
                });

                const data = await response.json();

                if (!response.ok) {
                        throw new Error(data.error || 'Failed to acknowledge alert');
                }

                return data;
        } catch (error) {
                console.error('Error acknowledging alert:', error);
                throw error;
        }
};

/**
 * Resolve a stock alert (after refilling stock)
 * 
 * @param {string} alertId - Alert ID to resolve
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const resolveAlert = async (alertId) => {
        try {
                const response = await fetch(`${API_BASE_URL}/admin/alerts/${alertId}/resolve`, {
                        method: 'POST',
                        headers: {
                                'Content-Type': 'application/json',
                        },
                });

                const data = await response.json();

                if (!response.ok) {
                        throw new Error(data.error || 'Failed to resolve alert');
                }

                return data;
        } catch (error) {
                console.error('Error resolving alert:', error);
                throw error;
        }
};

/**
 * Get all products with low stock
 * 
 * @returns {Promise<{success: boolean, data: Array, threshold: number}>}
 */
export const getLowStockProducts = async () => {
        try {
                const response = await fetch(`${API_BASE_URL}/admin-low-stock`);
                const data = await response.json();

                if (!response.ok) {
                        throw new Error(data.error || 'Failed to fetch low stock products');
                }

                return data;
        } catch (error) {
                console.error('Error fetching low stock products:', error);
                throw error;
        }
};

/**
 * Trigger a stock check and create alerts for low stock products
 * 
 * @returns {Promise<{success: boolean, alertsCreated: number, alertsSkipped: number}>}
 */
export const checkAllStock = async () => {
        try {
                const response = await fetch(`${API_BASE_URL}/admin/check-stock`, {
                        method: 'POST',
                        headers: {
                                'Content-Type': 'application/json',
                        },
                });

                const data = await response.json();

                if (!response.ok) {
                        throw new Error(data.error || 'Failed to check stock');
                }

                return data;
        } catch (error) {
                console.error('Error checking stock:', error);
                throw error;
        }
};

// ============================================
// ADMIN PRODUCT MANAGEMENT API
// ============================================

/**
 * Get all machines for admin dropdowns
 * 
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export const getAllMachines = async () => {
        try {
                const response = await fetch(`${API_BASE_URL}/admin-machines`);
                const data = await response.json();

                if (!response.ok) {
                        throw new Error(data.error || 'Failed to fetch machines');
                }

                return data;
        } catch (error) {
                console.error('Error fetching machines:', error);
                throw error;
        }
};

/**
 * Get all products for admin management
 * 
 * @param {string} [machineId] - Optional machine ID to filter by
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export const getAllProducts = async (machineId = null) => {
        try {
                const url = machineId
                        ? `${API_BASE_URL}/admin-products?machineId=${machineId}`
                        : `${API_BASE_URL}/admin-products`;

                const response = await fetch(url);
                const data = await response.json();

                if (!response.ok) {
                        throw new Error(data.error || 'Failed to fetch products');
                }

                return data;
        } catch (error) {
                console.error('Error fetching products:', error);
                throw error;
        }
};

/**
 * Create a new product
 * 
 * @param {Object} productData - Product data
 * @param {string} productData.name - Product name
 * @param {number} productData.price - Product price
 * @param {number} productData.stock - Stock quantity
 * @param {string} productData.machineId - Machine ID
 * @param {string} [productData.category] - Product category
 * @param {string} [productData.imageUrl] - Product image URL
 * @param {string} [productData.description] - Product description
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export const createProduct = async (productData) => {
        try {
                const response = await fetch(`${API_BASE_URL}/admin/products`, {
                        method: 'POST',
                        headers: {
                                'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(productData),
                });

                const data = await response.json();

                if (!response.ok) {
                        throw new Error(data.error || 'Failed to create product');
                }

                return data;
        } catch (error) {
                console.error('Error creating product:', error);
                throw error;
        }
};

/**
 * Update an existing product
 * 
 * @param {string} productId - Product ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export const updateProduct = async (productId, updates) => {
        try {
                const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
                        method: 'PUT',
                        headers: {
                                'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updates),
                });

                const data = await response.json();

                if (!response.ok) {
                        throw new Error(data.error || 'Failed to update product');
                }

                return data;
        } catch (error) {
                console.error('Error updating product:', error);
                throw error;
        }
};

/**
 * Quick stock update for a product
 * 
 * @param {string} productId - Product ID
 * @param {number} stock - New stock quantity
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const updateProductStock = async (productId, stock) => {
        try {
                const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/stock`, {
                        method: 'PATCH',
                        headers: {
                                'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ stock }),
                });

                const data = await response.json();

                if (!response.ok) {
                        throw new Error(data.error || 'Failed to update stock');
                }

                return data;
        } catch (error) {
                console.error('Error updating stock:', error);
                throw error;
        }
};

/**
 * Delete a product
 * 
 * @param {string} productId - Product ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteProduct = async (productId) => {
        try {
                const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
                        method: 'DELETE',
                });

                const data = await response.json();

                if (!response.ok) {
                        throw new Error(data.error || 'Failed to delete product');
                }

                return data;
        } catch (error) {
                console.error('Error deleting product:', error);
                throw error;
        }
};
