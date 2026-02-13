/**
 * Razorpay Integration Service
 * 
 * Handles Razorpay checkout flow including:
 * - Loading Razorpay script
 * - Opening payment modal
 * - Handling payment callbacks
 */

import { RAZORPAY_KEY_ID, RAZORPAY_OPTIONS } from '../config/constants';

// ============================================
// TYPE DEFINITIONS (JSDoc)
// ============================================

/**
 * @typedef {Object} RazorpayPaymentResponse
 * @property {string} razorpay_order_id
 * @property {string} razorpay_payment_id
 * @property {string} razorpay_signature
 */

/**
 * @typedef {Object} PaymentOptions
 * @property {string} orderId - Razorpay order ID
 * @property {number} amount - Amount in paise
 * @property {string} currency - Currency code (INR)
 * @property {string} productName - Name of product being purchased
 * @property {string} [customerName] - Optional customer name
 * @property {string} [customerEmail] - Optional customer email
 * @property {string} [customerPhone] - Optional customer phone
 */

// ============================================
// RAZORPAY FUNCTIONS
// ============================================

/**
 * Check if Razorpay script is loaded
 * @returns {boolean}
 */
const isRazorpayLoaded = () => {
        return typeof window !== 'undefined' && window.Razorpay !== undefined;
};

/**
 * Load Razorpay script dynamically (backup if not in HTML)
 * @returns {Promise<void>}
 */
const loadRazorpayScript = () => {
        return new Promise((resolve, reject) => {
                if (isRazorpayLoaded()) {
                        resolve();
                        return;
                }

                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                script.onload = resolve;
                script.onerror = () => reject(new Error('Failed to load Razorpay script'));
                document.body.appendChild(script);
        });
};

/**
 * Open Razorpay payment modal
 * 
 * @param {PaymentOptions} options - Payment configuration
 * @returns {Promise<RazorpayPaymentResponse>}
 */
export const openRazorpayCheckout = async (options) => {
        // Ensure Razorpay is loaded
        await loadRazorpayScript();

        return new Promise((resolve, reject) => {
                // Validate required options
                if (!options.orderId || !options.amount) {
                        reject(new Error('Missing required payment options'));
                        return;
                }

                // Get key ID from options or environment
                const keyId = options.keyId || RAZORPAY_KEY_ID;

                if (!keyId) {
                        reject(new Error('Razorpay Key ID not configured'));
                        return;
                }

                // Build Razorpay options
                const razorpayOptions = {
                        key: keyId,
                        amount: options.amount, // Amount in paise
                        currency: options.currency || 'INR',
                        name: RAZORPAY_OPTIONS.name,
                        description: options.productName || RAZORPAY_OPTIONS.description,
                        image: RAZORPAY_OPTIONS.image,
                        order_id: options.orderId,

                        // Success handler
                        handler: function (response) {
                                console.log('Payment successful:', response);
                                resolve({
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_signature: response.razorpay_signature,
                                });
                        },

                        // Prefill customer details (optional)
                        prefill: {
                                name: options.customerName || '',
                                email: options.customerEmail || '',
                                contact: options.customerPhone || '',
                        },

                        // Notes for reference
                        notes: {
                                product: options.productName,
                        },

                        // Theme customization
                        theme: RAZORPAY_OPTIONS.theme,

                        // Modal options
                        modal: {
                                ondismiss: function () {
                                        console.log('Payment modal dismissed by user');
                                        reject(new Error('Payment cancelled by user'));
                                },
                                // Prevent closing on outside click
                                escape: true,
                                // Animation
                                animation: true,
                        },
                };

                try {
                        // Create Razorpay instance
                        const razorpay = new window.Razorpay(razorpayOptions);

                        // Handle payment failure
                        razorpay.on('payment.failed', function (response) {
                                console.error('Payment failed:', response.error);
                                reject(new Error(response.error.description || 'Payment failed'));
                        });

                        // Open the checkout modal
                        razorpay.open();
                } catch (error) {
                        console.error('Error opening Razorpay:', error);
                        reject(error);
                }
        });
};

/**
 * Format amount for display
 * Converts paise to rupees with proper formatting
 * 
 * @param {number} amountInPaise - Amount in paise
 * @returns {string} Formatted amount (e.g., "₹40.00")
 */
export const formatAmount = (amountInPaise) => {
        const rupees = amountInPaise / 100;
        return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
        }).format(rupees);
};

/**
 * Format price for display (when stored in rupees)
 * 
 * @param {number} priceInRupees - Price in rupees
 * @returns {string} Formatted price (e.g., "₹40")
 */
export const formatPrice = (priceInRupees) => {
        return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
        }).format(priceInRupees);
};
