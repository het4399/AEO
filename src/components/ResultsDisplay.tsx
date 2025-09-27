import React from 'react';
import { CheckCircle, AlertCircle, XCircle, ExternalLink } from 'lucide-react';
import { AnalysisResult } from '../types';
import MetricCard from './MetricCard';

interface ResultsDisplayProps {
  result: AnalysisResult;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Overall Grade */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="text-center">
          <div 
            className="inline-flex items-center justify-center w-24 h-24 rounded-full text-4xl font-bold text-white mb-4"
            style={{ backgroundColor: result.grade_color }}
          >
            {result.grade}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Overall Grade: {result.grade}
          </h2>
          <p className="text-lg text-gray-600">
            Score: {result.overall_score}/100
          </p>
          <div className="mt-4">
            <a 
              href={result.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4" />
              {result.url}
            </a>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Coverage Score"
          score={result.metrics.coverage_score}
          description="Schema type coverage"
          icon={<CheckCircle className="w-6 h-6" />}
          explanation={result.explanations.coverage_explanation}
        />
        <MetricCard
          title="Quality Score"
          score={result.metrics.quality_score}
          description="Schema validation quality"
          icon={<CheckCircle className="w-6 h-6" />}
          explanation={result.explanations.quality_explanation}
        />
        <MetricCard
          title="Completeness Score"
          score={result.metrics.completeness_score}
          description="Data richness and depth"
          icon={<AlertCircle className="w-6 h-6" />}
          explanation={result.explanations.completeness_explanation}
        />
        <MetricCard
          title="SEO Relevance Score"
          score={result.metrics.seo_relevance_score}
          description="SEO-critical schema presence"
          icon={<AlertCircle className="w-6 h-6" />}
          explanation={result.explanations.seo_relevance_explanation}
        />
      </div>

      {/* Google Validation Results */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          Google Rich Results Validation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-4 h-4 rounded-full ${result.google_validation.eligible_for_rich_results ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-semibold">
                {result.google_validation.eligible_for_rich_results ? 'Eligible for Rich Results' : 'Not Eligible for Rich Results'}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-gray-600">Google Score:</span>
              <span className={`font-bold text-lg ${result.google_validation.google_score >= 70 ? 'text-green-600' : result.google_validation.google_score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {result.google_validation.google_score}/100
              </span>
            </div>
            {result.google_validation.rich_results_types.length > 0 && (
              <div>
                <span className="text-gray-600 text-sm">Rich Results Types:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {result.google_validation.rich_results_types.map((type, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            {result.google_validation.errors.length > 0 && (
              <div className="mb-3">
                <span className="text-red-600 font-semibold text-sm">Errors:</span>
                <ul className="text-sm text-red-600 mt-1">
                  {result.google_validation.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.google_validation.warnings.length > 0 && (
              <div className="mb-3">
                <span className="text-yellow-600 font-semibold text-sm">Warnings:</span>
                <ul className="text-sm text-yellow-600 mt-1">
                  {result.google_validation.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        {result.google_validation.recommendations.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-blue-800 font-semibold text-sm">Google Recommendations:</span>
            <ul className="text-sm text-blue-700 mt-1">
              {result.google_validation.recommendations.map((rec, index) => (
                <li key={index}>• {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Schema Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Schema Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Schemas:</span>
              <span className="font-semibold">{result.metrics.total_schemas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valid Schemas:</span>
              <span className="font-semibold text-green-600">{result.metrics.valid_schemas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Invalid Schemas:</span>
              <span className="font-semibold text-red-600">{result.metrics.invalid_schemas}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Schema Types Found</h3>
          {result.metrics.schema_types.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.metrics.schema_types.map((type, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {type}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No schema types found</p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
            <XCircle className="w-6 h-6" />
            Errors Found
          </h3>
          <ul className="space-y-2">
            {result.errors.map((error, index) => (
              <li key={index} className="text-red-700 flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Warnings
          </h3>
          <ul className="space-y-2">
            {result.warnings.map((warning, index) => (
              <li key={index} className="text-yellow-700 flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
