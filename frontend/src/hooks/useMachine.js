/**
 * useMachine Hook
 * 
 * Fetches and subscribes to machine data (location, status).
 * Real-time updates for machine status (online/offline).
 */

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * @typedef {Object} Machine
 * @property {string} id - Machine document ID
 * @property {string} location - Machine location description
 * @property {'online'|'offline'} status - Machine status
 */

/**
 * @typedef {Object} UseMachineReturn
 * @property {Machine|null} machine - Machine data
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message if any
 * @property {boolean} isOnline - Whether machine is online
 */

/**
 * Hook to subscribe to machine data
 * 
 * @param {string} machineId - Machine ID to fetch
 * @returns {UseMachineReturn}
 */
const useMachine = (machineId) => {
        const [machine, setMachine] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
                // Don't subscribe if no machineId
                if (!machineId) {
                        setLoading(false);
                        setError('Machine ID is required');
                        return;
                }

                setLoading(true);
                setError(null);

                // Reference to the machine document
                const machineRef = doc(db, 'machines', machineId);

                // Subscribe to real-time updates
                const unsubscribe = onSnapshot(
                        machineRef,
                        (docSnapshot) => {
                                if (docSnapshot.exists()) {
                                        setMachine({
                                                id: docSnapshot.id,
                                                ...docSnapshot.data(),
                                        });
                                        setError(null);
                                } else {
                                        setMachine(null);
                                        setError('Machine not found');
                                }
                                setLoading(false);
                        },
                        (err) => {
                                console.error('Error fetching machine:', err);
                                setError('Failed to load machine data');
                                setLoading(false);
                        }
                );

                // Cleanup subscription
                return () => {
                        console.log('Unsubscribing from machine listener');
                        unsubscribe();
                };
        }, [machineId]);

        // Computed property for easy status check
        const isOnline = machine?.status === 'online';

        return {
                machine,
                loading,
                error,
                isOnline,
        };
};

export default useMachine;
