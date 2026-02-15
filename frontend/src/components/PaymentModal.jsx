/**
 * Payment Modal Component
 *
 * Glassmorphism modal with frosted glass overlay,
 * gradient accents, and smooth animations.
 */

import React from 'react';
import { CheckCircle, XCircle, Loader2, CreditCard } from 'lucide-react';
import { formatPrice } from '../services/razorpay';

export const PAYMENT_STATUS = {
        IDLE: 'idle',
        CREATING_ORDER: 'creating_order',
        AWAITING_PAYMENT: 'awaiting_payment',
        VERIFYING: 'verifying',
        SUCCESS: 'success',
        ERROR: 'error',
};

const PaymentModal = ({ isOpen, status, product, message, onClose }) => {
        if (!isOpen) return null;

        const renderContent = () => {
                switch (status) {
                        case PAYMENT_STATUS.CREATING_ORDER:
                                return (
                                        <div className="text-center">
                                                <div className="glass-icon glass-icon-blue w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5">
                                                        <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary-500 animate-spin" />
                                                </div>
                                                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Creating Order...</h3>
                                                <p className="text-gray-500 text-sm">Please wait while we prepare your order.</p>
                                        </div>
                                );

                        case PAYMENT_STATUS.AWAITING_PAYMENT:
                                return (
                                        <div className="text-center">
                                                <div className="glass-icon glass-icon-purple w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5">
                                                        <CreditCard className="w-7 h-7 sm:w-8 sm:h-8 text-accent-500" />
                                                </div>
                                                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Complete Payment</h3>
                                                <p className="text-gray-500 text-xs sm:text-sm">The Razorpay checkout window should be open. Complete your payment there.</p>
                                                {product && (
                                                        <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl bg-white/40 backdrop-blur border border-white/50">
                                                                <p className="text-xs text-gray-400 font-medium mb-1">PURCHASING</p>
                                                                <p className="font-bold text-gray-800 text-sm sm:text-base">{product.name}</p>
                                                                <p className="font-bold mt-1 text-lg sm:text-xl bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                                                                        {formatPrice(product.price)}
                                                                </p>
                                                        </div>
                                                )}
                                        </div>
                                );

                        case PAYMENT_STATUS.VERIFYING:
                                return (
                                        <div className="text-center">
                                                <div className="glass-icon glass-icon-amber w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5">
                                                        <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500 animate-spin" />
                                                </div>
                                                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Verifying Payment...</h3>
                                                <p className="text-gray-500 text-xs sm:text-sm">Please wait while we verify your payment. Do not close this window.</p>
                                        </div>
                                );

                        case PAYMENT_STATUS.SUCCESS:
                                return (
                                        <div className="text-center">
                                                <div className="glass-icon glass-icon-green w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 animate-bounce-slow">
                                                        <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
                                                </div>
                                                <h3 className="text-base sm:text-lg font-bold text-emerald-700 mb-2">Payment Successful! 🎉</h3>
                                                <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">
                                                        {message || 'Your product will be dispensed shortly.'}
                                                </p>
                                                {product && (
                                                        <div className="p-3 sm:p-4 rounded-xl mb-4 sm:mb-5" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
                                                                <p className="font-bold text-emerald-800 text-sm sm:text-base">{product.name}</p>
                                                                <p className="text-emerald-600 font-semibold text-xs sm:text-sm">{formatPrice(product.price)}</p>
                                                        </div>
                                                )}
                                                <button onClick={onClose}
                                                        className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:-translate-y-0.5 w-full sm:w-auto"
                                                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
                                                        Done
                                                </button>
                                        </div>
                                );

                        case PAYMENT_STATUS.ERROR:
                                return (
                                        <div className="text-center">
                                                <div className="glass-icon w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                                        <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                                                </div>
                                                <h3 className="text-base sm:text-lg font-bold text-red-600 mb-2">Payment Failed</h3>
                                                <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-5">
                                                        {message || 'Something went wrong with your payment.'}
                                                </p>
                                                <button onClick={onClose}
                                                        className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:-translate-y-0.5 w-full sm:w-auto"
                                                        style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}>
                                                        Close
                                                </button>
                                        </div>
                                );

                        default:
                                return null;
                }
        };

        return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Frosted backdrop */}
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                                onClick={status === PAYMENT_STATUS.SUCCESS || status === PAYMENT_STATUS.ERROR ? onClose : undefined} />

                        {/* Glass Modal */}
                        <div className="relative glass-strong p-5 sm:p-7 m-0 max-w-sm w-full animate-slide-up"
                                style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.8)' }}>
                                {renderContent()}
                        </div>
                </div>
        );
};

export default PaymentModal;
