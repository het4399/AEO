from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from structured_data_analyzer import StructuredDataAnalyzer
from google_rich_results_validator import GoogleRichResultsValidator
import logging
import os
import requests
from dotenv import load_dotenv
import extruct
from urllib.parse import urljoin, urlparse
import re

# Load environment variables from .env if present
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize validators
structured_data_analyzer = StructuredDataAnalyzer()
google_validator = GoogleRichResultsValidator()

# -----------------
# AI Presence Audit
# -----------------

AI_BOT_AGENTS = [
    ('GPTBot', re.compile(r'(?i)gptbot')),
    ('Google-Extended', re.compile(r'(?i)google-extended')),
    ('ClaudeBot', re.compile(r'(?i)claudebot|anthropic-ai')),
    ('PerplexityBot', re.compile(r'(?i)perplexitybot')),
    ('CCBot', re.compile(r'(?i)ccbot')),
    ('bingbot', re.compile(r'(?i)bingbot')),
]

def _fetch_text(url: str, timeout: int = 8) -> str:
    try:
        resp = requests.get(url, timeout=timeout)
        resp.raise_for_status()
        return resp.text or ''
    except Exception:
        return ''

def _parse_robots_rules(robots_txt: str) -> dict:
    # Very simple allow/disallow heuristic per agent
    checks = {}
    lines = [l.strip() for l in robots_txt.splitlines()]
    # Build blocks per user-agent
    blocks = []
    current_agents = []
    current_rules = []
    for line in lines:
        if not line or line.startswith('#'):
            continue
        if line.lower().startswith('user-agent:'):
            # flush previous
            if current_agents or current_rules:
                blocks.append((current_agents, current_rules))
            current_agents = [line.split(':', 1)[1].strip()]
            current_rules = []
        else:
            current_rules.append(line)
    if current_agents or current_rules:
        blocks.append((current_agents, current_rules))

    def is_allowed_for(agent_name: str) -> bool:
        # default allow unless explicit Disallow: /
        agent_allow = True
        for agents, rules in blocks:
            # Match wildcard or exact agent
            if any(a == '*' or a.lower() == agent_name.lower() for a in agents):
                for r in rules:
                    lower = r.lower()
                    if lower.startswith('disallow:'):
                        path = lower.split(':', 1)[1].strip()
                        if path == '/':
                            agent_allow = False
                    if lower.startswith('allow:'):
                        # seeing any allow keeps it allowed
                        pass
        return agent_allow

    for label, pattern in AI_BOT_AGENTS:
        checks[f'robots_{label.lower()}'] = is_allowed_for(label)

    # Sitemap
    has_sitemap = any(l.lower().startswith('sitemap:') for l in lines)
    checks['sitemap_present'] = has_sitemap
    return checks

def _extract_org_and_meta(html: str, jsonld: list) -> dict:
    checks = {
        'org_schema_present': False,
        'org_logo_present': False,
        'sameas_wikidata_or_wikipedia': False,
        'sameas_major_profiles_count': 0,
        'open_graph_present': False,
        'twitter_card_present': False,
    }
    # JSON-LD Organization
    same_as_links = []
    logo_ok = False
    if isinstance(jsonld, list):
        for obj in jsonld:
            if not isinstance(obj, dict):
                continue
            t = obj.get('@type')
            if isinstance(t, list):
                is_org = 'Organization' in t
            else:
                is_org = t == 'Organization'
            if is_org:
                checks['org_schema_present'] = True
                same = obj.get('sameAs')
                if isinstance(same, list):
                    same_as_links.extend([str(x) for x in same if isinstance(x, (str,))])
                elif isinstance(same, str):
                    same_as_links.append(same)
                logo_val = obj.get('logo')
                if isinstance(logo_val, str) and logo_val.startswith(('http://', 'https://')):
                    logo_ok = True
                elif isinstance(logo_val, dict):
                    url_val = logo_val.get('url')
                    if isinstance(url_val, str) and url_val.startswith(('http://', 'https://')):
                        logo_ok = True
    checks['org_logo_present'] = logo_ok

    # sameAs evaluation
    major_domains = ['linkedin.com', 'twitter.com', 'x.com', 'youtube.com', 'crunchbase.com', 'github.com', 'facebook.com']
    major_count = 0
    for link in same_as_links:
        try:
            host = urlparse(link).hostname or ''
        except Exception:
            host = ''
        if any(d in host for d in major_domains):
            major_count += 1
        if 'wikidata.org' in host or 'wikipedia.org' in host:
            checks['sameas_wikidata_or_wikipedia'] = True
    checks['sameas_major_profiles_count'] = major_count

    # Simple meta detection for OG/Twitter
    lower_html = html.lower()
    checks['open_graph_present'] = ('property="og:' in lower_html) or ("property='og:" in lower_html) or ('name="og:' in lower_html)
    checks['twitter_card_present'] = ('name="twitter:' in lower_html) or ("name='twitter:" in lower_html)
    return checks

