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

                                // Sort products by name (client-side)
                                updatedProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

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
        }, [machineId]); // Re-subscribe when machineId changes

        return {
                products,
                loading,
                error,
                refresh,
        };
};

export default useProducts;
