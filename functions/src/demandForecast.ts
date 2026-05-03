/**
 * Demand Forecasting Cloud Function
 *
 * Endpoint: POST /api/predict-demand
 * Purpose: Get demand predictions for all products in a machine
 *
 * Uses decision tree algorithm to predict demand based on:
 * - Current time of day
 * - Day of week (weekday vs weekend)
 * - Product category
 * - Historical sales data
 * - Current stock levels
 * - Product pricing
 */

import { Request, Response } from 'express';
import * as functions from 'firebase-functions';
import { db, Timestamp } from './firebase';
import {
  getPredictionsForProducts,
  getPredictionForProduct,
} from './utils/decisionTree';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  machineId: string;
}

interface Order {
  productId: string;
  createdAt: FirebaseFirestore.Timestamp;
  status: string;
}

interface DemandForecastResponse {
  success: boolean;
  machineId: string;
  timestamp: string;
  predictions: Array<{
    productId: string;
    productName: string;
    demandLevel: 'low' | 'medium' | 'high';
    demandScore: number;
    confidence: number;
    reasoning: string;
  }>;
  highDemandCount: number;
  mediumDemandCount: number;
  lowDemandCount: number;
  error?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate average sales per day for a product
 * Looks at last 30 days of sales data
 */
async function getAverageSalesPerDay(
  productId: string,
): Promise<number> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await db
      .collection('orders')
      .where('productId', '==', productId)
      .where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      .where('status', '==', 'success')
      .get();

    const avgPerDay = orders.size / 30;
    return Math.round(avgPerDay * 10) / 10; // Round to 1 decimal
  } catch (error) {
    functions.logger.error('Error calculating average sales', { productId, error });
    return 5; // Default fallback
  }
}

/**
 * Get all products for a machine with their engagement metrics
 */
async function getProductsWithMetrics(
  machineId: string,
): Promise<
  Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    averageSalesPerDay: number;
  }>
> {
  try {
    const snapshot = await db
      .collection('products')
      .where('machineId', '==', machineId)
      .get();

    const productsWithMetrics = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const product = doc.data() as Product;
        const avgSales = await getAverageSalesPerDay(product.id);

        return {
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category || 'uncategorized',
          averageSalesPerDay: avgSales,
        };
      }),
    );

    return productsWithMetrics;
  } catch (error) {
    functions.logger.error('Error fetching products with metrics', {
      machineId,
      error,
    });
    return [];
  }
}

// ============================================
// MAIN HANDLER
// ============================================

/**
 * POST /api/predict-demand
 * Body: { machineId: string }
 * Response: Demand predictions for all products
 */
export const predictDemandHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { machineId } = req.body;

    if (!machineId || typeof machineId !== 'string') {
      res.status(400).json({
        success: false,
        error: 'machineId is required',
      } as Partial<DemandForecastResponse>);
      return;
    }

    functions.logger.info('Demand prediction request', { machineId });

    // Fetch products with historical metrics
    const products = await getProductsWithMetrics(machineId);

    if (products.length === 0) {
      res.status(404).json({
        success: false,
        error: 'No products found for machine',
      } as Partial<DemandForecastResponse>);
      return;
    }

    // Get predictions using decision tree
    const predictions = getPredictionsForProducts(products);

    // Count demand levels
    const demandCounts = predictions.reduce(
      (acc, pred) => {
        if (pred.prediction.demandLevel === 'high') acc.high++;
        else if (pred.prediction.demandLevel === 'medium') acc.medium++;
        else acc.low++;
        return acc;
      },
      { high: 0, medium: 0, low: 0 },
    );

    const response: DemandForecastResponse = {
      success: true,
      machineId,
      timestamp: new Date().toISOString(),
      predictions: predictions.map((pred) => ({
        productId: pred.productId,
        productName: pred.productName,
        demandLevel: pred.prediction.demandLevel,
        demandScore: pred.prediction.demandScore,
        confidence: pred.prediction.confidence,
        reasoning: pred.prediction.reasoning,
      })),
      highDemandCount: demandCounts.high,
      mediumDemandCount: demandCounts.medium,
      lowDemandCount: demandCounts.low,
    };

    res.status(200).json(response);
  } catch (error) {
    functions.logger.error('Demand prediction error', { error });
    res.status(500).json({
      success: false,
      machineId: req.body.machineId,
      timestamp: new Date().toISOString(),
      predictions: [],
      highDemandCount: 0,
      mediumDemandCount: 0,
      lowDemandCount: 0,
      error: 'Failed to predict demand',
    } as DemandForecastResponse);
  }
};

/**
 * GET /api/predict-demand/:machineId
 * Alternative endpoint for GET requests
 */
export const predictDemandGetHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { machineId } = req.params;

    if (!machineId) {
      res.status(400).json({
        success: false,
        error: 'machineId is required',
      });
      return;
    }

    // Reuse POST handler logic
    await predictDemandHandler({ body: { machineId } } as Request, res);
  } catch (error) {
    functions.logger.error('GET demand prediction error', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to predict demand',
    });
  }
};
