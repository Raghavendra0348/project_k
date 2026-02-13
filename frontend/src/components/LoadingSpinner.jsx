/**
 * Loading Spinner Component
 * 
 * Displays a centered loading animation.
 * Used during initial page load and async operations.
 */

import React from 'react';

/**
 * @param {Object} props
 * @param {string} [props.message] - Optional loading message
 * @param {boolean} [props.fullScreen] - Whether to center on full screen
 */
const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
        const containerClass = fullScreen
                ? 'fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'
                : 'flex items-center justify-center p-8';

        return (
                <div className={containerClass}>
                        <div className="text-center">
                                {/* Spinner Animation */}
                                <div className="relative">
                                        {/* Outer ring */}
                                        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse" />

                                        {/* Spinning inner ring */}
                                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />

                                        {/* Center dot */}
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full animate-pulse" />
                                </div>

                                {/* Loading message */}
                                {message && (
                                        <p className="mt-4 text-gray-600 font-medium animate-pulse">
                                                {message}
                                        </p>
                                )}
                        </div>
                </div>
        );
};

/**
 * Skeleton loader for product cards
 */
export const ProductSkeleton = () => {
        return (
                <div className="product-card p-4 animate-pulse">
                        {/* Image skeleton */}
                        <div className="w-full h-40 bg-gray-200 rounded-lg mb-4" />

                        {/* Title skeleton */}
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />

                        {/* Price skeleton */}
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />

                        {/* Stock skeleton */}
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />

                        {/* Button skeleton */}
                        <div className="h-12 bg-gray-200 rounded-lg" />
                </div>
        );
};

/**
 * Multiple product skeletons for loading state
 */
export const ProductListSkeleton = ({ count = 4 }) => {
        return (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                        {Array.from({ length: count }).map((_, index) => (
                                <ProductSkeleton key={index} />
                        ))}
                </div>
        );
};

export default LoadingSpinner;
