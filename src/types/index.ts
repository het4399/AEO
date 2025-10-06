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

export interface AIPresence {
  score: number;
  explanation: string;
  checks: {
    [key: string]: string | number | boolean;
  };
  recommendations: string[];
}

export interface CompetitorAnalysis {
  score: number;
  target_analysis: {
    url: string;
    title: string;
    description: string;
    text_length: number;
    schema_count: number;
    schema_types: string[];
    text_sample: string;
  };
  competitor_analysis: Array<{
    url: string;
    title: string;
    description: string;
    text_length: number;
    schema_count: number;
    schema_types: string[];
    text_sample: string;
  }>;
  metrics: {
    schema_advantage: number;
    avg_competitor_schemas: number;
    unique_schema_types: string[];
    target_unique_schemas: string[];
    text_length_advantage: number;
  };
  recommendations: string[];
}

export interface KnowledgeBase {
  score: number;
  entities: {
    [key: string]: string[];
  };
  fact_density: number;
  clarity: {
    avg_sentence_length: number;
    clarity_score: number;
    sentence_count: number;
  };
  linkability: {
    linkability_score: number;
    linkable_terms_found: number;
  };
  format_usage: {
    headings: number;
    lists: number;
    bold: number;
    italic: number;
    code: number;
    links: number;
  };
  recommendations: string[];
}

export interface Answerability {
  score: number;
  question_headings: number;
  paragraph_analysis: {
    avg_length: number;
    short_paragraphs: number;
    long_paragraphs: number;
    total_paragraphs: number;
  };
  tone_analysis: {
    tone: string;
    confidence: number;
    positive_score: number;
    negative_score: number;
    neutral_score: number;
  };
  answer_structures: {
    bullet_lists: number;
    numbered_lists: number;
    short_answers: number;
    faq_sections: number;
    answer_indicators: number;
  };
  ai_crawler_points: {
    structured_data: number;
    meta_descriptions: number;
    heading_structure: number;
    internal_links: number;
    images_with_alt: number;
  };
  recommendations: string[];
}

export interface CrawlerAccessibility {
  score: number;
  robots_analysis: {
    robots_txt_present: boolean;
    ai_bot_access: {
      [key: string]: boolean;
    };
    sitemap_present: boolean;
  };
  headers_analysis: {
    content_type: string;
    content_length: string;
    last_modified: string;
    etag: string;
    cache_control: string;
    x_robots_tag: string;
    status_code: number;
  };
  content_structure: {
    structured_data_count: number;
    semantic_elements: {
      headings: number;
      paragraphs: number;
      lists: number;
      tables: number;
      images: number;
      links: number;
    };
    semantic_html5: {
      article: number;
      section: number;
      header: number;
      footer: number;
      nav: number;
      main: number;
    };
    accessibility_attrs: {
      alt_text: number;
      aria_labels: number;
      role_attributes: number;
      lang_attributes: number;
    };
  };
  accessibility_score: number;
  gpt_summary: string;
  recommendations: string[];
}

export interface GoogleValidation {
  eligible_for_rich_results: boolean;
  rich_results_types: string[];
  google_score: number;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface AnalysisResult {
  success: boolean;
  url: string;
  grade: string;
  grade_color: string;
  overall_score: number;
  metrics: AnalysisMetrics;
  explanations: AnalysisExplanations;
  ai_presence?: AIPresence;
  competitor_analysis?: CompetitorAnalysis;
  knowledge_base?: KnowledgeBase;
  answerability?: Answerability;
  crawler_accessibility?: CrawlerAccessibility;
  google_validation: GoogleValidation;
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
