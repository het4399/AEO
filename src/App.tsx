import React, { useState } from 'react';
import { AnalysisResult } from './types';
import { apiService } from './services/api';
import AnalysisForm from './components/AnalysisForm';
import ResultsDisplay from './components/ResultsDisplay';
import ErrorDisplay from './components/ErrorDisplay';

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (url: string): Promise<void> => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Starting analysis for URL:', url);
      const analysisResult = await apiService.analyzeUrl(url);
      console.log('Analysis completed:', analysisResult);
      setResult(analysisResult);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '20px 20px' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            AEO Checker
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Analyze your website's structured data and get actionable insights to improve 
            your search engine visibility and Answer Engine Optimization (AEO).
          </p>
        </div>

        {/* Input Form */}
        <AnalysisForm onAnalyze={handleAnalyze} loading={loading} />

        {/* Error Display */}
        {error && <ErrorDisplay error={error} />}

        {/* Results Display */}
        {result && <ResultsDisplay result={result} />}
      </div>
    </div>
  );
};

export default App;
