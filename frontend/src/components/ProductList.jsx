/**
 * Product List Component
 *
 * Glassmorphism grid layout with live-update indicator
 * and frosted glass empty/error states.
 */

import React from 'react';
import { Package, RefreshCw } from 'lucide-react';
import ProductCard from './ProductCard';
import { ProductListSkeleton } from './LoadingSpinner';

const ProductList = ({
        products,
        loading,
        error,
        machineOnline,
        onBuyProduct,
        purchasingProductId,
        onRefresh,
}) => {
        if (loading) {
                return <ProductListSkeleton count={6} />;
        }

        if (error) {
                return (
                        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                                <div className="glass p-6 sm:p-10 max-w-md w-full animate-fade-in">
                                        <div className="glass-icon w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                                <span className="text-2xl sm:text-3xl">❌</span>
                                        </div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Failed to Load Products</h3>
                                        <p className="text-gray-500 mb-4 sm:mb-5 text-xs sm:text-sm leading-relaxed">{error}</p>
                                        <button onClick={onRefresh}
                                                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all hover:-translate-y-0.5"
                                                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
                                                <RefreshCw className="w-4 h-4" />
                                                Try Again
                                        </button>
                                </div>
                        </div>
                );
        }

        if (!products || products.length === 0) {
                return (
                        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
                                <div className="glass p-6 sm:p-10 max-w-md w-full animate-fade-in">
                                        <div className="glass-icon w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5">
                                                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                                        </div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">No Products Available</h3>
                                        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                                                This vending machine doesn't have any products at the moment.
                                                Please try again later or contact support.
                                        </p>
                                </div>
                        </div>
                );
        }

        return (
                <div className="p-3 sm:p-5">
                        {/* Header bar */}
                        <div className="flex items-center justify-between mb-4 sm:mb-5">
                                <h2 className="text-base sm:text-lg font-bold text-gray-800">
                                        Available Products
                                        <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm font-normal text-gray-400">({products.length})</span>
                                </h2>
                                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/40 backdrop-blur border border-white/50">
                                        <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                        </span>
                                        <span className="text-[10px] sm:text-xs font-medium text-gray-500 hidden xs:inline">Live updates</span>
                                </div>
                        </div>

                        {/* Product Grid - Responsive */}
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                                {products.map((product) => (
                                        <ProductCard
                                                key={product.id}
                                                product={product}
                                                onBuy={onBuyProduct}
                                                disabled={!machineOnline}
                                                purchasing={purchasingProductId === product.id}
                                        />
                                ))}
                        </div>

                        {/* Footer */}
                        <div className="mt-6 sm:mt-8 text-center">
                                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/30 backdrop-blur border border-white/40">
                                        <span className="text-[10px] sm:text-xs text-gray-400 font-medium">
                                                Stock updates in real-time • Secure payments powered by Razorpay
                                        </span>
                                </div>
                        </div>
                </div>
        );
};

export default ProductList;
