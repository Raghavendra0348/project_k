/**
 * Product Card Component
 * 
 * Displays individual product with:
 * - Product image
 * - Name and price
 * - Stock indicator with color coding
 * - Buy button (disabled when out of stock or machine offline)
 * - Real-time stock update animation
 */

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, AlertTriangle } from 'lucide-react';
import { formatPrice } from '../services/razorpay';
import { STOCK_THRESHOLDS } from '../config/constants';

/**
 * Get stock status and styling based on stock level
 */
const getStockStatus = (stock) => {
        if (stock === 0) {
                return {
                        label: 'Out of Stock',
                        className: 'stock-indicator text-red-600',
                        bgClass: 'bg-red-50',
                };
        }
        if (stock <= STOCK_THRESHOLDS.CRITICAL) {
                return {
                        label: `Only ${stock} left!`,
                        className: 'stock-indicator stock-critical',
                        bgClass: 'bg-red-50',
                };
        }
        if (stock <= STOCK_THRESHOLDS.LOW) {
                return {
                        label: `Low stock (${stock})`,
                        className: 'stock-indicator stock-low',
                        bgClass: 'bg-yellow-50',
                };
        }
        return {
                label: `In Stock (${stock})`,
                className: 'stock-indicator stock-high',
                bgClass: 'bg-green-50',
        };
};

/**
 * @param {Object} props
 * @param {Object} props.product - Product data
 * @param {Function} props.onBuy - Buy button click handler
 * @param {boolean} props.disabled - Whether buying is disabled (machine offline)
 * @param {boolean} [props.purchasing] - Whether a purchase is in progress
 */
const ProductCard = ({ product, onBuy, disabled, purchasing }) => {
        const { id, name, price, stock, imageUrl, _stockChanged } = product;
        const [showAnimation, setShowAnimation] = useState(false);

        const stockStatus = getStockStatus(stock);
        const isOutOfStock = stock === 0;
        const canBuy = !disabled && !isOutOfStock && !purchasing;

        // Trigger animation when stock changes
        useEffect(() => {
                if (_stockChanged) {
                        setShowAnimation(true);
                        const timer = setTimeout(() => setShowAnimation(false), 1000);
                        return () => clearTimeout(timer);
                }
        }, [_stockChanged, stock]);

        // Handle buy click
        const handleBuyClick = () => {
                if (canBuy) {
                        onBuy(product);
                }
        };

        return (
                <div
                        className={`
        product-card relative
        ${showAnimation ? 'flash-update' : ''}
        ${isOutOfStock ? 'opacity-75' : ''}
      `}
                >
                        {/* Out of Stock Badge */}
                        {isOutOfStock && (
                                <div className="badge-out-of-stock flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>Sold Out</span>
                                </div>
                        )}

                        {/* Product Image */}
                        <div className="relative overflow-hidden bg-gray-100">
                                {imageUrl ? (
                                        <img
                                                src={imageUrl}
                                                alt={name}
                                                className={`
              w-full h-40 object-cover transition-transform duration-300
              ${!isOutOfStock ? 'hover:scale-105' : 'grayscale'}
            `}
                                                loading="lazy"
                                        />
                                ) : (
                                        <div className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                                <Package className="w-12 h-12 text-gray-400" />
                                        </div>
                                )}
                        </div>

                        {/* Product Details */}
                        <div className="p-4">
                                {/* Product Name */}
                                <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate" title={name}>
                                        {name}
                                </h3>

                                {/* Price */}
                                <p className="text-2xl font-bold text-blue-600 mb-2">
                                        {formatPrice(price)}
                                </p>

                                {/* Stock Indicator */}
                                <div
                                        className={`
            inline-flex items-center gap-1 px-2 py-1 rounded-full mb-4
            ${stockStatus.bgClass}
            ${showAnimation ? 'stock-changed' : ''}
          `}
                                >
                                        <span
                                                className={`
              w-2 h-2 rounded-full
              ${isOutOfStock ? 'bg-red-500' : stock <= STOCK_THRESHOLDS.LOW ? 'bg-yellow-500' : 'bg-green-500'}
            `}
                                        />
                                        <span className={stockStatus.className}>
                                                {stockStatus.label}
                                        </span>
                                </div>

                                {/* Buy Button */}
                                <button
                                        onClick={handleBuyClick}
                                        disabled={!canBuy}
                                        className={`
            btn-buy
            ${isOutOfStock ? 'bg-gray-400' : ''}
            ${purchasing ? 'animate-pulse' : ''}
          `}
                                >
                                        {purchasing ? (
                                                <>
                                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                                <circle
                                                                        className="opacity-25"
                                                                        cx="12" cy="12" r="10"
                                                                        stroke="currentColor"
                                                                        strokeWidth="4"
                                                                        fill="none"
                                                                />
                                                                <path
                                                                        className="opacity-75"
                                                                        fill="currentColor"
                                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                />
                                                        </svg>
                                                        <span>Processing...</span>
                                                </>
                                        ) : isOutOfStock ? (
                                                <>
                                                        <AlertTriangle className="w-5 h-5" />
                                                        <span>Out of Stock</span>
                                                </>
                                        ) : disabled ? (
                                                <>
                                                        <AlertTriangle className="w-5 h-5" />
                                                        <span>Unavailable</span>
                                                </>
                                        ) : (
                                                <>
                                                        <ShoppingCart className="w-5 h-5" />
                                                        <span>Buy Now</span>
                                                </>
                                        )}
                                </button>
                        </div>
                </div>
        );
};

export default ProductCard;
