/**
 * useProducts Hook
 * 
 * Real-time subscription to products for a specific vending machine.
 * Uses Firestore onSnapshot for instant updates when stock changes.
 * 
 * Features:
 * - Real-time updates across all connected users
 * - Automatic cleanup on unmount
 * - Loading and error states
 * - Products filtered by machineId
 */

import { useState, useEffect, useCallback } from 'react';
import {
        collection,
        query,
        where,
        onSnapshot
} from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * @typedef {Object} Product
 * @property {string} id - Product document ID
 * @property {string} name - Product name
 * @property {number} price - Price in rupees
 * @property {number} stock - Current stock count
 * @property {string} machineId - Associated machine ID
 * @property {string} [imageUrl] - Product image URL
 * @property {string} [category] - Product category
 */

/**
 * @typedef {Object} UseProductsReturn
 * @property {Product[]} products - Array of products
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message if any
 * @property {Function} refresh - Manual refresh function
 */

/**
 * Hook to subscribe to real-time product updates for a machine
 * 
 * @param {string} machineId - Machine ID to fetch products for
 * @returns {UseProductsReturn}
 */
const useProducts = (machineId) => {
        const [products, setProducts] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        // Store previous stock values to detect changes
        const [previousStock, setPreviousStock] = useState({});

        // Refresh function (for manual refresh if needed)
        const refresh = useCallback(() => {
                setLoading(true);
                setError(null);
        }, []);

        useEffect(() => {
                // Don't subscribe if no machineId
                if (!machineId) {
                        setLoading(false);
                        setError('Machine ID is required');
                        return;
                }

                setLoading(true);
                setError(null);

                // Create query for products belonging to this machine
                const productsRef = collection(db, 'products');
                const productsQuery = query(
                        productsRef,
                        where('machineId', '==', machineId)
                );

                // Subscribe to real-time updates
                const unsubscribe = onSnapshot(
                        productsQuery,
                        (snapshot) => {
                                const updatedProducts = [];
                                const newStockValues = {};

                                snapshot.forEach((doc) => {
                                        const productData = {
                                                id: doc.id,
                                                ...doc.data(),
                                        };
                                        updatedProducts.push(productData);
                                        newStockValues[doc.id] = productData.stock;
                                });

                                // Detect which products had stock changes
                                updatedProducts.forEach((product) => {
                                        const prevStock = previousStock[product.id];
                                        if (prevStock !== undefined && prevStock !== product.stock) {
                                                // Stock changed! Add a flag for UI animation
                                                product._stockChanged = true;
                                                console.log(`Stock update: ${product.name} ${prevStock} → ${product.stock}`);
                                        }
                                });

                                // ========================================
                                // CALCULATE TRENDING BASED ON SALES DATA
                                // ========================================
                                
                                // Filter products with sales data
                                const productsWithSales = updatedProducts.filter(p => p.salesData?.lastWeek);
                                
                                // Sort by sales (descending) to get top sellers
                                const sortedBySales = [...productsWithSales].sort((a, b) => {
                                        const aSales = a.salesData?.lastWeek || 0;
                                        const bSales = b.salesData?.lastWeek || 0;
                                        return bSales - aSales; // Higher sales first
                                });

                                // Mark top 5 as trending
                                sortedBySales.slice(0, 5).forEach((product, index) => {
                                        const productIndex = updatedProducts.findIndex(p => p.id === product.id);
                                        if (productIndex !== -1) {
                                                updatedProducts[productIndex].trending = {
                                                        isTrending: true,
                                                        rank: index + 1, // #1, #2, #3, etc.
                                                        reason: `Top seller (${product.salesData.lastWeek} sold)`,
                                                };
                                        }
                                });

                                // Mark products with high growth (>10% increase) as trending if not already
                                updatedProducts.forEach((product) => {
                                        if (!product.trending && product.salesData?.trend === 'up' && product.salesData?.percentChange > 10) {
                                                product.trending = {
                                                        isTrending: true,
                                                        rank: 999, // Low priority rank
                                                        reason: `Trending (+${product.salesData.percentChange}% growth)`,
                                                };
                                        }
                                });

                                // Sort products by name (client-side)
                                updatedProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

                                console.log('📦 [useProducts] Loaded products:', {
                                        machineId,
                                        count: updatedProducts.length,
                                        products: updatedProducts.map(p => ({
                                                name: p.name,
                                                category: p.category,
                                                price: p.price,
                                                stock: p.stock,
                                                salesLastWeek: p.salesData?.lastWeek,
                                                trending: p.trending?.isTrending ? `#${p.trending.rank}` : 'No'
                                        })),
                                        trendingProducts: updatedProducts
                                                .filter(p => p.trending?.isTrending)
                                                .map(p => `${p.trending.rank}. ${p.name} (${p.salesData?.lastWeek} sold)`),
                                });

                                setPreviousStock(newStockValues);
                                setProducts(updatedProducts);
                                setLoading(false);
                        },
                        (err) => {
                                console.error('Error fetching products:', err);
                                setError('Failed to load products. Please try again.');
                                setLoading(false);
                        }
                );

                // Cleanup subscription on unmount or machineId change
                return () => {
                        console.log('Unsubscribing from products listener');
                        unsubscribe();
                };
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [machineId]); // Re-subscribe when machineId changes

        return {
                products,
                loading,
                error,
                refresh,
        };
};

export default useProducts;
