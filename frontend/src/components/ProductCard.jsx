/**
 * Product Card Component
 *
 * Glassmorphism product card with frosted glass effect,
 * gradient accents, and animated stock indicators.
 * Now includes trending badges and sales data.
 */

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, AlertTriangle, Flame, TrendingUp, TrendingDown, Sun, Cloud, Snowflake, Leaf, CheckCircle } from 'lucide-react';
import { formatPrice } from '../services/razorpay';
import { STOCK_THRESHOLDS } from '../config/constants';

const getStockStatus = (stock) => {
        if (stock === 0) {
                return {
                        label: 'Out of Stock',
                        className: 'stock-indicator text-red-500',
                        dotColor: 'bg-red-500',
                        bgStyle: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' },
                };
        }
        if (stock <= STOCK_THRESHOLDS.CRITICAL) {
                return {
                        label: `Only ${stock} left!`,
                        className: 'stock-indicator stock-critical',
                        dotColor: 'bg-red-400',
                        bgStyle: { background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' },
                };
        }
        if (stock <= STOCK_THRESHOLDS.LOW) {
                return {
                        label: `Low stock (${stock})`,
                        className: 'stock-indicator stock-low',
                        dotColor: 'bg-amber-400',
                        bgStyle: { background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' },
                };
        }
        return {
                label: `In Stock (${stock})`,
                className: 'stock-indicator stock-high',
                dotColor: 'bg-emerald-400',
                bgStyle: { background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' },
        };
};

const ProductCard = ({ product, onBuy, disabled, purchasing }) => {
        const { name, price, stock, imageUrl, _stockChanged, trending, salesData, seasonalTag } = product;
        const [showAnimation, setShowAnimation] = useState(false);

        const stockStatus = getStockStatus(stock);
        const isOutOfStock = stock === 0;
        const canBuy = !disabled && !isOutOfStock && !purchasing;
        const isTrending = trending?.isTrending;

        // Season icon mapping
        const getSeasonIcon = (season) => {
                const icons = {
                        summer: Sun,
                        monsoon: Cloud,
                        winter: Snowflake,
                        autumn: Leaf,
                        'all-season': CheckCircle,
                };
                return icons[season] || CheckCircle;
        };

        const SeasonIcon = getSeasonIcon(seasonalTag);

        useEffect(() => {
                if (_stockChanged) {
                        setShowAnimation(true);
                        const timer = setTimeout(() => setShowAnimation(false), 1000);
                        return () => clearTimeout(timer);
                }
        }, [_stockChanged, stock]);

        const handleBuyClick = () => {
                if (canBuy) onBuy(product);
        };

        return (
                <div className={`product-card relative ${showAnimation ? 'flash-update' : ''} ${isOutOfStock ? 'opacity-70' : ''}`}>
                        {/* Trending Badge */}
                        {isTrending && !isOutOfStock && (
                                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold shadow-lg animate-pulse">
                                        <Flame className="w-3 h-3" />
                                        <span>#{trending.rank} Trending</span>
                                </div>
                        )}

                        {/* Season Badge */}
                        {seasonalTag && !isOutOfStock && (
                                <div className="absolute top-2 right-2 z-10">
                                        <div className={`p-1.5 rounded-full shadow-md ${seasonalTag === 'summer' ? 'bg-yellow-100 text-yellow-600' :
                                                        seasonalTag === 'monsoon' ? 'bg-blue-100 text-blue-600' :
                                                                seasonalTag === 'winter' ? 'bg-cyan-100 text-cyan-600' :
                                                                        seasonalTag === 'autumn' ? 'bg-orange-100 text-orange-600' :
                                                                                'bg-green-100 text-green-600'
                                                }`} title={`Best in ${seasonalTag}`}>
                                                <SeasonIcon className="w-3.5 h-3.5" />
                                        </div>
                                </div>
                        )}

                        {/* Out of Stock Badge */}
                        {isOutOfStock && (
                                <div className="badge-out-of-stock flex items-center gap-1 z-10 text-xs sm:text-xs">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>Sold Out</span>
                                </div>
                        )}

                        {/* Product Image */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-gray-100/80 to-gray-50/50">
                                {imageUrl ? (
                                        <img
                                                src={imageUrl}
                                                alt={name}
                                                className={`w-full h-36 sm:h-40 md:h-44 object-cover transition-all duration-500 ${!isOutOfStock ? 'hover:scale-110' : 'grayscale opacity-80'}`}
                                                loading="lazy"
                                        />
                                ) : (
                                        <div className="w-full h-36 sm:h-40 md:h-44 flex items-center justify-center">
                                                <div className="glass-icon w-12 h-12 sm:w-16 sm:h-16">
                                                        <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                                </div>
                                        </div>
                                )}
                                {/* Subtle gradient overlay at bottom of image */}
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/30 to-transparent" />
                        </div>

                        {/* Product Details */}
                        <div className="p-3 sm:p-4 md:p-5">
                                <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 sm:mb-1.5 truncate" title={name}>
                                        {name}
                                </h3>

                                {/* Trending reason */}
                                {isTrending && trending.reason && (
                                        <p className="text-xs text-orange-600 mb-1 truncate" title={trending.reason}>
                                                🔥 {trending.reason}
                                        </p>
                                )}

                                {/* Price with gradient */}
                                <p className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                                        <span className="bg-clip-text text-transparent"
                                                style={{ backgroundImage: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
                                                {formatPrice(price)}
                                        </span>
                                </p>

                                {/* Sales Data */}
                                {salesData && (
                                        <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs text-gray-500">{salesData.lastWeek} sold this week</span>
                                                {salesData.trend === 'up' && (
                                                        <span className="flex items-center text-xs text-green-600">
                                                                <TrendingUp className="w-3 h-3 mr-0.5" />
                                                                +{salesData.percentChange}%
                                                        </span>
                                                )}
                                                {salesData.trend === 'down' && (
                                                        <span className="flex items-center text-xs text-red-500">
                                                                <TrendingDown className="w-3 h-3 mr-0.5" />
                                                                {salesData.percentChange}%
                                                        </span>
                                                )}
                                        </div>
                                )}

                                {/* Stock Indicator */}
                                <div className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full mb-3 sm:mb-4 ${showAnimation ? 'stock-changed' : ''}`}
                                        style={stockStatus.bgStyle}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${stockStatus.dotColor}`} />
                                        <span className={`${stockStatus.className} text-xs sm:text-sm`}>{stockStatus.label}</span>
                                </div>

                                {/* Buy Button */}
                                <button
                                        onClick={handleBuyClick}
                                        disabled={!canBuy}
                                        className={`btn-buy text-sm sm:text-base ${purchasing ? 'animate-pulse' : ''}`}
                                >
                                        {purchasing ? (
                                                <>
                                                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        <span className="hidden xs:inline">Processing...</span>
                                                        <span className="xs:hidden">Wait...</span>
                                                </>
                                        ) : isOutOfStock ? (
                                                <>
                                                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                                                        <span>Out of Stock</span>
                                                </>
                                        ) : disabled ? (
                                                <>
                                                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                                                        <span>Unavailable</span>
                                                </>
                                        ) : (
                                                <>
                                                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                                                        <span>Buy Now</span>
                                                </>
                                        )}
                                </button>
                        </div>
                </div>
        );
};

export default ProductCard;
