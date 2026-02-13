/**
 * Payment Modal Component
 * 
 * Displays payment processing status and results.
 * Shows different states: processing, success, error.
 */

import React from 'react';
import { CheckCircle, XCircle, Loader2, CreditCard } from 'lucide-react';
import { formatPrice } from '../services/razorpay';

/**
 * Payment Status Types
 */
export const PAYMENT_STATUS = {
        IDLE: 'idle',
        CREATING_ORDER: 'creating_order',
        AWAITING_PAYMENT: 'awaiting_payment',
        VERIFYING: 'verifying',
        SUCCESS: 'success',
        ERROR: 'error',
};

/**
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {string} props.status - Current payment status
 * @param {Object} [props.product] - Product being purchased
 * @param {string} [props.message] - Message to display
 * @param {Function} props.onClose - Close handler
 */
const PaymentModal = ({ isOpen, status, product, message, onClose }) => {
        if (!isOpen) return null;

        const renderContent = () => {
                switch (status) {
                        case PAYMENT_STATUS.CREATING_ORDER:
                                return (
                                        <div className="text-center">
                                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                        Creating Order...
                                                </h3>
                                                <p className="text-gray-600">
                                                        Please wait while we prepare your order.
                                                </p>
                                        </div>
                                );

                        case PAYMENT_STATUS.AWAITING_PAYMENT:
                                return (
                                        <div className="text-center">
                                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <CreditCard className="w-8 h-8 text-blue-600" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                        Complete Payment
                                                </h3>
                                                <p className="text-gray-600">
                                                        The Razorpay checkout window should be open.
                                                        Complete your payment there.
                                                </p>
                                                {product && (
                                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                                <p className="text-sm text-gray-600">Purchasing:</p>
                                                                <p className="font-semibold">{product.name}</p>
                                                                <p className="text-blue-600 font-bold">{formatPrice(product.price)}</p>
                                                        </div>
                                                )}
                                        </div>
                                );

                        case PAYMENT_STATUS.VERIFYING:
                                return (
                                        <div className="text-center">
                                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                        Verifying Payment...
                                                </h3>
                                                <p className="text-gray-600">
                                                        Please wait while we verify your payment.
                                                        Do not close this window.
                                                </p>
                                        </div>
                                );

                        case PAYMENT_STATUS.SUCCESS:
                                return (
                                        <div className="text-center">
                                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                                                        <CheckCircle className="w-10 h-10 text-green-600" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-green-700 mb-2">
                                                        Payment Successful! 🎉
                                                </h3>
                                                <p className="text-gray-600 mb-4">
                                                        {message || 'Your product will be dispensed shortly.'}
                                                </p>
                                                {product && (
                                                        <div className="p-3 bg-green-50 rounded-lg mb-4">
                                                                <p className="font-semibold text-green-800">{product.name}</p>
                                                                <p className="text-green-600">{formatPrice(product.price)}</p>
                                                        </div>
                                                )}
                                                <button
                                                        onClick={onClose}
                                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                        Done
                                                </button>
                                        </div>
                                );

                        case PAYMENT_STATUS.ERROR:
                                return (
                                        <div className="text-center">
                                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <XCircle className="w-10 h-10 text-red-600" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-red-700 mb-2">
                                                        Payment Failed
                                                </h3>
                                                <p className="text-gray-600 mb-4">
                                                        {message || 'Something went wrong with your payment.'}
                                                </p>
                                                <button
                                                        onClick={onClose}
                                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                        Close
                                                </button>
                                        </div>
                                );

                        default:
                                return null;
                }
        };

        return (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Backdrop */}
                        <div
                                className="absolute inset-0 bg-black bg-opacity-50"
                                onClick={status === PAYMENT_STATUS.SUCCESS || status === PAYMENT_STATUS.ERROR ? onClose : undefined}
                        />

                        {/* Modal Content */}
                        <div className="relative bg-white rounded-2xl shadow-2xl p-6 m-4 max-w-sm w-full animate-slide-up">
                                {renderContent()}
                        </div>
                </div>
        );
};

export default PaymentModal;
