/**
 * DemandBadge Component
 *
 * Displays demand level prediction for a product
 * Shows confidence and color-coded demand indicator
 *
 * @param {Object} props
 * @param {'low'|'medium'|'high'} props.demandLevel - Demand level
 * @param {number} props.demandScore - Demand score 0-100
 * @param {number} props.confidence - Confidence 0-1
 * @param {string} props.reasoning - Explanation for prediction
 * @param {boolean} props.showReasoning - Show reasoning text
 * @param {boolean} props.compact - Compact inline display
 */

import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';

// ============================================
// STYLE CONFIGURATION
// ============================================

const demandStyles = {
  high: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    icon: 'text-red-500',
    label: 'High Demand',
  },
  medium: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    icon: 'text-amber-500',
    label: 'Medium Demand',
  },
  low: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    icon: 'text-blue-500',
    label: 'Low Demand',
  },
};

// ============================================
// COMPONENT
// ============================================

const DemandBadge = ({
  demandLevel,
  demandScore,
  confidence,
  reasoning,
  showReasoning = false,
  compact = false,
}) => {
  const style = demandStyles[demandLevel];

  if (compact) {
    // Compact inline badge for product cards
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
        <TrendingUp className="w-3 h-3" />
        <span>{style.label}</span>
        <span className="text-opacity-70">({demandScore}%)</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border p-3 sm:p-4 ${style.bg} ${style.border}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 ${style.icon}`} />
          <span className="font-semibold text-sm sm:text-base text-gray-800">
            {style.label}
          </span>
        </div>
        <span className="text-xs sm:text-sm font-bold text-gray-600">
          {demandScore}%
        </span>
      </div>

      {/* Score bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
        <div
          className={`h-full ${
            demandLevel === 'high'
              ? 'bg-red-500'
              : demandLevel === 'medium'
                ? 'bg-amber-500'
                : 'bg-blue-500'
          }`}
          style={{ width: `${demandScore}%` }}
        />
      </div>

      {/* Confidence */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">Confidence:</span>
        <span className="font-semibold text-gray-700">
          {Math.round(confidence * 100)}%
        </span>
      </div>

      {/* Reasoning */}
      {showReasoning && reasoning && (
        <div className="mt-2 p-2 bg-white bg-opacity-60 rounded text-xs text-gray-700 border-l-2 border-gray-400">
          <div className="flex gap-1.5 items-start">
            <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-gray-600" />
            <p className="leading-relaxed">{reasoning}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandBadge;
