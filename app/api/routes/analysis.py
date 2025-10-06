"""
Analysis API Routes
Main analysis endpoint for AEOCHECKER
"""

from flask import Blueprint, request, jsonify
import logging
from app.services.ai_presence import AIPresenceService
from app.services.competitor_analysis import CompetitorAnalysisService
from app.services.knowledge_base import KnowledgeBaseService
from app.services.answerability import AnswerabilityService
from app.services.crawler_accessibility import CrawlerAccessibilityService
from structured_data_analyzer import StructuredDataAnalyzer
from google_rich_results_validator import GoogleRichResultsValidator

# Configure logging
logger = logging.getLogger(__name__)

# Create blueprint
analysis_bp = Blueprint('analysis', __name__)

# Initialize services
ai_presence_service = AIPresenceService()
competitor_service = CompetitorAnalysisService()
knowledge_base_service = KnowledgeBaseService()
answerability_service = AnswerabilityService()
crawler_accessibility_service = CrawlerAccessibilityService()

# Initialize existing analyzers
structured_data_analyzer = StructuredDataAnalyzer()
google_validator = GoogleRichResultsValidator()

@analysis_bp.route('/analyze', methods=['POST'])
def analyze_structured_data():
    """
    Main analysis endpoint for AEOCHECKER
    Analyzes AI presence, competitor landscape, knowledge base, answerability, and crawler accessibility
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
            
        url = data.get('url')
        competitor_urls = data.get('competitor_urls', [])
        
        if not url:
            return jsonify({'success': False, 'error': 'URL is required'}), 400
        
        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        logger.info(f"Starting AEOCHECKER analysis for URL: {url}")
        
        # Get HTML content for analysis
        try:
            import requests
            html_response = requests.get(url, timeout=10)
            html_content = html_response.text
        except Exception as e:
            return jsonify({'success': False, 'error': f'Failed to fetch URL: {str(e)}'}), 400
        
        # Run all AEOCHECKER modules
        results = {}
        
        # 1. AI Presence Analysis
        logger.info("Running AI Presence analysis...")
        ai_presence = ai_presence_service.analyze_ai_presence(url)
        results['ai_presence'] = ai_presence
        
        # 2. Competitor Landscape Analysis
        if competitor_urls:
            logger.info("Running Competitor Landscape analysis...")
            competitor_analysis = competitor_service.analyze_competitor_landscape(url, competitor_urls)
            results['competitor_analysis'] = competitor_analysis
        else:
            results['competitor_analysis'] = {
                'score': 0,
                'message': 'No competitor URLs provided',
                'recommendations': ['Add competitor URLs for comparison']
            }
        
        # 3. Knowledge Base Analysis
        logger.info("Running Knowledge Base analysis...")
        knowledge_base = knowledge_base_service.analyze_knowledge_base(url, html_content)
        results['knowledge_base'] = knowledge_base
        
        # 4. Answerability Analysis
        logger.info("Running Answerability analysis...")
        answerability = answerability_service.analyze_answerability(url, html_content)
        results['answerability'] = answerability
        
        # 5. AI Crawler Accessibility Analysis
        logger.info("Running AI Crawler Accessibility analysis...")
        crawler_accessibility = crawler_accessibility_service.analyze_crawler_accessibility(url, html_content)
        results['crawler_accessibility'] = crawler_accessibility
        
        # 6. Existing Structured Data Analysis
        logger.info("Running Structured Data analysis...")
        structured_data_metrics = structured_data_analyzer.analyze_url(url)
        google_validation = google_validator.validate_url(url)
        
        # Calculate Strategy Review as composite of KB + Answerability + Crawler + Structured Data
        structured_data_avg = 0
        try:
            sd = {
                'coverage': float(getattr(structured_data_metrics, 'coverage_score', 0) or 0),
                'quality': float(getattr(structured_data_metrics, 'quality_score', 0) or 0),
                'completeness': float(getattr(structured_data_metrics, 'completeness_score', 0) or 0),
            }
            structured_data_avg = (sd['coverage'] + sd['quality'] + sd['completeness']) / 3.0
        except Exception:
            structured_data_avg = 0

        strategy_review_score = (
            float(knowledge_base.get('score', 0)) +
            float(answerability.get('score', 0)) +
            float(crawler_accessibility.get('score', 0)) +
            float(structured_data_avg)
        ) / 4.0

        # Calculate overall AEOCHECKER score from three main modules
        # 1) AI Presence, 2) Competitor Landscape, 3) Strategy Review
        three_main_scores = [
            float(ai_presence.get('score', 0)),
            float(results['competitor_analysis'].get('score', 0)),
            float(strategy_review_score)
        ]

        # Include zero scores (count all three modules equally)
        overall_score = sum(three_main_scores) / len(three_main_scores) if three_main_scores else 0
        
        # Determine grade
        if overall_score >= 90:
            grade = "A+"
            grade_color = "#10B981"  # Green
        elif overall_score >= 80:
            grade = "A"
            grade_color = "#10B981"  # Green
        elif overall_score >= 70:
            grade = "B"
            grade_color = "#F59E0B"  # Yellow
        elif overall_score >= 60:
            grade = "C"
            grade_color = "#F59E0B"  # Yellow
        elif overall_score >= 50:
            grade = "D"
            grade_color = "#EF4444"  # Red
        else:
            grade = "F"
            grade_color = "#EF4444"  # Red
        
        # Collect all recommendations
        all_recommendations = []
        for module_name, module_results in results.items():
            if isinstance(module_results, dict) and 'recommendations' in module_results:
                all_recommendations.extend(module_results['recommendations'])
        
        # Prepare comprehensive response
        response = {
            'success': True,
            'url': url,
            'grade': grade,
            'grade_color': grade_color,
            'overall_score': round(overall_score, 1),
            'module_scores': {
                'ai_presence': ai_presence.get('score', 0),
                'competitor_analysis': results['competitor_analysis'].get('score', 0),
                'knowledge_base': knowledge_base.get('score', 0),
                'answerability': answerability.get('score', 0),
                'crawler_accessibility': crawler_accessibility.get('score', 0)
            },
            'detailed_analysis': results,
            'structured_data': {
                'total_schemas': structured_data_metrics.total_schemas,
                'valid_schemas': structured_data_metrics.valid_schemas,
                'invalid_schemas': structured_data_metrics.invalid_schemas,
                'schema_types': structured_data_metrics.schema_types,
                'coverage_score': round(structured_data_metrics.coverage_score, 1),
                'quality_score': round(structured_data_metrics.quality_score, 1),
                'completeness_score': round(structured_data_metrics.completeness_score, 1),
                'seo_relevance_score': round(structured_data_metrics.seo_relevance_score, 1),
                'details': structured_data_metrics.details
            },
            'google_validation': {
                'eligible_for_rich_results': google_validation.eligible_for_rich_results,
                'rich_results_types': google_validation.rich_results_types,
                'google_score': google_validation.google_score,
                'errors': google_validation.errors,
                'warnings': google_validation.warnings,
                'recommendations': google_validation.recommendations
            },
            'all_recommendations': all_recommendations,
            'analysis_timestamp': str(logger.info("Analysis completed"))
        }
        
        logger.info(f"AEOCHECKER analysis completed for {url} with overall score: {overall_score}")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in AEOCHECKER analysis: {e}")
        return jsonify({
            'success': False,
            'error': f'AEOCHECKER analysis failed: {str(e)}'
        }), 500
