from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from structured_data_analyzer import StructuredDataAnalyzer
from google_rich_results_validator import GoogleRichResultsValidator
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize validators
structured_data_analyzer = StructuredDataAnalyzer()
google_validator = GoogleRichResultsValidator()

@app.route('/api/analyze', methods=['POST'])
def analyze_structured_data():
    """
    API endpoint to analyze structured data for a given URL
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
            
        url = data.get('url')
        
        if not url:
            return jsonify({'success': False, 'error': 'URL is required'}), 400
        
        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        logger.info(f"Analyzing URL: {url}")
        
        # Get structured data metrics
        metrics = structured_data_analyzer.analyze_url(url)
        
        # Get Google Rich Results validation
        google_validation = google_validator.validate_url(url)
        
        # Calculate enhanced overall score with Google validation
        base_score = (metrics.coverage_score + metrics.quality_score + 
                     metrics.completeness_score + metrics.seo_relevance_score) / 4
        
        # Add Google validation bonus
        google_bonus = 0
        if google_validation.eligible_for_rich_results:
            google_bonus = 15  # 15 point bonus for Google Rich Results eligibility
        elif google_validation.google_score > 50:
            google_bonus = 10  # 10 point bonus for good Google score
        
        overall_score = min(100.0, base_score + google_bonus)
        
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
        
        # Prepare response
        response = {
            'success': True,
            'url': url,
            'grade': grade,
            'grade_color': grade_color,
            'overall_score': round(overall_score, 1),
            'metrics': {
                'total_schemas': metrics.total_schemas,
                'valid_schemas': metrics.valid_schemas,
                'invalid_schemas': metrics.invalid_schemas,
                'schema_types': metrics.schema_types,
                'coverage_score': round(metrics.coverage_score, 1),
                'quality_score': round(metrics.quality_score, 1),
                'completeness_score': round(metrics.completeness_score, 1),
                'seo_relevance_score': round(metrics.seo_relevance_score, 1)
            },
            'explanations': {
                'coverage_explanation': metrics.coverage_explanation,
                'quality_explanation': metrics.quality_explanation,
                'completeness_explanation': metrics.completeness_explanation,
                'seo_relevance_explanation': metrics.seo_relevance_explanation
            },
            'google_validation': {
                'eligible_for_rich_results': google_validation.eligible_for_rich_results,
                'rich_results_types': google_validation.rich_results_types,
                'google_score': google_validation.google_score,
                'errors': google_validation.errors,
                'warnings': google_validation.warnings,
                'recommendations': google_validation.recommendations
            },
            'errors': metrics.errors,
            'warnings': metrics.warnings,
            'recommendations': metrics.recommendations
        }
        
        logger.info(f"Analysis completed for {url} with grade {grade}")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error analyzing URL: {e}")
        return jsonify({
            'success': False,
            'error': f'Analysis failed: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'AEO Structured Data Analyzer'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
