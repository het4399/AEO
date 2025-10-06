"""
AI Crawler Accessibility Service
Analyzes robots.txt, accessibility, and content structure for AI crawlers
"""

import requests
import re
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Tuple
import extruct

class CrawlerAccessibilityService:
    """Service for analyzing AI crawler accessibility and content structure"""
    
    def __init__(self):
        self.ai_bot_agents = [
            'GPTBot',
            'Google-Extended', 
            'ClaudeBot',
            'PerplexityBot',
            'CCBot',
            'bingbot'
        ]
    
    def _fetch_text(self, url: str, timeout: int = 10) -> str:
        """Fetch text content from URL"""
        try:
            resp = requests.get(url, timeout=timeout)
            resp.raise_for_status()
            return resp.text or ''
        except Exception:
            return ''
    
    def _check_robots_txt(self, url: str) -> Dict:
        """Check robots.txt for AI bot accessibility"""
        try:
            robots_url = urljoin(url, '/robots.txt')
            robots_txt = self._fetch_text(robots_url)
            
            if not robots_txt:
                return {
                    'robots_txt_present': False,
                    'ai_bot_access': {agent: True for agent in self.ai_bot_agents},
                    'sitemap_present': False
                }
            
            # Parse robots.txt
            lines = [l.strip() for l in robots_txt.splitlines()]
            blocks = []
            current_agents = []
            current_rules = []
            
            for line in lines:
                if not line or line.startswith('#'):
                    continue
                if line.lower().startswith('user-agent:'):
                    if current_agents or current_rules:
                        blocks.append((current_agents, current_rules))
                    current_agents = [line.split(':', 1)[1].strip()]
                    current_rules = []
                else:
                    current_rules.append(line)
            
            if current_agents or current_rules:
                blocks.append((current_agents, current_rules))
            
            # Check AI bot access
            ai_bot_access = {}
            for agent in self.ai_bot_agents:
                agent_allowed = True
                for agents, rules in blocks:
                    if any(a == '*' or a.lower() == agent.lower() for a in agents):
                        for rule in rules:
                            if rule.lower().startswith('disallow:'):
                                path = rule.lower().split(':', 1)[1].strip()
                                if path == '/':
                                    agent_allowed = False
                ai_bot_access[agent] = agent_allowed
            
            # Check for sitemap
            sitemap_present = any(l.lower().startswith('sitemap:') for l in lines)
            
            return {
                'robots_txt_present': True,
                'ai_bot_access': ai_bot_access,
                'sitemap_present': sitemap_present
            }
            
        except Exception as e:
            return {
                'robots_txt_present': False,
                'ai_bot_access': {agent: True for agent in self.ai_bot_agents},
                'sitemap_present': False,
                'error': str(e)
            }
    
    def _check_http_headers(self, url: str) -> Dict:
        """Check HTTP headers for AI bot accessibility"""
        try:
            resp = requests.head(url, timeout=10)
            headers = resp.headers
            
            return {
                'content_type': headers.get('content-type', ''),
                'content_length': headers.get('content-length', ''),
                'last_modified': headers.get('last-modified', ''),
                'etag': headers.get('etag', ''),
                'cache_control': headers.get('cache-control', ''),
                'x_robots_tag': headers.get('x-robots-tag', ''),
                'status_code': resp.status_code
            }
        except Exception as e:
            return {
                'error': str(e),
                'status_code': 0
            }
    
    def _assess_content_structure(self, html_content: str) -> Dict:
        """Assess content structure for AI understanding"""
        try:
            # Extract structured data
            jsonld = []
            try:
                jsonld = extruct.extract(html_content, base_url='').get('json-ld') or []
            except Exception:
                pass
            
            # Count semantic elements
            semantic_elements = {
                'headings': len(re.findall(r'<h[1-6][^>]*>', html_content, re.IGNORECASE)),
                'paragraphs': len(re.findall(r'<p[^>]*>', html_content, re.IGNORECASE)),
                'lists': len(re.findall(r'<[uo]l[^>]*>', html_content, re.IGNORECASE)),
                'tables': len(re.findall(r'<table[^>]*>', html_content, re.IGNORECASE)),
                'images': len(re.findall(r'<img[^>]*>', html_content, re.IGNORECASE)),
                'links': len(re.findall(r'<a[^>]*href[^>]*>', html_content, re.IGNORECASE))
            }
            
            # Check for semantic HTML5 elements
            semantic_html5 = {
                'article': len(re.findall(r'<article[^>]*>', html_content, re.IGNORECASE)),
                'section': len(re.findall(r'<section[^>]*>', html_content, re.IGNORECASE)),
                'header': len(re.findall(r'<header[^>]*>', html_content, re.IGNORECASE)),
                'footer': len(re.findall(r'<footer[^>]*>', html_content, re.IGNORECASE)),
                'nav': len(re.findall(r'<nav[^>]*>', html_content, re.IGNORECASE)),
                'main': len(re.findall(r'<main[^>]*>', html_content, re.IGNORECASE))
            }
            
            # Check for accessibility attributes
            accessibility_attrs = {
                'alt_text': len(re.findall(r'<img[^>]*alt=["\'][^"\']*["\'][^>]*>', html_content, re.IGNORECASE)),
                'aria_labels': len(re.findall(r'aria-label=["\'][^"\']*["\']', html_content, re.IGNORECASE)),
                'role_attributes': len(re.findall(r'role=["\'][^"\']*["\']', html_content, re.IGNORECASE)),
                'lang_attributes': len(re.findall(r'lang=["\'][^"\']*["\']', html_content, re.IGNORECASE))
            }
            
            return {
                'structured_data_count': len(jsonld),
                'semantic_elements': semantic_elements,
                'semantic_html5': semantic_html5,
                'accessibility_attrs': accessibility_attrs
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'structured_data_count': 0,
                'semantic_elements': {},
                'semantic_html5': {},
                'accessibility_attrs': {}
            }
    
    def _calculate_accessibility_score(self, content_structure: Dict) -> int:
        """Calculate accessibility score based on content structure"""
        score = 0
        
        # Structured data (0-25 points)
        score += min(25, content_structure.get('structured_data_count', 0) * 5)
        
        # Semantic elements (0-25 points)
        semantic_elements = content_structure.get('semantic_elements', {})
        semantic_score = sum(semantic_elements.values())
        score += min(25, semantic_score * 2)
        
        # HTML5 semantic elements (0-25 points)
        semantic_html5 = content_structure.get('semantic_html5', {})
        html5_score = sum(semantic_html5.values())
        score += min(25, html5_score * 4)
        
        # Accessibility attributes (0-25 points)
        accessibility_attrs = content_structure.get('accessibility_attrs', {})
        accessibility_score = sum(accessibility_attrs.values())
        score += min(25, accessibility_score * 3)
        
        return min(100, score)
    
    def _generate_gpt_summary(self, text_content: str) -> str:
        """Generate a simple summary for GPT understanding assessment"""
        # Simple extractive summary (first few sentences)
        sentences = re.split(r'[.!?]+', text_content)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) <= 3:
            return text_content
        
        # Take first 3 sentences as summary
        summary = '. '.join(sentences[:3]) + '.'
        return summary
    
    def analyze_crawler_accessibility(self, url: str, html_content: str) -> Dict:
        """Analyze AI crawler accessibility and content structure"""
        try:
            # Check robots.txt
            robots_analysis = self._check_robots_txt(url)
            
            # Check HTTP headers
            headers_analysis = self._check_http_headers(url)
            
            # Assess content structure
            content_structure = self._assess_content_structure(html_content)
            
            # Calculate accessibility score
            accessibility_score = self._calculate_accessibility_score(content_structure)
            
            # Generate GPT summary
            text_content = re.sub(r'<[^>]+>', ' ', html_content)
            text_content = re.sub(r'\s+', ' ', text_content).strip()
            gpt_summary = self._generate_gpt_summary(text_content)
            
            # Calculate overall score
            score = 0
            
            # Robots.txt analysis (0-30 points)
            if robots_analysis.get('robots_txt_present'):
                score += 10
            if robots_analysis.get('sitemap_present'):
                score += 10
            
            ai_bot_access = robots_analysis.get('ai_bot_access', {})
            allowed_bots = sum(1 for allowed in ai_bot_access.values() if allowed)
            score += min(10, (allowed_bots / len(self.ai_bot_agents)) * 10)
            
            # Content structure (0-40 points)
            score += min(40, accessibility_score * 0.4)
            
            # HTTP headers (0-15 points)
            if headers_analysis.get('status_code') == 200:
                score += 5
            if headers_analysis.get('content_type', '').startswith('text/html'):
                score += 5
            if headers_analysis.get('x_robots_tag'):
                score += 5
            
            # GPT understanding (0-15 points)
            if len(gpt_summary) > 100:
                score += 15
            elif len(gpt_summary) > 50:
                score += 10
            else:
                score += 5
            
            # Generate recommendations
            recommendations = []
            if not robots_analysis.get('robots_txt_present'):
                recommendations.append('Add robots.txt file to control AI bot access')
            if not robots_analysis.get('sitemap_present'):
                recommendations.append('Add sitemap reference to robots.txt')
            if accessibility_score < 50:
                recommendations.append('Improve content structure with semantic HTML elements')
            if content_structure.get('structured_data_count', 0) < 1:
                recommendations.append('Add structured data markup for better AI understanding')
            if len(gpt_summary) < 100:
                recommendations.append('Add more descriptive content for better AI understanding')
            
            return {
                'score': min(100, score),
                'robots_analysis': robots_analysis,
                'headers_analysis': headers_analysis,
                'content_structure': content_structure,
                'accessibility_score': accessibility_score,
                'gpt_summary': gpt_summary,
                'recommendations': recommendations
            }
            
        except Exception as e:
            return {
                'score': 0,
                'error': f'Crawler accessibility analysis failed: {str(e)}',
                'robots_analysis': {},
                'headers_analysis': {},
                'content_structure': {},
                'accessibility_score': 0,
                'gpt_summary': '',
                'recommendations': ['Retry analysis']
            }
