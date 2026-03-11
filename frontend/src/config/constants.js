/**
 * Application Constants
 * 
 * Central location for all configuration constants.
 * Uses environment variables for sensitive/environment-specific values.
 */

// ============================================
// API CONFIGURATION
// ============================================

/**
 * Backend API base URL
 * In development: Points to Firebase emulator
 * In production: Points to Vercel serverless functions (/api)
 * 
 * Priority order:
 * 1. REACT_APP_API_BASE_URL environment variable (if set)
 * 2. Relative /api for production (works with any deployed domain)
 * 3. Local Firebase emulator for development
 */
const getApiBaseUrl = () => {
        // If explicitly set in environment, use that (highest priority)
        if (process.env.REACT_APP_API_BASE_URL) {
                return process.env.REACT_APP_API_BASE_URL;
        }

        // Production: Use relative path (works with any domain like Vercel)
        // This will use the same domain the app is deployed on
        if (process.env.NODE_ENV === 'production') {
                return '/api';
        }

        // Local development: Use Firebase emulator with full path
        // Matches local Firebase setup on port 5001
        return 'http://localhost:5001/vending-machine-web/asia-south1/api';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Enable mock payment flow during local development
 */
export const ENABLE_PAYMENT_SIMULATION = process.env.REACT_APP_ENABLE_PAYMENT_SIMULATION === 'true';

// ============================================
// RAZORPAY CONFIGURATION
// ============================================

/**
 * Razorpay public key ID (safe to expose in frontend)
 * Get this from your Razorpay Dashboard
 */
export const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || '';

/**
 * Razorpay checkout options
 */
export const RAZORPAY_OPTIONS = {
        name: 'Smart Vending',
        description: 'Vending Machine Purchase',
        // image: '/logo192.png', // Disabled — causes CORS error when Razorpay fetches from localhost
        theme: {
                color: '#3b82f6', // Primary blue
        },
        modal: {
                ondismiss: () => {
                        console.log('Payment modal dismissed');
                },
        },
};

// ============================================
// STOCK THRESHOLDS
// ============================================

/**
 * Stock level thresholds for UI display
 */
export const STOCK_THRESHOLDS = {
        HIGH: 10,    // Above this: green, "In Stock"
        LOW: 5,      // Above this but below HIGH: yellow, "Low Stock"
        CRITICAL: 2, // Above this but below LOW: orange, "Almost Out"
        // Below CRITICAL: red, "Only X left!"
};

// ============================================
// UI CONSTANTS
// ============================================

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION = {
        STOCK_UPDATE_FLASH: 500,
        CARD_HOVER: 300,
        MODAL_TRANSITION: 300,
};

/**
 * Polling intervals (in milliseconds)
 * Note: We use real-time listeners, but these are backups
 */
export const POLLING = {
        MACHINE_STATUS: 30000, // Check machine online status every 30s
};

// ============================================
// ERROR MESSAGES
// ============================================

export const ERROR_MESSAGES = {
        MACHINE_NOT_FOUND: 'Vending machine not found. Please scan a valid QR code.',
        MACHINE_OFFLINE: 'This vending machine is currently offline. Please try again later.',
        PRODUCT_NOT_FOUND: 'Product not found.',
        OUT_OF_STOCK: 'Sorry, this product is out of stock.',
        PAYMENT_FAILED: 'Payment failed. Please try again.',
        PAYMENT_CANCELLED: 'Payment was cancelled.',
        NETWORK_ERROR: 'Network error. Please check your connection.',
        GENERIC_ERROR: 'Something went wrong. Please try again.',
};

// ============================================
// SUCCESS MESSAGES
// ============================================

export const SUCCESS_MESSAGES = {
        PAYMENT_SUCCESS: 'Payment successful! Your product will be dispensed.',
        ORDER_CREATED: 'Order created. Proceeding to payment...',
};
