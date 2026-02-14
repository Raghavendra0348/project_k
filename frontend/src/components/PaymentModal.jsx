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
                                                <div className="glass-icon glass-icon-blue w-16 h-16 mx-auto mb-5">
                                                        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-800 mb-2">Creating Order...</h3>
                                                <p className="text-gray-500 text-sm">Please wait while we prepare your order.</p>
                                        </div>
                                );

                        case PAYMENT_STATUS.AWAITING_PAYMENT:
                                return (
                                        <div className="text-center">
                                                <div className="glass-icon glass-icon-purple w-16 h-16 mx-auto mb-5">
                                                        <CreditCard className="w-8 h-8 text-accent-500" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-800 mb-2">Complete Payment</h3>
                                                <p className="text-gray-500 text-sm">The Razorpay checkout window should be open. Complete your payment there.</p>
                                                {product && (
                                                        <div className="mt-4 p-4 rounded-xl bg-white/40 backdrop-blur border border-white/50">
                                                                <p className="text-xs text-gray-400 font-medium mb-1">PURCHASING</p>
                                                                <p className="font-bold text-gray-800">{product.name}</p>
                                                                <p className="font-bold mt-1 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                                                                        {formatPrice(product.price)}
                                                                </p>
                                                        </div>
                                                )}
                                        </div>
                                );

                        case PAYMENT_STATUS.VERIFYING:
                                return (
                                        <div className="text-center">
                                                <div className="glass-icon glass-icon-amber w-16 h-16 mx-auto mb-5">
                                                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-800 mb-2">Verifying Payment...</h3>
                                                <p className="text-gray-500 text-sm">Please wait while we verify your payment. Do not close this window.</p>
                                        </div>
                                );

                        case PAYMENT_STATUS.SUCCESS:
                                return (
                                        <div className="text-center">
                                                <div className="glass-icon glass-icon-green w-16 h-16 mx-auto mb-5 animate-bounce-slow">
                                                        <CheckCircle className="w-10 h-10 text-emerald-500" />
                                                </div>
                                                <h3 className="text-lg font-bold text-emerald-700 mb-2">Payment Successful! 🎉</h3>
                                                <p className="text-gray-500 text-sm mb-4">
                                                        {message || 'Your product will be dispensed shortly.'}
                                                </p>
                                                {product && (
                                                        <div className="p-4 rounded-xl mb-5" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
                                                                <p className="font-bold text-emerald-800">{product.name}</p>
                                                                <p className="text-emerald-600 font-semibold text-sm">{formatPrice(product.price)}</p>
                                                        </div>
                                                )}
                                                <button onClick={onClose}
                                                        className="px-7 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
                                                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
                                                        Done
                                                </button>
                                        </div>
                                );

                        case PAYMENT_STATUS.ERROR:
                                return (
                                        <div className="text-center">
                                                <div className="glass-icon w-16 h-16 mx-auto mb-5" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                                        <XCircle className="w-10 h-10 text-red-500" />
                                                </div>
                                                <h3 className="text-lg font-bold text-red-600 mb-2">Payment Failed</h3>
                                                <p className="text-gray-500 text-sm mb-5">
                                                        {message || 'Something went wrong with your payment.'}
                                                </p>
                                                <button onClick={onClose}
                                                        className="px-7 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Frosted backdrop */}
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                                onClick={status === PAYMENT_STATUS.SUCCESS || status === PAYMENT_STATUS.ERROR ? onClose : undefined} />

                        {/* Glass Modal */}
                        <div className="relative glass-strong p-7 m-4 max-w-sm w-full animate-slide-up"
                                style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.8)' }}>
                                {renderContent()}
                        </div>
                </div>
        );
};

export default PaymentModal;
