/**
 * Decision Tree Classifier for Demand Forecasting (Frontend Port)
 * 
 * Predicts product demand based on:
 * - Time of day (Morning: 6-12, Afternoon: 12-18, Evening: 18-24, Night: 0-6)
 * - Day of week (Weekday vs Weekend)
 * - Product category
 * - Historical sales data
 * 
 * Output: Demand score (Low, Medium, High)
 */

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTimeOfDay(hour) {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'night';
}

function getDayType(dayOfWeek) {
  // 0 = Sunday, 6 = Saturday
  return dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : 'weekday';
}

function getPriceRange(price) {
  if (price < 50) return 'budget';
  if (price < 150) return 'mid';
  return 'premium';
}

// ============================================
// DECISION TREE LOGIC
// ============================================

export function predictDemand(features) {
  let demandScore = 50; // Base score
  let reasoning = '';

  // ========== LEVEL 1: Time of Day ==========
  if (features.timeOfDay === 'morning') {
    demandScore += 10;
    reasoning += 'Morning peak time. ';

    // Level 2: Morning + Category
    if (['beverage', 'snacks', 'energy'].includes(features.category)) {
      demandScore += 15;
      reasoning += 'Hot category in morning. ';
    } else if (features.category === 'lunch') {
      demandScore -= 10;
      reasoning += 'Lunch items less popular in morning. ';
    }
  } else if (features.timeOfDay === 'afternoon') {
    demandScore += 15;
    reasoning += 'Afternoon peak time. ';

    // Level 2: Afternoon + Category
    if (['lunch', 'beverage'].includes(features.category)) {
      demandScore += 20;
      reasoning += 'Perfect category for afternoon. ';
    }
  } else if (features.timeOfDay === 'evening') {
    demandScore += 5;
    reasoning += 'Evening moderate demand. ';

    // Level 2: Evening + Category
    if (['snacks', 'beverage'].includes(features.category)) {
      demandScore += 10;
      reasoning += 'Evening favorites. ';
    }
  } else {
    demandScore -= 20;
    reasoning += 'Night time low demand. ';
  }

  // ========== LEVEL 1: Day Type ==========
  if (features.dayOfWeek === 'weekend') {
    demandScore += 10;
    reasoning += 'Weekend boost. ';
  }

  // ========== LEVEL 1: Historical Sales ==========
  if (features.averageSalesCount > 10) {
    demandScore += 20;
    reasoning += 'High historical sales. ';
  } else if (features.averageSalesCount > 5) {
    demandScore += 10;
    reasoning += 'Moderate historical sales. ';
  } else if (features.averageSalesCount < 2) {
    demandScore -= 15;
    reasoning += 'Low historical demand. ';
  }

  // ========== LEVEL 1: Stock Level ==========
  if (features.stockLevel === 0) {
    demandScore -= 25;
    reasoning += 'Out of stock. ';
  } else if (features.stockLevel < 3) {
    demandScore -= 10;
    reasoning += 'Low stock levels. ';
  } else if (features.stockLevel > 15) {
    demandScore += 5;
    reasoning += 'Healthy stock. ';
  }

  // ========== LEVEL 1: Price Range ==========
  if (features.priceRange === 'budget') {
    demandScore += 15;
    reasoning += 'Budget-friendly pricing boosts demand. ';
  } else if (features.priceRange === 'premium') {
    demandScore -= 10;
    reasoning += 'Premium pricing reduces demand. ';
  }

  // ========== FINAL DECISION ==========
  // Clamp score between 0-100
  demandScore = Math.max(0, Math.min(100, demandScore));

  let demandLevel;
  let confidence;

  if (demandScore >= 70) {
    demandLevel = 'high';
    confidence = Math.min(1, (demandScore - 70) / 30 + 0.6);
  } else if (demandScore >= 40) {
    demandLevel = 'medium';
    confidence = Math.min(1, (demandScore - 40) / 60 + 0.5);
  } else {
    demandLevel = 'low';
    confidence = Math.min(1, (40 - demandScore) / 40 + 0.6);
  }

  return {
    demandLevel,
    confidence: Math.round(confidence * 100) / 100,
    demandScore: Math.round(demandScore),
    reasoning: reasoning.trim(),
  };
}

