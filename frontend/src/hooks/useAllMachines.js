/**
 * useAllMachines Hook
 * 
 * Real-time subscription to ALL machines (for admin dashboard).
 * Uses Firestore onSnapshot for instant updates.
 * 
 * Features:
 * - Real-time updates across all machines
 * - Automatic cleanup on unmount
 * - Loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import {
        collection,
        query,
        onSnapshot
} from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Hook to subscribe to real-time ALL machines
 * 
 * @returns {Object} - { machines, loading, error, refresh }
 */
const useAllMachines = () => {
        const [machines, setMachines] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        const refresh = useCallback(() => {
                setLoading(true);
                setError(null);
        }, []);

        useEffect(() => {
                const machinesRef = collection(db, 'machines');
                const machinesQuery = query(machinesRef);

                console.log('[useAllMachines] Setting up listener for all machines');

                // Subscribe to real-time updates
                const unsubscribe = onSnapshot(
                        machinesQuery,
                        (snapshot) => {
                                const machineList = [];
                                snapshot.forEach((doc) => {
                                        machineList.push({
                                                id: doc.id,
                                                ...doc.data(),
                                        });
                                });

                                console.log(`[useAllMachines] Received ${machineList.length} machines`);
                                setMachines(machineList);
                                setLoading(false);
                                setError(null);
                        },
                        (err) => {
                                console.error('[useAllMachines] Firestore subscription error:', err);
                                setError(err.message);
                                setLoading(false);
                        }
                );

                return () => {
                        console.log('[useAllMachines] Cleaning up subscription');
                        unsubscribe();
                };
        }, []);

        return { machines, loading, error, refresh };
};

export default useAllMachines;
