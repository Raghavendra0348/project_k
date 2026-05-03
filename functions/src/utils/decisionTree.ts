/**
 * Decision Tree Classifier for Demand Forecasting
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
// TYPE DEFINITIONS
// ============================================

interface DemandFeatures {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  category: string;
  averageSalesCount: number; // Historical avg sales per day
  stockLevel: number;
  priceRange: 'budget' | 'mid' | 'premium';
}

interface DemandPrediction {
  demandLevel: 'low' | 'medium' | 'high';
  confidence: number; // 0-1
  demandScore: number; // 0-100
  reasoning: string;
}

// ============================================
// DECISION TREE RULES
// ============================================

/**
 * Extracts time of day from hour
 */
function getTimeOfDay(hour: number): DemandFeatures['timeOfDay'] {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 24) return 'evening';
  return 'night';
}

/**
 * Determines if today is weekday or weekend
 */
function getDayType(dayOfWeek: number): DemandFeatures['dayOfWeek'] {
  // 0 = Sunday, 6 = Saturday
  return dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : 'weekday';
}

/**
 * Categorizes price into ranges
 */
function getPriceRange(price: number): DemandFeatures['priceRange'] {
  if (price < 50) return 'budget';
  if (price < 150) return 'mid';
  return 'premium';
}

/**
 * Decision Tree Logic for Demand Prediction
 * Uses if-else structure simulating a tree-based classifier
 */
export function predictDemand(
  features: DemandFeatures,
): DemandPrediction {
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

  let demandLevel: 'low' | 'medium' | 'high';
  let confidence: number;

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
export function getPredictionForProduct(
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    averageSalesPerDay: number; // From historical data
  },
  timestamp?: Date,
): DemandPrediction {
  const now = timestamp || new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  const features: DemandFeatures = {
    timeOfDay: getTimeOfDay(hour),
    dayOfWeek: getDayType(dayOfWeek),
    category: product.category.toLowerCase(),
    averageSalesCount: product.averageSalesPerDay || 5,
    stockLevel: product.stock,
    priceRange: getPriceRange(product.price),
  };

  return predictDemand(features);
}

/**
 * Get demand predictions for multiple products
 */
export function getPredictionsForProducts(
  products: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    averageSalesPerDay: number;
  }>,
  timestamp?: Date,
): Array<{
  productId: string;
  productName: string;
  prediction: DemandPrediction;
}> {
  return products.map((product) => ({
    productId: product.id,
    productName: product.name,
    prediction: getPredictionForProduct(product, timestamp),
  }));
}
