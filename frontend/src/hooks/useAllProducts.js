/**
 * useAllProducts Hook
 * 
 * Real-time subscription to ALL products (for admin dashboard).
 * Uses Firestore onSnapshot for instant updates.
 * 
 * Features:
 * - Real-time updates across all products
 * - No machine filtering
 * - Automatic cleanup on unmount
 * - Loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import {
        collection,
        query,
        onSnapshot,
        where
} from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Hook to subscribe to real-time ALL products
 * 
 * @param {string} [machineId] - Optional: Filter by specific machine
 * @returns {Object} - { products, loading, error, refresh }
 */
const useAllProducts = (machineId = null) => {
        const [products, setProducts] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        const refresh = useCallback(() => {
                setLoading(true);
                setError(null);
        }, []);

        useEffect(() => {
                const productsRef = collection(db, 'products');

                // Build query
                let productQuery;
                if (machineId && machineId !== 'all') {
                        productQuery = query(productsRef, where('machineId', '==', machineId));
                } else {
                        productQuery = query(productsRef);
                }

                console.log(`[useAllProducts] Setting up listener ${machineId ? `for machine: ${machineId}` : 'for all products'}`);

                // Subscribe to real-time updates
                const unsubscribe = onSnapshot(
                        productQuery,
                        (snapshot) => {
                                const productList = [];
                                snapshot.forEach((doc) => {
                                        productList.push({
                                                id: doc.id,
                                                ...doc.data(),
                                        });
                                });

                                console.log(`[useAllProducts] Received ${productList.length} products`);
                                setProducts(productList);
                                setLoading(false);
                                setError(null);
                        },
                        (err) => {
                                console.error('[useAllProducts] Firestore subscription error:', err);
                                setError(err.message);
                                setLoading(false);
                        }
                );

                return () => {
                        console.log('[useAllProducts] Cleaning up subscription');
                        unsubscribe();
                };
        }, [machineId]);

        return { products, loading, error, refresh };
};

export default useAllProducts;