def _run_ai_presence_audit(url: str) -> dict:
    try:
        # robots.txt
        robots_url = urljoin(url, '/robots.txt')
        robots_txt = _fetch_text(robots_url)
        robots_checks = _parse_robots_rules(robots_txt) if robots_txt else {f'robots_{k[0].lower()}': True for k in AI_BOT_AGENTS}
        if robots_txt and 'sitemap_present' not in robots_checks:
            robots_checks['sitemap_present'] = any(l.lower().startswith('sitemap:') for l in robots_txt.splitlines())

        # homepage html and json-ld
        html = _fetch_text(url, timeout=10)
        jsonld = []
        try:
            if html:
                jsonld = extruct.extract(html, base_url=url).get('json-ld') or []
        except Exception:
            jsonld = []
        content_checks = _extract_org_and_meta(html or '', jsonld)

        # Scoring
        score = 0
        # 30 pts robots + sitemap
        robot_points = 0
        for label, _ in AI_BOT_AGENTS:
            if robots_checks.get(f'robots_{label.lower()}', True):
                robot_points += 4  # up to ~24
        if robots_checks.get('sitemap_present', False):
            robot_points += 6
        score += min(30, robot_points)

        # 40 pts organization schema + sameAs + logo
        org_points = 0
        if content_checks.get('org_schema_present'):
            org_points += 10
        if content_checks.get('org_logo_present'):
            org_points += 10
        if content_checks.get('sameas_wikidata_or_wikipedia'):
            org_points += 20
        else:
            org_points += 0
        # secondary profiles
        org_points += min(10, max(0, (content_checks.get('sameas_major_profiles_count', 0) - 1) * 5))
        score += min(40, org_points)

        # 15 pts OG/Twitter
        if content_checks.get('open_graph_present'):
            score += 8
        if content_checks.get('twitter_card_present'):
            score += 7

        # 15 pts content schemas already measured by analyzer: simple proxy using metrics present in client
        # We do not have direct metrics object here, so approximate from presence of common schemas in jsonld
        content_schemas = set()
        for obj in jsonld:
            t = obj.get('@type') if isinstance(obj, dict) else None
            if isinstance(t, list):
                content_schemas.update(t)
            elif isinstance(t, str):
                content_schemas.add(t)
        if any(s in content_schemas for s in ('Product', 'FAQPage', 'Article', 'BlogPosting')):
            score += 15

        score = max(0, min(100, score))

        # Explanation and recommendations
        recs = []
        if not robots_checks.get('sitemap_present'):
            recs.append('Add Sitemap line to robots.txt')
        for label, _ in AI_BOT_AGENTS:
            key = f'robots_{label.lower()}'
            if not robots_checks.get(key, True):
                recs.append(f'Allow {label} in robots.txt')
        if not content_checks.get('org_schema_present'):
            recs.append('Add Organization schema on the homepage')
        if not content_checks.get('org_logo_present'):
            recs.append('Provide a valid logo URL in Organization.logo')
        if not content_checks.get('sameas_wikidata_or_wikipedia'):
            recs.append('Add Wikidata or Wikipedia link in Organization.sameAs')
        if content_checks.get('sameas_major_profiles_count', 0) < 2:
            recs.append('Add LinkedIn/Twitter/YouTube/Crunchbase/GitHub links in Organization.sameAs')
        if not content_checks.get('open_graph_present'):
            recs.append('Add Open Graph meta tags')
        if not content_checks.get('twitter_card_present'):
            recs.append('Add Twitter Card meta tags')

        explanation_bits = []
        explanation_bits.append('Robots allow major AI bots' if all(robots_checks.get(f'robots_{label.lower()}', True) for label, _ in AI_BOT_AGENTS) else 'Some AI bots are blocked in robots.txt')
        explanation_bits.append('Sitemap present' if robots_checks.get('sitemap_present') else 'Sitemap missing in robots.txt')
        explanation_bits.append('Organization schema detected' if content_checks.get('org_schema_present') else 'Organization schema missing')
        explanation_bits.append('Wikidata/Wikipedia present in sameAs' if content_checks.get('sameas_wikidata_or_wikipedia') else 'Wikidata/Wikipedia missing in sameAs')
        explanation_bits.append('OG/Twitter tags present' if (content_checks.get('open_graph_present') and content_checks.get('twitter_card_present')) else 'OG/Twitter tags incomplete')

        return {
            'score': score,
            'explanation': '; '.join(explanation_bits),
            'checks': {**robots_checks, **content_checks},
            'recommendations': recs
        }
    except Exception as e:
        return {
            'score': 0,
            'explanation': f'AI Presence audit failed: {str(e)}',
            'checks': {},
            'recommendations': ['Retry later']
        }

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
        
        # Blend Google score into SEO relevance (no separate bonus)
        blended_seo_relevance = (0.7 * metrics.seo_relevance_score) + (0.3 * google_validation.google_score)
        base_score = (
            metrics.coverage_score +
            metrics.quality_score +
            metrics.completeness_score +
            blended_seo_relevance
        ) / 4
        overall_score = min(100.0, base_score)
        
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
        
        # AI Presence audit (no external LLM APIs required)
        ai_presence = _run_ai_presence_audit(url)

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
                'seo_relevance_score': round(blended_seo_relevance, 1)
            },
            'explanations': {
                'coverage_explanation': metrics.coverage_explanation,
                'quality_explanation': metrics.quality_explanation,
                'completeness_explanation': metrics.completeness_explanation,
                'seo_relevance_explanation': metrics.seo_relevance_explanation
            },
            'ai_presence': ai_presence,
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