/**
 * Get demand prediction for a single product
 */
export function getPredictionForProduct(product, timestamp) {
  const now = timestamp || new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  const features = {
    timeOfDay: getTimeOfDay(hour),
    dayOfWeek: getDayType(dayOfWeek),
    category: (product.category || 'general').toLowerCase(),
    averageSalesCount: product.salesData?.lastWeek || product.averageSalesPerDay || 5,
    stockLevel: product.stock || 0,
    priceRange: getPriceRange(product.price || 0),
  };

  return predictDemand(features);
}

/**
 * Get demand predictions for multiple products
 */
export function getPredictionsForProducts(products, timestamp) {
  return products.map((product) => ({
    productId: product.id,
    productName: product.name,
    prediction: getPredictionForProduct(product, timestamp),
  }));
}

/**
 * Identify trending products using decision tree + sales analysis
 * Respects backend trending data if available, otherwise calculates score
 */
export function identifyTrendingProducts(products) {
  const predictions = getPredictionsForProducts(products);

  // Score each product for trending potential
  const scoredProducts = predictions.map((pred) => {
    const product = products.find((p) => p.id === pred.productId);
    
    // If product already has trending data from backend, use it (higher priority)
    if (product?.trending?.isTrending) {
      return {
        ...product,
        trendingScore: (product.trending.rank || 1) > 0 ? Math.max(90 - ((product.trending.rank || 1) * 10), 60) : 75,
        demandPrediction: pred.prediction,
        compositeReason: product.trending.reason || `Demand: ${pred.prediction.demandLevel} | Sales: ${product?.salesData?.lastWeek || 0}/week`,
        // Keep backend trending data
        trending: product.trending,
      };
    }

    // For non-trending products, calculate decision tree score
    const salesScore = (product?.salesData?.lastWeek || 0) * 2; // Sales weight
    const growthScore = (product?.salesData?.percentChange || 0) * 1.5; // Growth weight
    const demandScore = pred.prediction.demandScore;

    const trendingScore = (demandScore * 0.4) + (salesScore * 0.35) + (growthScore * 0.25);

    return {
      ...product,
      trendingScore: Math.round(trendingScore),
      demandPrediction: pred.prediction,
      compositeReason: `Demand: ${pred.prediction.demandLevel} | Sales: ${product?.salesData?.lastWeek || 0}/week | Growth: +${product?.salesData?.percentChange || 0}%`,
    };
  });

  // Separate backend-trending and calculated-trending products
  const backendTrending = scoredProducts.filter(p => p.trending?.isTrending);
  const calculatedProducts = scoredProducts.filter(p => !p.trending?.isTrending);

  // Sort backend trending by rank to ensure correct order (1, 2, 3, etc.)
  const sortedBackendTrending = backendTrending.sort((a, b) => (a.trending?.rank || 999) - (b.trending?.rank || 999));

  // Sort calculated products by trending score
  const sortedCalculated = calculatedProducts.sort((a, b) => b.trendingScore - a.trendingScore);

  // Combine: backend trending first (sorted by rank), then top calculated products
  const allWithTrending = [
    ...sortedBackendTrending,
    ...sortedCalculated.slice(0, Math.max(0, 5 - sortedBackendTrending.length))
  ];

  // Add trending flags to calculated products if they make top 5
  const finalResult = allWithTrending.map((product, index) => {
    if (!product.trending?.isTrending) {
      return {
        ...product,
        trending: {
          isTrending: index < 5,
          rank: index < 5 ? index + 1 : null,
          reason: product.trendingScore >= 60 ? `High-potential product (Score: ${product.trendingScore})` : 'Regular product',
        },
      };
    }
    return product;
  });

  // Include all remaining products without trending flag
  return [
    ...finalResult,
    ...calculatedProducts.slice(Math.max(0, 5 - sortedBackendTrending.length)),
  ].map((product, index) => {
    if (!product.trending) {
      return {
        ...product,
        trending: {
          isTrending: false,
          rank: null,
          reason: 'Regular product',
        },
      };
    }
    return product;
  });
}
