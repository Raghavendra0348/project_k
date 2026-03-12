"use strict";
/**
 * Input Validation Utilities
 *
 * Provides validation functions for all API inputs.
 * Never trust frontend data - validate everything server-side.
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
exports.logValidationError = exports.validateDispenseInput = exports.validateVerifyPaymentInput = exports.validateCreateOrderInput = void 0;
const functions = __importStar(require("firebase-functions"));
// ============================================
// VALIDATION HELPERS
// ============================================
/**
 * Check if a string is non-empty and within length limits
 * @param {unknown} value - Value to check
 * @param {number} minLength - Minimum length (default 1)
 * @param {number} maxLength - Maximum length (default 100)
 * @return {boolean} Whether value is a valid string
 */
const isValidString = (value, minLength = 1, maxLength = 100) => {
    return (typeof value === 'string' &&
        value.trim().length >= minLength &&
        value.length <= maxLength);
};
/**
 * Check if a value looks like a valid Firestore document ID
 * Document IDs should be alphanumeric with optional hyphens/underscores
 * @param {unknown} value - Value to check
 * @return {boolean} Whether value is a valid document ID
 */
const isValidDocId = (value) => {
    if (typeof value !== 'string')
        return false;
    // Allow alphanumeric, hyphens, underscores; 1-100 chars
    const docIdRegex = /^[a-zA-Z0-9_-]{1,100}$/;
    return docIdRegex.test(value);
};
/**
 * Check if a value looks like a valid Razorpay order ID
 * Format: order_XXXXXXXXXXXXX
 * @param {unknown} value - Value to check
 * @return {boolean} Whether value is a valid Razorpay order ID
 */
const isValidRazorpayOrderId = (value) => {
    if (typeof value !== 'string')
        return false;
    return value.startsWith('order_') && value.length > 10;
};
/**
 * Check if a value looks like a valid Razorpay payment ID
 * Format: pay_XXXXXXXXXXXXX
 * @param {unknown} value - Value to check
 * @return {boolean} Whether value is a valid Razorpay payment ID
 */
const isValidRazorpayPaymentId = (value) => {
    if (typeof value !== 'string')
        return false;
    return value.startsWith('pay_') && value.length > 8;
};
/**
 * Check if a value looks like a valid Razorpay signature
 * Should be a 64-character hex string (SHA256)
 * @param {unknown} value - Value to check
 * @return {boolean} Whether value is a valid Razorpay signature
 */
const isValidRazorpaySignature = (value) => {
    if (typeof value !== 'string')
        return false;
    const sigRegex = /^[a-f0-9]{64}$/i;
    return sigRegex.test(value);
};
// ============================================
// MAIN VALIDATION FUNCTIONS
// ============================================
/**
 * Validate create order request
 * @param {unknown} body - Request body to validate
 * @return {ValidationResult} Validation result
 */
const validateCreateOrderInput = (body) => {
    if (!body || typeof body !== 'object') {
        return { isValid: false, error: 'Request body is required' };
    }
    const input = body;
    // Validate productId
    if (!isValidDocId(input.productId)) {
        return {
            isValid: false,
            error: 'Invalid productId: must be a valid document ID',
        };
    }
    // Validate machineId
    if (!isValidDocId(input.machineId)) {
        return {
            isValid: false,
            error: 'Invalid machineId: must be a valid document ID',
        };
    }
    return { isValid: true };
};
exports.validateCreateOrderInput = validateCreateOrderInput;
/**
 * Validate verify payment request
 * @param {unknown} body - Request body to validate
 * @return {ValidationResult} Validation result
 */
const validateVerifyPaymentInput = (body) => {
    if (!body || typeof body !== 'object') {
        return { isValid: false, error: 'Request body is required' };
    }
    const input = body;
    const allowSimulation = process.env.ENABLE_PAYMENT_SIMULATION === 'true';
    // Validate Razorpay order ID
    const orderIdValid = isValidRazorpayOrderId(input.razorpay_order_id) ||
        (allowSimulation && isValidString(input.razorpay_order_id, 3, 200));
    if (!orderIdValid) {
        return {
            isValid: false,
            error: 'Invalid razorpay_order_id format',
        };
    }
    // Validate Razorpay payment ID
    const paymentIdValid = isValidRazorpayPaymentId(input.razorpay_payment_id) ||
        (allowSimulation && isValidString(input.razorpay_payment_id, 3, 200));
    if (!paymentIdValid) {
        return {
            isValid: false,
            error: 'Invalid razorpay_payment_id format',
        };
    }
    // Validate Razorpay signature
    const signatureValid = isValidRazorpaySignature(input.razorpay_signature) ||
        (allowSimulation && isValidString(input.razorpay_signature, 3, 500));
    if (!signatureValid) {
        return {
            isValid: false,
            error: 'Invalid razorpay_signature format',
        };
    }
    // Validate productId
    if (!isValidDocId(input.productId)) {
        return {
            isValid: false,
            error: 'Invalid productId',
        };
    }
    // Validate machineId
    if (!isValidDocId(input.machineId)) {
        return {
            isValid: false,
            error: 'Invalid machineId',
        };
    }
    // Validate internal order ID
    if (!isValidString(input.internalOrderId, 1, 200)) {
        return {
            isValid: false,
            error: 'Invalid internalOrderId',
        };
    }
    return { isValid: true };
};
exports.validateVerifyPaymentInput = validateVerifyPaymentInput;
/**
 * Validate dispense request
 * @param {unknown} body - Request body to validate
 * @return {ValidationResult} Validation result
 */
const validateDispenseInput = (body) => {
    if (!body || typeof body !== 'object') {
        return { isValid: false, error: 'Request body is required' };
    }
    const input = body;
    // Validate machineId
    if (!isValidDocId(input.machineId)) {
        return {
            isValid: false,
            error: 'Invalid machineId',
        };
    }
    // Validate productId
    if (!isValidDocId(input.productId)) {
        return {
            isValid: false,
            error: 'Invalid productId',
        };
    }
    // Validate orderId
    if (!isValidString(input.orderId, 1, 200)) {
        return {
            isValid: false,
            error: 'Invalid orderId',
        };
    }
    return { isValid: true };
};
exports.validateDispenseInput = validateDispenseInput;
/**
 * Log validation error
 * @param {string} endpoint - API endpoint name
 * @param {string} error - Error message
 * @param {unknown} body - Request body that failed validation
 */
const logValidationError = (endpoint, error, body) => {
    functions.logger.warn('Validation failed', {
        endpoint,
        error,
        body: JSON.stringify(body).substring(0, 500), // Truncate for logging
    });
};
exports.logValidationError = logValidationError;
//# sourceMappingURL=validation.js.map