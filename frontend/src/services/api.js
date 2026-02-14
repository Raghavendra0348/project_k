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
