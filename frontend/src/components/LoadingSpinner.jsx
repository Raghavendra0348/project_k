/**
 * Loading Spinner Component
 *
 * Glassmorphism loading spinner with frosted glass effect.
 */

import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
        const containerClass = fullScreen
                ? 'fixed inset-0 flex items-center justify-center mesh-gradient'
                : 'flex items-center justify-center p-8';

        return (
                <div className={containerClass}>
                        <div className="text-center animate-fade-in">
                                {/* Glass spinner */}
                                <div className="relative w-20 h-20 mx-auto">
                                        {/* Outer glow ring */}
                                        <div className="absolute inset-0 rounded-full"
                                                style={{
                                                        background: 'conic-gradient(from 0deg, transparent, rgba(99,102,241,0.3), transparent)',
                                                        animation: 'spin 2s linear infinite',
                                                }} />
                                        {/* Glass circle */}
                                        <div className="absolute inset-1 rounded-full bg-white/50 backdrop-blur-xl border border-white/60"
                                                style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)' }} />
                                        {/* Spinning arc */}
                                        <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
                                                style={{ borderTopColor: '#6366f1', borderRightColor: '#8b5cf6' }} />
                                        {/* Center dot */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full animate-pulse"
                                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 2px 8px rgba(99,102,241,0.4)' }} />
                                </div>

                                {message && (
                                        <p className="mt-5 text-gray-500 font-medium text-sm animate-pulse">{message}</p>
                                )}
                        </div>
                </div>
        );
};

export const ProductSkeleton = () => {
        return (
                <div className="product-card p-5 animate-pulse">
                        <div className="w-full h-44 bg-white/40 rounded-xl mb-4" />
                        <div className="h-4 bg-white/40 rounded-lg w-3/4 mb-3" />
                        <div className="h-6 bg-white/40 rounded-lg w-1/3 mb-3" />
                        <div className="h-3 bg-white/40 rounded-lg w-1/2 mb-5" />
                        <div className="h-12 bg-white/40 rounded-xl" />
                </div>
        );
};

export const ProductListSkeleton = ({ count = 4 }) => {
        return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-5">
                        {Array.from({ length: count }).map((_, index) => (
                                <ProductSkeleton key={index} />
                        ))}
                </div>
        );
};

export default LoadingSpinner;
