/**
 * TrendingBanner Component
 * 
 * Displays the top trending product with decision tree insights
 * Shows on machine pages to highlight what's hot right now
 */

import React from 'react';
import { Flame, TrendingUp, Zap } from 'lucide-react';

const TrendingBanner = ({ topProduct, trendingCount }) => {
  if (!topProduct) return null;

  const demandColor = {
    high: 'from-red-500 to-orange-500',
    medium: 'from-amber-500 to-yellow-500',
    low: 'from-blue-500 to-cyan-500',
  }[topProduct.demandPrediction?.demandLevel] || 'from-orange-500 to-red-500';

  const demandTextColor = {
    high: 'text-red-600',
    medium: 'text-amber-600',
    low: 'text-blue-600',
  }[topProduct.demandPrediction?.demandLevel] || 'text-orange-600';

  return (
    <div className="glass-strong p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 mb-4 sm:mb-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 flex-1">
          <div className={`bg-gradient-to-br ${demandColor} p-3 sm:p-4 rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">{topProduct.name}</h3>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-300">
                <Flame className="w-3 h-3" />
                #{topProduct.trending?.rank || 1}
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 mb-2">
              {topProduct.compositeReason}
            </p>

            {/* Decision Tree Insights */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/60 backdrop-blur rounded-lg p-2">
                <p className="text-xs text-gray-600">Demand</p>
                <p className={`text-sm font-bold ${demandTextColor} capitalize`}>
                  {topProduct.demandPrediction?.demandLevel}
                </p>
              </div>
              <div className="bg-white/60 backdrop-blur rounded-lg p-2">
                <p className="text-xs text-gray-600">Confidence</p>
                <p className="text-sm font-bold text-indigo-600">
                  {Math.round((topProduct.demandPrediction?.confidence || 0) * 100)}%
                </p>
              </div>
              <div className="bg-white/60 backdrop-blur rounded-lg p-2">
                <p className="text-xs text-gray-600">Trend Score</p>
                <p className="text-sm font-bold text-orange-600">
                  {topProduct.trendingScore}/100
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-600 mb-2">
            {trendingCount} products trending
          </p>
          <div className="flex items-center gap-2 px-3 py-2 bg-white/70 backdrop-blur rounded-lg">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-600">Hot Now</span>
          </div>
        </div>
      </div>

      {/* Reasoning */}
      {topProduct.demandPrediction?.reasoning && (
        <div className="mt-3 pt-3 border-t border-orange-200">
          <p className="text-xs text-gray-700 flex items-start gap-2">
            <Zap className="w-3 h-3 mt-0.5 text-orange-500 flex-shrink-0" />
            <span className="italic">{topProduct.demandPrediction.reasoning}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default TrendingBanner;
