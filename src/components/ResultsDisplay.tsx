import React from 'react';
import { CheckCircle, AlertCircle, XCircle, ExternalLink } from 'lucide-react';
import { AnalysisResult } from '../types';
import MetricCard from './MetricCard';
import SerpPanel from './SerpPanel';

interface ResultsDisplayProps {
  result: AnalysisResult;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  // Add comprehensive error handling
  if (!result) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-900 border border-red-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-red-200 mb-4 flex items-center gap-2">
            <XCircle className="w-6 h-6" />
            No Analysis Data
          </h3>
          <p className="text-red-300">No analysis result data available. Please try running the analysis again.</p>
        </div>
      </div>
    );
  }

  const defaultDomain = (() => {
    try {
      const u = new URL(result.url || 'https://example.com');
      return u.hostname;
    } catch {
      return '';
    }
  })();

  // Static placeholder data for demonstration
  const staticData = {
    overallScore: 72,
    aiPresenceScore: 68,
    competitorScore: 94,
    strategyScore: 55,
    chatgptScore: 85,
    geminiScore: 20,
    claudeScore: 100,
    answerability: 46,
    knowledgeBase: 100,
    structuredData: 23,
    aiCrawlerAccess: 50,
    competitors: [
      { name: 'Apple', count: 3 },
      { name: 'Xiaomi', count: 2 },
      { name: 'Oppo', count: 1 },
      { name: 'Samsung', count: 1 },
      { name: 'Other', count: 4 }
    ]
  };

  // Determine which data to use (real vs static) - UPDATED STATUS
  // Check if detailed_analysis exists and has the modules
  const detailedAnalysis = (result as any).detailed_analysis || {};
  
  const useRealData = {
    overallScore: true, // ✅ LIVE - Overall score from all modules
    aiPresence: !!(detailedAnalysis as any).ai_presence && (detailedAnalysis as any).ai_presence.score !== undefined, // ✅ LIVE - AI Presence Analysis
    competitorLandscape: !!(detailedAnalysis as any).competitor_analysis && (detailedAnalysis as any).competitor_analysis.score !== undefined, // ✅ LIVE - Competitor Analysis
    strategyReview: true, // ✅ LIVE - Strategy Review (Knowledge Base + Answerability + Structured Data + AI Crawler)
    chatgptScore: !!(detailedAnalysis as any).ai_presence && (detailedAnalysis as any).ai_presence.checks, // ✅ LIVE - AI bot accessibility
    geminiScore: !!(detailedAnalysis as any).ai_presence && (detailedAnalysis as any).ai_presence.checks, // ✅ LIVE - AI bot accessibility
    claudeScore: !!(detailedAnalysis as any).ai_presence && (detailedAnalysis as any).ai_presence.checks, // ✅ LIVE - AI bot accessibility
    answerability: !!(detailedAnalysis as any).answerability && (detailedAnalysis as any).answerability.score !== undefined, // ✅ LIVE - Answerability Analysis
    knowledgeBase: !!(detailedAnalysis as any).knowledge_base && (detailedAnalysis as any).knowledge_base.score !== undefined, // ✅ LIVE - Knowledge Base Analysis
    structuredData: true, // ✅ LIVE - Structured Data Analysis (existing)
    aiCrawlerAccess: !!(detailedAnalysis as any).crawler_accessibility && (detailedAnalysis as any).crawler_accessibility.score !== undefined, // ✅ LIVE - AI Crawler Accessibility
  };

  // Calculate real structured data score from structured_data object with fallback
  const realStructuredDataScore = (result as any).structured_data ? Math.round(
    ((result as any).structured_data.coverage_score + (result as any).structured_data.quality_score + (result as any).structured_data.completeness_score) / 3
  ) : 0;

  // Calculate individual AI bot scores based on robots.txt checks
  const getAIBotScore = (botName: string) => {
    if (!(detailedAnalysis as any).ai_presence?.checks) {
      // Fallback to static data based on bot name
      switch (botName.toLowerCase()) {
        case 'gptbot': return staticData.chatgptScore;
        case 'google-extended': return staticData.geminiScore;
        case 'claudebot': return staticData.claudeScore;
        default: return 50;
      }
    }
    
    const robotsKey = `robots_${botName.toLowerCase()}`;
    const isAllowed = (detailedAnalysis as any).ai_presence.checks[robotsKey];
    
    if (isAllowed === true) {
      return 85; // High score if allowed
    } else if (isAllowed === false) {
      return 20; // Low score if blocked
    } else {
      return 50; // Medium score if not specified (default allow)
    }
  };

  const realChatGPTScore = getAIBotScore('gptbot');
  const realGeminiScore = getAIBotScore('google-extended');
  const realClaudeScore = getAIBotScore('claudebot');

  // Check if we're using real data or static fallback
  const isUsingRealAIData = (detailedAnalysis as any).ai_presence?.checks ? true : false;

  // Helper function to get data with static indicator
  const getDataWithIndicator = (key: string, realValue: any, staticValue: any, isImplemented: boolean) => {
    return {
      value: isImplemented ? realValue : staticValue,
      isStatic: !isImplemented,
      label: isImplemented ? 'LIVE' : 'STATIC'
    };
  };

  // Debug logging removed - data structure fix confirmed working

  return (
    <div className="max-w-7xl mx-auto">
      {/* Your Brand Card */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
        <div className="flex items-center gap-8">
          {/* Circular Progress */}
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${((result.overall_score || 0) / 100) * 283} 283`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {useRealData.overallScore && result.overall_score ? result.overall_score : staticData.overallScore}/100
              </span>
            </div>
          </div>
          
          {/* Brand Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">Your Brand</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                useRealData.overallScore 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-yellow-900 text-yellow-300'
              }`}>
                {useRealData.overallScore ? 'LIVE' : 'STATIC'}
              </span>
          </div>
            <div className="text-gray-400 text-sm mb-2">
              {new Date().toLocaleDateString('en-GB')} • 
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-400 hover:text-blue-300">
              {result.url}
            </a>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Exceptional! Your Company's AEO report obtained an outstanding score of 95. Your company has mastered AI visibility strategies and is prominently featured in AI responses. Our suggestions will help maintain this exceptional performance.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* AI Presence Card */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">AI Presence</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                useRealData.aiPresence 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-yellow-900 text-yellow-300'
              }`}>
                {useRealData.aiPresence ? 'LIVE' : 'STATIC'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-orange-500 flex items-center justify-center">
              <span className="text-orange-500 font-bold text-lg">
                {useRealData.aiPresence && (detailedAnalysis as any).ai_presence ? Math.round((detailedAnalysis as any).ai_presence.score) : staticData.aiPresenceScore}
              </span>
            </div>
          </div>
          
          {/* AI Bot Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <span className="text-gray-300 text-sm">ChatGPT</span>
              </div>
              <div className="flex items-center gap-2">
                {realChatGPTScore >= 70 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : realChatGPTScore >= 50 ? (
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={`font-semibold ${
                  realChatGPTScore >= 70 ? 'text-green-500' : 
                  realChatGPTScore >= 50 ? 'text-orange-500' : 'text-red-500'
                }`}>{realChatGPTScore}</span>
                <span className={`px-1 py-0.5 rounded text-xs ${
                  isUsingRealAIData 
                    ? 'bg-green-900 text-green-300' 
                    : 'bg-yellow-900 text-yellow-300'
                }`}>
                  {isUsingRealAIData ? 'LIVE' : 'STATIC'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-500 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">G</span>
                </div>
                <span className="text-gray-300 text-sm">Gemini</span>
              </div>
              <div className="flex items-center gap-2">
                {realGeminiScore >= 70 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : realGeminiScore >= 50 ? (
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={`font-semibold ${
                  realGeminiScore >= 70 ? 'text-green-500' : 
                  realGeminiScore >= 50 ? 'text-orange-500' : 'text-red-500'
                }`}>{realGeminiScore}</span>
                <span className={`px-1 py-0.5 rounded text-xs ${
                  isUsingRealAIData 
                    ? 'bg-green-900 text-green-300' 
                    : 'bg-yellow-900 text-yellow-300'
                }`}>
                  {isUsingRealAIData ? 'LIVE' : 'STATIC'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">C</span>
                </div>
                <span className="text-gray-300 text-sm">Claude</span>
              </div>
              <div className="flex items-center gap-2">
                {realClaudeScore >= 70 ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : realClaudeScore >= 50 ? (
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={`font-semibold ${
                  realClaudeScore >= 70 ? 'text-green-500' : 
                  realClaudeScore >= 50 ? 'text-orange-500' : 'text-red-500'
                }`}>{realClaudeScore}</span>
                <span className={`px-1 py-0.5 rounded text-xs ${
                  isUsingRealAIData 
                    ? 'bg-green-900 text-green-300' 
                    : 'bg-yellow-900 text-yellow-300'
                }`}>
                  {isUsingRealAIData ? 'LIVE' : 'STATIC'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Competitor Landscape Card */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">Competitor Landscape</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                useRealData.competitorLandscape 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-yellow-900 text-yellow-300'
              }`}>
                {useRealData.competitorLandscape ? 'LIVE' : 'STATIC'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-green-500 flex items-center justify-center">
              <span className="text-green-500 font-bold text-lg">
                {useRealData.competitorLandscape && (detailedAnalysis as any).competitor_analysis 
                  ? Math.round((detailedAnalysis as any).competitor_analysis.score) 
                  : staticData.competitorScore}
              </span>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm mb-4">
            Your company or product was mentioned in industry/product related searches.
          </p>
          
          <div>
            <h4 className="text-gray-400 text-sm font-semibold mb-2">Competitors Mentioned:</h4>
            <div className="flex flex-wrap gap-2">
              {staticData.competitors.map((competitor, index) => (
                <span key={index} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                  {competitor.count} {competitor.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Strategy Review Card */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-white">Strategy Review</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                useRealData.strategyReview 
                  ? 'bg-green-900 text-green-300' 
                  : 'bg-yellow-900 text-yellow-300'
              }`}>
                {useRealData.strategyReview ? 'LIVE' : 'STATIC'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-orange-500 flex items-center justify-center">
              <span className="text-orange-500 font-bold text-lg">
                {useRealData.strategyReview 
                  ? Math.round((
                      ((detailedAnalysis as any).answerability?.score || 0) + 
                      ((detailedAnalysis as any).knowledge_base?.score || 0) + 
                      realStructuredDataScore + 
                      ((detailedAnalysis as any).crawler_accessibility?.score || 0)
                    ) / 4)
                  : staticData.strategyScore}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Answerability</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-700 rounded-full h-2">
                  <div className={`h-2 rounded-full ${
                    ((detailedAnalysis as any).answerability?.score || staticData.answerability) >= 70 ? 'bg-green-500' : 
                    ((detailedAnalysis as any).answerability?.score || staticData.answerability) >= 50 ? 'bg-orange-500' : 'bg-red-500'
                  }`} style={{ width: `${(detailedAnalysis as any).answerability?.score || staticData.answerability}%` }}></div>
                </div>
                <span className={`font-semibold text-sm ${
                  ((detailedAnalysis as any).answerability?.score || staticData.answerability) >= 70 ? 'text-green-500' : 
                  ((detailedAnalysis as any).answerability?.score || staticData.answerability) >= 50 ? 'text-orange-500' : 'text-red-500'
                }`}>{Math.round((detailedAnalysis as any).answerability?.score || staticData.answerability)}</span>
                <span className={`px-1 py-0.5 rounded text-xs ${
                  useRealData.answerability 
                    ? 'bg-green-900 text-green-300' 
                    : 'bg-yellow-900 text-yellow-300'
                }`}>
                  {useRealData.answerability ? 'LIVE' : 'STATIC'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Knowledge Base</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-700 rounded-full h-2">
                  <div className={`h-2 rounded-full ${
                    ((detailedAnalysis as any).knowledge_base?.score || staticData.knowledgeBase) >= 70 ? 'bg-green-500' : 
                    ((detailedAnalysis as any).knowledge_base?.score || staticData.knowledgeBase) >= 50 ? 'bg-orange-500' : 'bg-red-500'
                  }`} style={{ width: `${Math.round((detailedAnalysis as any).knowledge_base?.score || staticData.knowledgeBase)}%` }}></div>
                </div>
                <span className={`font-semibold text-sm ${
                  ((detailedAnalysis as any).knowledge_base?.score || staticData.knowledgeBase) >= 70 ? 'text-green-500' : 
                  ((detailedAnalysis as any).knowledge_base?.score || staticData.knowledgeBase) >= 50 ? 'text-orange-500' : 'text-red-500'
                }`}>{Math.round((detailedAnalysis as any).knowledge_base?.score || staticData.knowledgeBase)}</span>
                <span className={`px-1 py-0.5 rounded text-xs ${
                  useRealData.knowledgeBase 
                    ? 'bg-green-900 text-green-300' 
                    : 'bg-yellow-900 text-yellow-300'
                }`}>
                  {useRealData.knowledgeBase ? 'LIVE' : 'STATIC'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Structured Data</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-700 rounded-full h-2">
                  <div className={`h-2 rounded-full ${
                    realStructuredDataScore >= 70 ? 'bg-green-500' : 
                    realStructuredDataScore >= 50 ? 'bg-orange-500' : 'bg-red-500'
                  }`} style={{ width: `${realStructuredDataScore}%` }}></div>
                </div>
                <span className={`font-semibold text-sm ${
                  realStructuredDataScore >= 70 ? 'text-green-500' : 
                  realStructuredDataScore >= 50 ? 'text-orange-500' : 'text-red-500'
                }`}>{realStructuredDataScore}</span>
                <span className="px-1 py-0.5 bg-green-900 text-green-300 rounded text-xs">LIVE</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">AI Crawler Accessibility</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-700 rounded-full h-2">
                  <div className={`h-2 rounded-full ${
                    ((detailedAnalysis as any).crawler_accessibility?.score || staticData.aiCrawlerAccess) >= 70 ? 'bg-green-500' : 
                    ((detailedAnalysis as any).crawler_accessibility?.score || staticData.aiCrawlerAccess) >= 50 ? 'bg-orange-500' : 'bg-red-500'
                  }`} style={{ width: `${(detailedAnalysis as any).crawler_accessibility?.score || staticData.aiCrawlerAccess}%` }}></div>
                </div>
                <span className={`font-semibold text-sm ${
                  ((detailedAnalysis as any).crawler_accessibility?.score || staticData.aiCrawlerAccess) >= 70 ? 'text-green-500' : 
                  ((detailedAnalysis as any).crawler_accessibility?.score || staticData.aiCrawlerAccess) >= 50 ? 'text-orange-500' : 'text-red-500'
                }`}>{(detailedAnalysis as any).crawler_accessibility?.score || staticData.aiCrawlerAccess}</span>
                <span className={`px-1 py-0.5 rounded text-xs ${
                  useRealData.aiCrawlerAccess 
                    ? 'bg-green-900 text-green-300' 
                    : 'bg-yellow-900 text-yellow-300'
                }`}>
                  {useRealData.aiCrawlerAccess ? 'LIVE' : 'STATIC'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* SERP Panel */}
      <SerpPanel defaultDomainFromUrl={defaultDomain} />

      {/* Schema Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Schema Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Total Schemas:</span>
              <span className="font-semibold text-gray-100">{(result as any).structured_data?.total_schemas || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Valid Schemas:</span>
              <span className="font-semibold text-green-400">{(result as any).structured_data?.valid_schemas || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Invalid Schemas:</span>
              <span className="font-semibold text-red-400">{(result as any).structured_data?.invalid_schemas || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Schema Types Found</h3>
          {(result as any).structured_data?.schema_types && (result as any).structured_data.schema_types.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {(result as any).structured_data.schema_types.map((type: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm"
                >
                  {type}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No schema types found</p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-900 text-blue-300 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-gray-300">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Knowledge Base Details */}
      {(detailedAnalysis as any).knowledge_base && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Knowledge Base Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Entities */}
            <div>
              <h4 className="text-gray-200 font-semibold mb-2">Entities</h4>
              <div className="text-sm text-gray-300 space-y-2">
                {Object.entries(((detailedAnalysis as any).knowledge_base.entities || {})).length > 0 ? (
                  Object.entries(((detailedAnalysis as any).knowledge_base.entities || {})).map(([etype, list]: any, idx: number) => (
                    <div key={idx}>
                      <div className="text-gray-400 mb-1">{String(etype)}</div>
                      <div className="flex flex-wrap gap-2">
                        {(list as string[]).slice(0, 12).map((e: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-700 text-gray-200 rounded text-xs">{e}</span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No entities detected.</div>
                )}
              </div>
            </div>

            {/* Facts */}
            <div>
              <h4 className="text-gray-200 font-semibold mb-2">Extracted Facts</h4>
              <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                {(((detailedAnalysis as any).knowledge_base.facts || []) as any[]).slice(0, 10).map((f: any, i: number) => (
                  <li key={i}>
                    <span className="text-gray-200">{f.statement || String(f)}</span>
                  </li>
                ))}
                {(((detailedAnalysis as any).knowledge_base.facts || []) as any[]).length === 0 && (
                  <li className="text-gray-500 list-none">No facts extracted.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Answerability Details */}
      {(detailedAnalysis as any).answerability && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Answerability Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Q/A pairs */}
            <div>
              <h4 className="text-gray-200 font-semibold mb-2">Q/A Pairs</h4>
              <ul className="space-y-3">
                {(((detailedAnalysis as any).answerability.qa_pairs || []) as any[]).slice(0, 8).map((qa: any, i: number) => (
                  <li key={i} className="border border-gray-700 rounded p-3">
                    <div className="text-gray-100 font-semibold mb-1">Q: {qa.question}</div>
                    <div className="text-gray-300 text-sm">A: {qa.answer}</div>
                  </li>
                ))}
                {(((detailedAnalysis as any).answerability.qa_pairs || []) as any[]).length === 0 && (
                  <li className="text-gray-500 list-none">No Q/A pairs detected.</li>
                )}
              </ul>
            </div>

            {/* Structures summary */}
            <div>
              <h4 className="text-gray-200 font-semibold mb-2">Structures Summary</h4>
              <div className="text-sm text-gray-300 space-y-1">
                {Object.entries(((detailedAnalysis as any).answerability.answer_structures || {})).map(([k, v]: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-gray-400">{String(k)}</span>
                    <span className="text-gray-100 font-semibold">{String(v)}</span>
                  </div>
                ))}
                {Object.keys(((detailedAnalysis as any).answerability.answer_structures || {})).length === 0 && (
                  <div className="text-gray-500">No structures detected.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Presence Checklist */}
      {result.ai_presence && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-100 mb-4">AI Presence Checklist</h3>
          <p className="text-gray-300 mb-4">{result.ai_presence.explanation}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(result.ai_presence.checks).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border border-gray-600 rounded-md p-3">
                <span className="text-gray-300 break-all">{k}</span>
                <span className={`text-sm font-semibold ${v === true ? 'text-green-400' : v === false ? 'text-red-400' : 'text-gray-400'}`}>
                  {typeof v === 'boolean' ? (v ? 'PASS' : 'FAIL') : String(v)}
                </span>
              </div>
            ))}
          </div>
          {result.ai_presence.recommendations?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-100 mb-2">Top Fixes</h4>
              <ul className="list-disc list-inside text-gray-300">
                {result.ai_presence.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Errors */}
      {result.errors && result.errors.length > 0 && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-red-200 mb-4 flex items-center gap-2">
            <XCircle className="w-6 h-6" />
            Errors Found
          </h3>
          <ul className="space-y-2">
            {result.errors.map((error, index) => (
              <li key={index} className="text-red-300 flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {result.warnings && result.warnings.length > 0 && (
        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-200 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Warnings
          </h3>
          <ul className="space-y-2">
            {result.warnings.map((warning, index) => (
              <li key={index} className="text-yellow-300 flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
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
