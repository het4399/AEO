import React from 'react';
import { XCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-800">Analysis Failed</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
