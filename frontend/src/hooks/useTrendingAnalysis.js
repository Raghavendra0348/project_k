/**
 * Hook for Trending Product Analysis using Decision Tree
 * 
 * Provides:
 * - Current trending products (top 5)
 * - Demand predictions for all products
 * - Trending scores and reasoning
 */

import { useMemo } from 'react';
import { identifyTrendingProducts, getPredictionsForProducts } from '../utils/decisionTree';

export function useTrendingAnalysis(products) {
  // Identify trending products using decision tree
  const trendingData = useMemo(() => {
    if (!products || products.length === 0) {
      return {
        trendingProducts: [],
        allPredictions: [],
        trendingCount: 0,
        topTrendingProduct: null,
        trendingCategories: [],
      };
    }

    // Get predictions and identify trending
    const analyzed = identifyTrendingProducts(products);

    // Filter trending products
    const trending = analyzed.filter((p) => p.trending?.isTrending);

    // Get all predictions
    const allPredictions = getPredictionsForProducts(products);

    // Trending by category
    const categoryTrending = {};
    trending.forEach((product) => {
      const cat = product.category || 'general';
      if (!categoryTrending[cat]) {
        categoryTrending[cat] = [];
      }
      categoryTrending[cat].push(product);
    });

    return {
      trendingProducts: trending,
      allAnalyzed: analyzed,
      allPredictions,
      trendingCount: trending.length,
      topTrendingProduct: trending[0] || null,
      trendingCategories: Object.entries(categoryTrending).map(([category, items]) => ({
        category,
        count: items.length,
        products: items,
      })),
    };
  }, [products]);

  return trendingData;
}
