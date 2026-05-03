/**
 * useDemandPrediction Hook
 *
 * Fetches demand forecasting data using the decision tree algorithm
 * from the backend and provides demand insights for products.
 */

import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/constants';

/**
 * Hook to fetch demand predictions for a machine
 * @param {string} machineId - The machine ID
 * @param {boolean} autoRefetch - Auto-refetch predictions
 * @param {number} refetchInterval - Interval in ms for auto-refetch
 * @returns {Object} Predictions, loading state, error, and refetch function
 */
export function useDemandPrediction(
  machineId,
  autoRefetch = true,
  refetchInterval = 5 * 60 * 1000, // 5 minutes
) {
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [demandSummary, setDemandSummary] = useState({
    high: 0,
    medium: 0,
    low: 0,
  });

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/predict-demand/${machineId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Convert predictions array to object keyed by productId
        const predictionsMap = {};
        data.predictions.forEach((pred) => {
          predictionsMap[pred.productId] = pred;
        });

        setPredictions(predictionsMap);
        setDemandSummary({
          high: data.highDemandCount,
          medium: data.mediumDemandCount,
          low: data.lowDemandCount,
        });
      } else {
        setError(data.error || 'Failed to fetch demand predictions');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error fetching demand predictions',
      );
      console.error('Demand prediction fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refetch on component mount and interval
  useEffect(() => {
    if (!machineId) return;

    fetchPredictions();

    if (!autoRefetch) return;

    const interval = setInterval(fetchPredictions, refetchInterval);

    return () => clearInterval(interval);
  }, [machineId, autoRefetch, refetchInterval]);

  return {
    predictions,
    loading,
    error,
    demandSummary,
    refetch: fetchPredictions,
  };
}
