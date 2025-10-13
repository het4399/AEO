import React, { useState } from 'react';
import { Search, Loader } from 'lucide-react';

interface AnalysisFormProps {
  onAnalyze: (url: string) => void;
  loading: boolean;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({ onAnalyze, loading }) => {
  const [url, setUrl] = useState<string>('');
  const crawlerEnabled = String(process.env.REACT_APP_CRAWLER_ENABLED || '').toLowerCase() === 'true';
  const [runCrawl, setRunCrawl] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  // Advanced options (UI only for now)
  const [allowSubdomains, setAllowSubdomains] = useState<boolean>(false);
  const [denyParams, setDenyParams] = useState<string>('utm_,session,sort,filter,ref,fbclid,gclid');
  const [concurrency, setConcurrency] = useState<number>(150);
  const [delayMs, setDelayMs] = useState<number>(150);
  const [maxPages, setMaxPages] = useState<number>(2000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onAnalyze(url.trim());
  };

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL (e.g., https://example.com)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {crawlerEnabled && (
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-gray-700">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={runCrawl}
                  onChange={(e) => setRunCrawl(e.target.checked)}
                  disabled={loading}
                />
                <span>Run crawl (optional)</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700"
                onClick={() => setShowAdvanced((s) => !s)}
                disabled={loading}
              >
                {showAdvanced ? 'Hide advanced' : 'Show advanced'}
              </button>
            </div>

            {showAdvanced && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-md p-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">Allow subdomains</label>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={allowSubdomains}
                    onChange={(e) => setAllowSubdomains(e.target.checked)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Deny query params</label>
                  <input
                    type="text"
                    value={denyParams}
                    onChange={(e) => setDenyParams(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Max concurrency</label>
                  <input
                    type="number"
                    value={concurrency}
                    min={1}
                    onChange={(e) => setConcurrency(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Per-host delay (ms)</label>
                  <input
                    type="number"
                    value={delayMs}
                    min={0}
                    onChange={(e) => setDelayMs(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Max pages (soft)</label>
                  <input
                    type="number"
                    value={maxPages}
                    min={10}
                    onChange={(e) => setMaxPages(Number(e.target.value) || 10)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={loading}
                  />
                </div>
                <div className="text-xs text-gray-500 md:col-span-2">
                  Note: These settings are for UI preview only. Crawling integration will submit these to the backend in a later step.
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default AnalysisForm;
