import React, { useState } from 'react';
import { MetricCardProps } from '../types';
import { Info } from 'lucide-react';

const MetricCard: React.FC<MetricCardProps> = ({ title, score, description, icon, explanation }) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {explanation && (
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="ml-auto p-1 hover:bg-gray-100 rounded-full"
            title="Show explanation"
          >
            <Info className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${getScoreBgColor(score)} ${getScoreColor(score)} mb-2`}>
        {score}
      </div>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      
      {showExplanation && explanation && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">{explanation}</p>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
