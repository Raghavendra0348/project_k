/**
 * Product List Component
 * 
 * Displays a grid of product cards with real-time updates.
 * Handles empty states and loading states.
 */

import React from 'react';
import { Package, RefreshCw } from 'lucide-react';
import ProductCard from './ProductCard';
import { ProductListSkeleton } from './LoadingSpinner';

/**
 * @param {Object} props
 * @param {Array} props.products - Array of products to display
 * @param {boolean} props.loading - Loading state
 * @param {string|null} props.error - Error message
 * @param {boolean} props.machineOnline - Whether the machine is online
 * @param {Function} props.onBuyProduct - Handler for buy button clicks
 * @param {string|null} props.purchasingProductId - ID of product being purchased
 * @param {Function} props.onRefresh - Refresh handler
 */
const ProductList = ({
        products,
        loading,
        error,
        machineOnline,
        onBuyProduct,
        purchasingProductId,
        onRefresh,
}) => {
        // Loading state
        if (loading) {
                return <ProductListSkeleton count={6} />;
        }

        // Error state
        if (error) {
                return (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                        <span className="text-3xl">❌</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Failed to Load Products
                                </h3>
                                <p className="text-gray-600 mb-4 max-w-md">
                                        {error}
                                </p>
                                <button
                                        onClick={onRefresh}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                        <RefreshCw className="w-4 h-4" />
                                        Try Again
                                </button>
                        </div>
                );
        }

        // Empty state
        if (!products || products.length === 0) {
                return (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Package className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No Products Available
                                </h3>
                                <p className="text-gray-600 max-w-md">
                                        This vending machine doesn't have any products at the moment.
                                        Please try again later or contact support.
                                </p>
                        </div>
                );
        }

        // Product grid
        return (
                <div className="p-4">
                        {/* Real-time indicator */}
                        <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">
                                        Available Products ({products.length})
                                </h2>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                        </span>
                                        <span>Live updates</span>
                                </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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

                        {/* Footer note */}
                        <div className="mt-6 text-center text-sm text-gray-500">
                                <p>
                                        Stock updates in real-time • Secure payments powered by Razorpay
                                </p>
                        </div>
                </div>
        );
};

export default ProductList;
