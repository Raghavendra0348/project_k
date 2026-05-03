/**
 * TrendingAnalyticsPanel Component
 * 
 * Displays trending analysis using decision tree algorithm
 * Shows trending products, demand predictions, and detailed insights
 */

import React from 'react';
import {
  Flame,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Zap,
  Target,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
} from 'recharts';

const TrendingAnalyticsPanel = ({ trendingData, products }) => {
  if (!trendingData || !trendingData.trendingProducts) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Trending Analysis (Decision Tree)
        </h3>
        <div className="h-40 flex items-center justify-center text-gray-400">
          No trending data available
        </div>
      </div>
    );
  }

  const { trendingProducts, allAnalyzed, trendingCount, trendingCategories } = trendingData;

  // Prepare data for demand distribution chart
  const demandDistribution = {
    high: allAnalyzed?.filter((p) => p.demandPrediction?.demandLevel === 'high').length || 0,
    medium: allAnalyzed?.filter((p) => p.demandPrediction?.demandLevel === 'medium').length || 0,
    low: allAnalyzed?.filter((p) => p.demandPrediction?.demandLevel === 'low').length || 0,
  };

  const demandData = [
    { name: 'High Demand', value: demandDistribution.high, color: '#ef4444' },
    { name: 'Medium Demand', value: demandDistribution.medium, color: '#f59e0b' },
    { name: 'Low Demand', value: demandDistribution.low, color: '#3b82f6' },
  ];

  // Prepare trending products data for chart
  const trendingChartData = trendingProducts.slice(0, 5).map((product) => ({
    name: product.name.substring(0, 12),
    score: product.trendingScore,
    sales: product.salesData?.lastWeek || 0,
    demand: product.demandPrediction?.demandScore || 0,
  }));

  // Prepare category breakdown
  const categoryData = trendingCategories.map((cat) => ({
    name: cat.category,
    count: cat.count,
    products: cat.products.map((p) => p.name).join(', '),
  }));

  return (
    <div className="space-y-6">
      {/* Main Trending Overview */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Trending Analysis (Decision Tree Algorithm)
        </h3>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{trendingCount}</p>
                <p className="text-xs text-gray-600">Trending Products</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{demandDistribution.high}</p>
                <p className="text-xs text-gray-600">High Demand</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{allAnalyzed?.length || 0}</p>
                <p className="text-xs text-gray-600">Total Analyzed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Trending Products */}
        {trendingProducts.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-500" />
              Top Trending Products
            </h4>
            <div className="space-y-2">
              {trendingProducts.slice(0, 5).map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{product.name}</p>
                      <p className="text-xs text-gray-600">{product.compositeReason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-600">{product.trendingScore}pts</p>
                    <p className="text-xs text-gray-500">Trend Score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trending Score Chart */}
      {trendingChartData.length > 0 && (
        <div className="glass-card p-6 rounded-2xl">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Top Trending Scores</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trendingChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="score" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Demand Distribution */}
      <div className="glass-card p-6 rounded-2xl">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Demand Distribution</h4>
        <div className="grid grid-cols-3 gap-4">
          {demandData.map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                style={{ backgroundColor: item.color + '20', color: item.color }}
              >
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold" style={{ color: item.color }}>
                {item.value}
              </p>
              <p className="text-xs text-gray-600">{item.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Trending Breakdown */}
      {categoryData.length > 0 && (
        <div className="glass-card p-6 rounded-2xl">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Trending by Category</h4>
          <div className="space-y-3">
            {categoryData.map((cat) => (
              <div
                key={cat.name}
                className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700 capitalize">{cat.name}</span>
                  <span className="px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
                    {cat.count} trending
                  </span>
                </div>
                <p className="text-xs text-gray-600">{cat.products}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Tree Explanation */}
      <div className="glass-card p-6 rounded-2xl bg-blue-50 border border-blue-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          How This Works (Decision Tree Algorithm)
        </h4>
        <div className="text-xs text-gray-600 space-y-2">
          <p>
            ✓ <strong>Demand Prediction:</strong> Analyzes time of day, day of week, category, and stock levels
          </p>
          <p>
            ✓ <strong>Sales Analysis:</strong> Considers weekly sales and growth percentage
          </p>
          <p>
            ✓ <strong>Composite Score:</strong> Combines demand (40%), sales volume (35%), and growth (25%)
          </p>
          <p>
            ✓ <strong>Top 5 Ranking:</strong> Products with highest composite scores are marked as trending
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrendingAnalyticsPanel;
