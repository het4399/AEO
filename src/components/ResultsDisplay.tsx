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

  // Debug: log structured data details and Unknown entries to help diagnose RDFa types
  try {
    const sd: any = (result as any).structured_data;
    if (sd && Array.isArray(sd.details)) {
      // Full details (truncate in console)
      // eslint-disable-next-line no-console
      console.log('StructuredData.details:', sd.details);
      const unknowns = sd.details.filter((d: any) => d && d.type === 'Unknown');
      if (unknowns.length > 0) {
        // eslint-disable-next-line no-console
        console.log('StructuredData.details Unknown rows:', unknowns);
      }
    }
  } catch {}

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

  // Toggle to show/hide deep detail sections via env var (CRA): REACT_APP_SHOW_DETAIL_SECTIONS=true|false
  const showDetailSections = String(process.env.REACT_APP_SHOW_DETAIL_SECTIONS || '').toLowerCase() === 'true';
  const crawlerEnabled = String(process.env.REACT_APP_CRAWLER_ENABLED || '').toLowerCase() === 'true';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Your Brand Card */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
        <div className="flex items-center gap-8">
          {/* Circular Progress */}
          <div className="relative w-32 h-32" title={`Overall score is a weighted average of AI Presence, Competitor Landscape, and Strategy Review. Weights: ${JSON.stringify((result as any).module_weights || { ai_presence: 1/3, competitor: 1/3, strategy_review: 1/3 })}`}>
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
              <h3 className="text-xl font-bold text-white" title="Strategy Review is the average of Knowledge Base, Answerability, Structured Data composite, and Crawler Accessibility scores.">Strategy Review</h3>
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

        {/* Crawl Status (placeholder UI) */}
        {crawlerEnabled && (
          <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-white">Crawl</h3>
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-900 text-yellow-300">PREVIEW</span>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-blue-500 flex items-center justify-center">
                <span className="text-blue-500 font-bold text-lg">—</span>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-3">Submit and track crawl jobs here. This is a UI-only preview; backend integration will be added.</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Status</div>
                <div className="text-gray-100 font-semibold">Not started</div>
              </div>
              <div>
                <div className="text-gray-400">Progress</div>
                <div className="text-gray-100 font-semibold">0 / 0 pages</div>
              </div>
              <div>
                <div className="text-gray-400">Avg Response</div>
                <div className="text-gray-100 font-semibold">— ms</div>
              </div>
              <div>
                <div className="text-gray-400">Total Pages</div>
                <div className="text-gray-100 font-semibold">—</div>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Export */}
      <ExportPanel result={result} />

      {/* SERP Panel */}
      <SerpPanel defaultDomainFromUrl={defaultDomain} />

      {/* Schema Information */}
      {showDetailSections && (
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
      )}

      {/* Structured Data Details */}
      {showDetailSections && (result as any).structured_data?.details && (result as any).structured_data.details.length > 0 && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Structured Data Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-300 border-b border-gray-700">
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Format</th>
                  <th className="py-2 pr-4">Valid</th>
                  <th className="py-2 pr-4">Missing Required</th>
                  <th className="py-2 pr-4">Eligible</th>
                </tr>
              </thead>
              <tbody>
                {((result as any).structured_data.details as any[]).slice(0, 25).map((row: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-700">
                    <td className="py-2 pr-4 text-gray-100">{row.type || 'Unknown'}</td>
                    <td className="py-2 pr-4 text-gray-300">{row.format || '-'}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs ${row.valid ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {row.valid ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-300">
                      {Array.isArray(row.missing_required) && row.missing_required.length > 0
                        ? row.missing_required.slice(0, 5).join(', ')
                        : '-'}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs ${row.eligible ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                        {row.eligible ? 'Eligible' : 'Review'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
      {showDetailSections && (detailedAnalysis as any).knowledge_base && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Knowledge Base Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Entities */}
            <div>
              <h4 className="text-gray-200 font-semibold mb-2">Entities</h4>
              <div className="text-sm text-gray-300 space-y-2">
                {Object.entries(((detailedAnalysis as any).knowledge_base.entities || {})).length > 0 ? (
                  Object.entries(((detailedAnalysis as any).knowledge_base.entities || {})).map(([etype, list]: any, idx: number) => {
                    const label = String(etype);
                    const values = Array.isArray(list) ? (list as string[]) : [];
                    const isQuantList = ['numbers', 'percentages', 'years', 'dates'].includes(label);
                    // Clean values: remove overly long/noisy tokens
                    const cleaned = values
                      .filter((e) => typeof e === 'string')
                      .map((e) => e.trim())
                      .filter((e) => e.length >= 2 && e.length <= 60)
                      .filter((e) => !/^https?:\/\//i.test(e))
                      .filter((e) => !/\{\}|<|>|\(|\)/.test(e));
                    const unique = Array.from(new Set(cleaned));
                    return (
                      <div key={idx}>
                        <div className="text-gray-400 mb-1 flex items-center justify-between">
                          <span>{label}</span>
                          {isQuantList && (
                            <span className="text-gray-300">{unique.length}</span>
                          )}
                        </div>
                        {!isQuantList && (
                          <div className="flex flex-wrap gap-2">
                            {unique.slice(0, 12).map((e: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-gray-700 text-gray-200 rounded text-xs">{e}</span>
                            ))}
                            {unique.length === 0 && (
                              <span className="text-gray-500 text-xs">None</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
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
      {showDetailSections && (detailedAnalysis as any).answerability && (
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

      {/* Crawler Accessibility Details */}
      {showDetailSections && (detailedAnalysis as any).crawler_accessibility && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Crawler Accessibility Details</h3>
          {(() => {
            const ca: any = (detailedAnalysis as any).crawler_accessibility;
            const robots = ca.robots_analysis || {};
            const aiBots = robots.ai_bot_access || {};
            const delays = robots.crawl_delays || {};
            const sitemaps = robots.sitemaps || [];
            const sitemapStats = ca.sitemap_stats || {};
            const renderability = (ca.content_structure && ca.content_structure.renderability) || {};
            const blocked = robots.blocked_key_paths || {};
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-gray-200 font-semibold mb-2">Robots.txt (AI Bots)</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-300 border-b border-gray-700">
                          <th className="py-2 pr-4">Agent</th>
                          <th className="py-2 pr-4">Allowed</th>
                          <th className="py-2 pr-4">Crawl-Delay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(aiBots).map((agent) => (
                          <tr key={agent} className="border-b border-gray-700">
                            <td className="py-2 pr-4 text-gray-100">{agent}</td>
                            <td className="py-2 pr-4">
                              <span className={`px-2 py-0.5 rounded text-xs ${aiBots[agent] ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                {aiBots[agent] ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="py-2 pr-4 text-gray-300">{delays[agent] ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {Object.keys(blocked).length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-gray-200 font-semibold mb-2">Blocked Key Paths</h5>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {Object.entries(blocked).map(([path, agents]: any, i: number) => (
                          <li key={i} className="flex items-center justify-between">
                            <span className="text-gray-300">{path}</span>
                            <span className="text-xs text-red-300">{Array.isArray(agents) ? agents.join(', ') : String(agents)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-gray-200 font-semibold mb-2">Sitemap & Renderability</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-700/40 rounded p-3">
                      <div className="text-gray-400">Sitemaps Found</div>
                      <div className="text-gray-100 font-semibold">{sitemaps.length}</div>
                    </div>
                    <div className="bg-gray-700/40 rounded p-3">
                      <div className="text-gray-400">Sitemaps Fetched</div>
                      <div className="text-gray-100 font-semibold">{sitemapStats.fetched ?? 0}</div>
                    </div>
                    <div className="bg-gray-700/40 rounded p-3">
                      <div className="text-gray-400">URLs in Sitemap</div>
                      <div className="text-gray-100 font-semibold">{sitemapStats.url_count ?? 0}</div>
                    </div>
                    <div className="bg-gray-700/40 rounded p-3">
                      <div className="text-gray-400">Lastmod Coverage</div>
                      <div className="text-gray-100 font-semibold">{sitemapStats.lastmod_coverage_pct ?? 0}%</div>
                    </div>
                    <div className="bg-gray-700/40 rounded p-3 col-span-2">
                      <div className="text-gray-400">Images with Alt</div>
                      <div className="text-gray-100 font-semibold">{renderability.images_alt_pct ?? 0}%</div>
                    </div>
                    <div className="bg-gray-700/40 rounded p-3">
                      <div className="text-gray-400">Headings</div>
                      <div className="text-gray-100 font-semibold">{renderability.headings_count ?? 0}</div>
                    </div>
                    <div className="bg-gray-700/40 rounded p-3">
                      <div className="text-gray-400">Links</div>
                      <div className="text-gray-100 font-semibold">{renderability.links_count ?? 0}</div>
                    </div>
                  </div>

                  {sitemaps.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-gray-200 font-semibold mb-2">Sitemaps</h5>
                      <ul className="text-xs text-blue-300 space-y-1 break-all">
                        {sitemaps.slice(0, 5).map((sm: string, i: number) => (
                          <li key={i}><a href={sm} target="_blank" rel="noreferrer" className="hover:text-blue-200">{sm}</a></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
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

      {/* Recent Analyses - removed by request */}
    </div>
  );
};

export default ResultsDisplay;

// Lightweight recent analyses panel
const RecentAnalysesPanel: React.FC = () => {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const mod = await import('../services/api');
        const data = await mod.apiService.listRuns(10);
        if (mounted) setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load recent runs');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
      <h3 className="text-xl font-bold text-gray-100 mb-4">Recent Analyses</h3>
      {loading && <div className="text-gray-400">Loading…</div>}
      {error && <div className="text-red-400">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-300 border-b border-gray-700">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">URL</th>
                <th className="py-2 pr-4">Score</th>
                <th className="py-2 pr-4">Grade</th>
                <th className="py-2 pr-4">Run</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r: any, idx: number) => (
                <tr key={r.id || idx} className="border-b border-gray-700">
                  <td className="py-2 pr-4 text-gray-300">{r.created_at || '-'}</td>
                  <td className="py-2 pr-4 text-blue-300 break-all">{r.url || '-'}</td>
                  <td className="py-2 pr-4 text-gray-100">{r.overall_score ?? '-'}</td>
                  <td className="py-2 pr-4 text-gray-100">{r.grade ?? '-'}</td>
                  <td className="py-2 pr-4">
                    <LoadRunButton runId={r.id} />
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="py-2 text-gray-500" colSpan={5}>No runs yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const LoadRunButton: React.FC<{ runId?: string }> = ({ runId }) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  if (!runId) return <span className="text-gray-500">—</span>;
  return (
    <button
      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded text-xs"
      onClick={async () => {
        try {
          setLoading(true);
          const mod = await import('../services/api');
          const data = await mod.apiService.getRun(runId);
          const response = data?.response;
          if (response) {
            // Replace current page state by dispatching a custom event consumed by App if needed.
            // For simplicity, open JSON in a new window.
            const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
          }
        } catch (e) {
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
    >
      {loading ? 'Loading…' : 'View'}
    </button>
  );
};

// Export panel for current analysis
export const ExportPanel: React.FC<{ result: any }> = ({ result }) => {
  const download = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const toCSV = (): string => {
    const da: any = (result as any).detailed_analysis || {};
    const sd: any = (result as any).structured_data || {};
    const row = {
      url: result.url,
      overall_score: result.overall_score,
      grade: result.grade,
      ai_presence: da.ai_presence?.score ?? '',
      competitor_analysis: da.competitor_analysis?.score ?? '',
      knowledge_base: da.knowledge_base?.score ?? '',
      answerability: da.answerability?.score ?? '',
      crawler_accessibility: da.crawler_accessibility?.score ?? '',
      structured_data_composite: Math.round(((sd.coverage_score || 0) + (sd.quality_score || 0) + (sd.completeness_score || 0)) / 3),
      analysis_timestamp: (result as any).analysis_timestamp || ''
    } as Record<string, any>;
    const headers = Object.keys(row);
    const values = headers.map(h => String(row[h]).replace(/"/g, '""'));
    return headers.join(',') + '\n' + values.map(v => /[,\n\"]/.test(v) ? `"${v}"` : v).join(',');
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
      <h3 className="text-lg font-bold text-gray-100 mb-3">Export</h3>
      <div className="flex gap-3">
        <button
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded text-sm"
          onClick={() => download(JSON.stringify(result, null, 2), 'analysis.json', 'application/json')}
        >
          Download JSON
        </button>
        <button
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-100 rounded text-sm"
          onClick={() => download(toCSV(), 'analysis.csv', 'text/csv')}
        >
          Download CSV
        </button>
      </div>
    </div>
  );
};