@app.route('/api/serp', methods=['POST'])
def serp_lookup():
    """Proxy to SerpAPI. Expects JSON with at least { "q": "keyword" }. Optional: engine, gl, hl, location, device, num, start."""
    try:
        payload = request.get_json() or {}
        q = payload.get('q')
        if not q:
            return jsonify({'success': False, 'error': 'Missing required field: q (keyword)'}), 400
        api_key = os.environ.get('SERPAPI_API_KEY')
        if not api_key:
            return jsonify({'success': False, 'error': 'SERPAPI_API_KEY not set in environment'}), 500
        
        # Allowed params passthrough
        allowed = ['engine', 'q', 'gl', 'hl', 'location', 'device', 'num', 'start', 'uule', 'safe']
        params = {k: v for k, v in payload.items() if k in allowed and v not in (None, '')}
        if 'engine' not in params:
            params['engine'] = 'google'
        params['api_key'] = api_key
        
        resp = requests.get('https://serpapi.com/search.json', params=params, timeout=30)
        resp.raise_for_status()
        raw = resp.json()
        
        # Light summary
        results = raw.get('organic_results') or []
        your_domain = payload.get('domain')
        your_rank = None
        if your_domain and results:
            for r in results:
                url = r.get('link') or r.get('url')
                if isinstance(url, str) and your_domain in url:
                    your_rank = r.get('position')
                    break
        features = []
        for key in ['answer_box', 'knowledge_graph', 'related_questions', 'top_stories', 'local_results']:
            if key in raw and raw.get(key):
                features.append(key)
        
        return jsonify({
            'success': True,
            'query': q,
            'params': {k: v for k, v in params.items() if k != 'api_key'},
            'summary': {
                'top_count': len(results),
                'your_domain': your_domain,
                'your_rank': your_rank,
                'features_detected': features
            },
            'results': results,
            'raw': raw
        })
    except requests.HTTPError as he:
        return jsonify({'success': False, 'error': f'HTTP error from SerpAPI: {he}', 'body': getattr(he, 'response', None).text if hasattr(he, 'response') and he.response is not None else None}), 502
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'AEO Structured Data Analyzer'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
