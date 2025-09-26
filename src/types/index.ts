// API Response Types
export interface AnalysisMetrics {
  total_schemas: number;
  valid_schemas: number;
  invalid_schemas: number;
  schema_types: string[];
  coverage_score: number;
  quality_score: number;
  completeness_score: number;
  seo_relevance_score: number;
}

export interface AnalysisExplanations {
  coverage_explanation: string;
  quality_explanation: string;
  completeness_explanation: string;
  seo_relevance_explanation: string;
}

export interface AnalysisResult {
  success: boolean;
  url: string;
  grade: string;
  grade_color: string;
  overall_score: number;
  metrics: AnalysisMetrics;
  explanations: AnalysisExplanations;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface AnalysisError {
  success: false;
  error: string;
}

// Component Props Types
export interface MetricCardProps {
  title: string;
  score: number;
  description: string;
  icon: React.ReactNode;
  explanation?: string;
}

// API Service Types
export interface ApiService {
  analyzeUrl: (url: string) => Promise<AnalysisResult>;
  healthCheck: () => Promise<{ status: string; service: string }>;
}
