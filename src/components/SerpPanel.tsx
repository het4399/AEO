import React, { useState } from 'react';
import apiService from '../services/api';

interface SerpPanelProps {
  defaultKeyword?: string;
  defaultDomainFromUrl?: string;
}

const SerpPanel: React.FC<SerpPanelProps> = ({ defaultKeyword = '', defaultDomainFromUrl = '' }) => {
  const [keyword, setKeyword] = useState<string>(defaultKeyword);
  const [location, setLocation] = useState<string>('');
  const [device, setDevice] = useState<string>('desktop');
  const [domain, setDomain] = useState<string>(defaultDomainFromUrl);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [data, setData] = useState<any>(null);

  const onSearch = async () => {
    setError('');
    setData(null);
    if (!keyword.trim()) {
      setError('Please enter a keyword');
      return;
    }
    setLoading(true);
    try {
      const resp = await apiService.serpLookup({ q: keyword.trim(), location: location.trim() || undefined, device, domain: domain.trim() || undefined, num: 10 });
      setData(resp);
    } catch (e: any) {
      setError(e.message || 'SERP lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const top = data?.results || [];
  const yourRank = data?.summary?.your_rank;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-100 mb-4">SERP Snapshot</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input
          className="border border-gray-600 bg-gray-700 text-gray-100 rounded px-3 py-2 text-sm placeholder-gray-400"
          placeholder="Keyword (e.g., seo services)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <input
          className="border border-gray-600 bg-gray-700 text-gray-100 rounded px-3 py-2 text-sm placeholder-gray-400"
          placeholder="Location (optional, e.g., New York, NY)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <select className="border border-gray-600 bg-gray-700 text-gray-100 rounded px-3 py-2 text-sm" value={device} onChange={(e) => setDevice(e.target.value)}>
          <option value="desktop">Desktop</option>
          <option value="mobile">Mobile</option>
        </select>
        <input
          className="border border-gray-600 bg-gray-700 text-gray-100 rounded px-3 py-2 text-sm placeholder-gray-400"
          placeholder="Your domain (optional)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
      </div>

      <button
        onClick={onSearch}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? 'Searching…' : 'Search SERP'}
      </button>

      {error && <div className="mt-3 text-sm text-red-400">{error}</div>}

      {data && (
        <div className="mt-5">
          <div className="text-sm text-gray-300 mb-2">
            <span className="font-semibold">Keyword:</span> {data.query}
            {data.summary?.your_domain && (
              <>
                {' '}| <span className="font-semibold">Your domain:</span> {data.summary.your_domain}
              </>
            )}
            {typeof yourRank === 'number' && (
              <>
                {' '}| <span className="font-semibold">Your rank:</span> {yourRank}
              </>
            )}
            {data.summary?.features_detected?.length > 0 && (
              <>
                {' '}| <span className="font-semibold">Features:</span> {data.summary.features_detected.join(', ')}
              </>
            )}
          </div>

          {top.length > 0 ? (
            <ol className="space-y-2 list-decimal list-inside">
              {top.slice(0, 10).map((r: any, idx: number) => (
                <li key={idx} className="text-sm">
                  <a href={r.link || r.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">
                    {r.title || r.link || r.url}
                  </a>
                  {r.snippet && <div className="text-gray-400">{r.snippet}</div>}
                  {r.position != null && (
                    <div className="text-gray-500">Position: {r.position}</div>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <div className="text-sm text-gray-400">No results found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SerpPanel;
