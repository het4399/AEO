import requests
import extruct
import json
import re
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from urllib.parse import urljoin, urlparse
from w3lib.html import get_base_url
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class StructuredDataMetrics:
    """Data class to hold structured data metrics"""
    total_schemas: int
    valid_schemas: int
    invalid_schemas: int
    schema_types: List[str]
    coverage_score: float
    quality_score: float
    completeness_score: float
    seo_relevance_score: float
    errors: List[str]
    warnings: List[str]
    recommendations: List[str]
    coverage_explanation: str
    quality_explanation: str
    completeness_explanation: str
    seo_relevance_explanation: str

class StructuredDataAnalyzer:
    """
    Comprehensive structured data analyzer for AEO tools
    Analyzes JSON-LD, Microdata, RDFa, and other structured data formats
    """
    
    def __init__(self):
        self.supported_formats = ['json-ld', 'microdata', 'rdfa']
        self.important_schemas = [
            'Organization', 'WebSite', 'WebPage', 'Article', 'BlogPosting',
            'Product', 'Review', 'FAQPage', 'HowTo', 'Recipe', 'Event',
            'LocalBusiness', 'Person', 'BreadcrumbList', 'VideoObject'
        ]
        self.seo_critical_schemas = [
            'Organization', 'WebSite', 'WebPage', 'Article', 'BreadPage'
        ]
    
    def analyze_url(self, url: str) -> StructuredDataMetrics:
        """
        Analyze structured data for a given URL
        
        Args:
            url: The URL to analyze
            
        Returns:
            StructuredDataMetrics object with analysis results
        """
        try:
            # Fetch and parse the webpage
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            html = response.text
            base_url = get_base_url(html, url)
            
            # Extract structured data
            extracted_data = extruct.extract(html, base_url=base_url)
            
            return self._analyze_extracted_data(extracted_data, url)
            
        except requests.RequestException as e:
            logger.error(f"Error fetching URL {url}: {e}")
            return self._create_error_metrics([f"Failed to fetch URL: {e}"])
        except Exception as e:
            logger.error(f"Error analyzing URL {url}: {e}")
            return self._create_error_metrics([f"Analysis error: {e}"])
    
    def _analyze_extracted_data(self, data: Dict, url: str) -> StructuredDataMetrics:
        """Analyze extracted structured data"""
        errors = []
        warnings = []
        recommendations = []
        
        # Count total schemas
        total_schemas = 0
        valid_schemas = 0
        invalid_schemas = 0
        schema_types = []
        
        # Analyze each format
        for format_type in self.supported_formats:
            if format_type in data and data[format_type]:
                schemas = data[format_type]
                total_schemas += len(schemas)
                
                for schema in schemas:
                    schema_type = self._get_schema_type(schema)
                    if schema_type:
                        schema_types.append(schema_type)
                    
                    # Validate schema
                    is_valid, schema_errors = self._validate_schema(schema, format_type)
                    if is_valid:
                        valid_schemas += 1
                    else:
                        invalid_schemas += 1
                        errors.extend(schema_errors)
        
        # Calculate scores
        coverage_score = self._calculate_coverage_score(schema_types)
        quality_score = self._calculate_quality_score(valid_schemas, total_schemas)
        completeness_score = self._calculate_completeness_score(data)
        seo_relevance_score = self._calculate_seo_relevance_score(schema_types)
        
        # Generate explanations
        coverage_explanation = self._get_coverage_explanation(schema_types, coverage_score)
        quality_explanation = self._get_quality_explanation(valid_schemas, total_schemas, quality_score)
        completeness_explanation = self._get_completeness_explanation(data, completeness_score)
        seo_relevance_explanation = self._get_seo_relevance_explanation(schema_types, seo_relevance_score)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            schema_types, coverage_score, quality_score, completeness_score
        )
        
        return StructuredDataMetrics(
            total_schemas=total_schemas,
            valid_schemas=valid_schemas,
            invalid_schemas=invalid_schemas,
            schema_types=schema_types,
            coverage_score=coverage_score,
            quality_score=quality_score,
            completeness_score=completeness_score,
            seo_relevance_score=seo_relevance_score,
            errors=errors,
            warnings=warnings,
            recommendations=recommendations,
            coverage_explanation=coverage_explanation,
            quality_explanation=quality_explanation,
            completeness_explanation=completeness_explanation,
            seo_relevance_explanation=seo_relevance_explanation
        )
    
    def _get_schema_type(self, schema: Dict) -> Optional[str]:
        """Extract schema type from structured data"""
        if '@type' in schema:
            return schema['@type']
        elif 'itemType' in schema:
            return schema['itemType']
        return None
    
    def _validate_schema(self, schema: Dict, format_type: str) -> Tuple[bool, List[str]]:
        """Validate a single schema and return validation results"""
        errors = []
        
        # Basic validation
        if not schema:
            errors.append("Empty schema")
            return False, errors
        
        # Format-specific validation
        if format_type == 'json-ld':
            if '@type' not in schema:
                errors.append("JSON-LD schema missing @type")
            if '@context' not in schema:
                errors.append("JSON-LD schema missing @context")
        
        elif format_type == 'microdata':
            if 'itemType' not in schema:
                errors.append("Microdata schema missing itemType")
        
        # Check for required properties based on schema type
        schema_type = self._get_schema_type(schema)
        if schema_type:
            required_props = self._get_required_properties(schema_type)
            missing_props = [prop for prop in required_props if prop not in schema]
            if missing_props:
                errors.append(f"Missing required properties for {schema_type}: {', '.join(missing_props)}")
        
        return len(errors) == 0, errors
    
    def _get_required_properties(self, schema_type: str) -> List[str]:
        """Get required properties for a schema type"""
        required_props = {
            'Organization': ['name'],
            'WebSite': ['name', 'url'],
            'WebPage': ['name', 'url'],
            'Article': ['headline', 'author', 'datePublished'],
            'Product': ['name', 'description'],
            'Person': ['name'],
            'LocalBusiness': ['name', 'address'],
            'Event': ['name', 'startDate'],
            'FAQPage': ['mainEntity'],
            'HowTo': ['name', 'step'],
            'Recipe': ['name', 'ingredients', 'instructions']
        }
        return required_props.get(schema_type, [])
    
    def _calculate_coverage_score(self, schema_types: List[str]) -> float:
        """Calculate how well the page covers important schema types"""
        if not schema_types:
            return 0.0
        
        unique_types = set(schema_types)
        important_found = sum(1 for schema in unique_types if schema in self.important_schemas)
        
        # Base score from important schemas found
        base_score = (important_found / len(self.important_schemas)) * 60
        
        # Bonus for SEO-critical schemas
        seo_critical_found = sum(1 for schema in unique_types if schema in self.seo_critical_schemas)
        seo_bonus = (seo_critical_found / len(self.seo_critical_schemas)) * 40
        
        return min(100.0, base_score + seo_bonus)
    
    def _get_coverage_explanation(self, schema_types: List[str], score: float) -> str:
        """Get detailed explanation for coverage score"""
        if not schema_types:
            return "No structured data found. Add any schema types to start improving your coverage score."
        
        unique_types = set(schema_types)
        missing_important = [schema for schema in self.important_schemas if schema not in unique_types]
        missing_seo_critical = [schema for schema in self.seo_critical_schemas if schema not in unique_types]
        
        explanation = f"Found {len(unique_types)} schema type(s): {', '.join(unique_types)}. "
        
        if missing_seo_critical:
            explanation += f"Missing SEO-critical schemas: {', '.join(missing_seo_critical)}. "
        
        if missing_important:
            explanation += f"Missing important schemas: {', '.join(missing_important[:5])}. "
            if len(missing_important) > 5:
                explanation += f"and {len(missing_important) - 5} more. "
        
        if score < 30:
            explanation += "Add Organization and WebSite schemas to significantly improve your score."
        elif score < 60:
            explanation += "Add more content-specific schemas like Article, Product, or LocalBusiness."
        elif score < 80:
            explanation += "Consider adding specialized schemas like FAQPage, HowTo, or Review."
        
        return explanation
    
    def _calculate_quality_score(self, valid_schemas: int, total_schemas: int) -> float:
        """Calculate quality score based on valid vs total schemas"""
        if total_schemas == 0:
            return 0.0
        return (valid_schemas / total_schemas) * 100
    
    def _get_quality_explanation(self, valid_schemas: int, total_schemas: int, score: float) -> str:
        """Get detailed explanation for quality score"""
        if total_schemas == 0:
            return "No schemas found to validate."
        
        invalid_count = total_schemas - valid_schemas
        
        if score == 100:
            return f"Excellent! All {valid_schemas} schema(s) are valid and properly formatted."
        elif score >= 80:
            return f"Good quality. {valid_schemas}/{total_schemas} schemas are valid. {invalid_count} schema(s) have validation errors."
        elif score >= 60:
            return f"Moderate quality. {valid_schemas}/{total_schemas} schemas are valid. {invalid_count} schema(s) need fixing."
        else:
            return f"Poor quality. Only {valid_schemas}/{total_schemas} schemas are valid. {invalid_count} schema(s) have serious validation errors that need immediate attention."
    
    def _calculate_completeness_score(self, data: Dict) -> float:
        """Calculate completeness score based on data richness"""
        score = 0.0
        max_score = 100.0
        
        # Check for different formats
        formats_present = sum(1 for fmt in self.supported_formats if fmt in data and data[fmt])
        score += (formats_present / len(self.supported_formats)) * 30
        
        # Check for rich content
        if 'json-ld' in data and data['json-ld']:
            json_ld_schemas = data['json-ld']
            rich_content_score = 0
            for schema in json_ld_schemas:
                if len(schema) > 5:  # Rich schema with many properties
                    rich_content_score += 10
            score += min(40, rich_content_score)
        
        # Check for nested structures
        if 'json-ld' in data and data['json-ld']:
            for schema in data['json-ld']:
                if self._has_nested_objects(schema):
                    score += 15
        
        return min(max_score, score)
    
    def _get_completeness_explanation(self, data: Dict, score: float) -> str:
        """Get detailed explanation for completeness score"""
        formats_present = sum(1 for fmt in self.supported_formats if fmt in data and data[fmt])
        total_schemas = sum(len(data.get(fmt, [])) for fmt in self.supported_formats)
        
        if score == 0:
            return "No structured data found. Add any schema to start improving completeness."
        
        explanation = f"Found {total_schemas} schema(s) in {formats_present} format(s). "
        
        if score < 30:
            explanation += "Schemas are very basic. Add more properties like descriptions, images, dates, and contact information."
        elif score < 60:
            explanation += "Schemas need more detail. Add nested objects, rich content, and comprehensive property sets."
        elif score < 80:
            explanation += "Good detail level. Consider adding more specialized properties and nested structures."
        else:
            explanation += "Excellent completeness with rich, detailed structured data."
        
        return explanation
    
    def _has_nested_objects(self, obj: Dict) -> bool:
        """Check if object has nested structured data objects"""
        for value in obj.values():
            if isinstance(value, dict) and ('@type' in value or 'itemType' in value):
                return True
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict) and ('@type' in item or 'itemType' in item):
                        return True
        return False
    
    def _calculate_seo_relevance_score(self, schema_types: List[str]) -> float:
        """Calculate SEO relevance score"""
        if not schema_types:
            return 0.0
        
        seo_weight = {
            'Organization': 25,
            'WebSite': 20,
            'WebPage': 15,
            'Article': 20,
            'BlogPosting': 15,
            'Product': 15,
            'Review': 10,
            'FAQPage': 15,
            'HowTo': 10,
            'Recipe': 10,
            'Event': 10,
            'LocalBusiness': 15,
            'Person': 10,
            'BreadcrumbList': 10,
            'VideoObject': 10
        }
        
        unique_types = set(schema_types)
        total_score = sum(seo_weight.get(schema, 5) for schema in unique_types)
        return min(100.0, total_score)
    
    def _get_seo_relevance_explanation(self, schema_types: List[str], score: float) -> str:
        """Get detailed explanation for SEO relevance score"""
        if not schema_types:
            return "No structured data found. Add SEO-critical schemas like Organization and WebSite to improve search rankings."
        
        unique_types = set(schema_types)
        seo_critical_found = [schema for schema in unique_types if schema in self.seo_critical_schemas]
        high_value_found = [schema for schema in unique_types if schema in ['Article', 'Product', 'Review', 'FAQPage', 'LocalBusiness']]
        
        explanation = f"Found {len(unique_types)} schema type(s). "
        
        if seo_critical_found:
            explanation += f"SEO-critical schemas present: {', '.join(seo_critical_found)}. "
        else:
            explanation += "Missing SEO-critical schemas (Organization, WebSite, WebPage). "
        
        if high_value_found:
            explanation += f"High-value schemas found: {', '.join(high_value_found)}. "
        
        if score < 30:
            explanation += "Add Organization schema (25 points) and WebSite schema (20 points) for immediate improvement."
        elif score < 60:
            explanation += "Add Article, Product, or LocalBusiness schemas to boost SEO relevance."
        elif score < 80:
            explanation += "Consider adding Review, FAQPage, or HowTo schemas for specialized content."
        else:
            explanation += "Excellent SEO relevance with comprehensive schema coverage."
        
        return explanation
    
    def _generate_recommendations(self, schema_types: List[str], coverage_score: float, 
                                quality_score: float, completeness_score: float) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        # Coverage recommendations
        if coverage_score < 60:
            recommendations.append("Add more important schema types like Organization, WebSite, and WebPage")
        
        missing_important = [schema for schema in self.seo_critical_schemas if schema not in schema_types]
        if missing_important:
            recommendations.append(f"Consider adding these SEO-critical schemas: {', '.join(missing_important)}")
        
        # Quality recommendations
        if quality_score < 80:
            recommendations.append("Fix validation errors in existing structured data")
            recommendations.append("Ensure all schemas have required properties")
        
        # Completeness recommendations
        if completeness_score < 70:
            recommendations.append("Add more detailed properties to existing schemas")
            recommendations.append("Consider adding nested objects for richer data")
        
        # Specific recommendations based on content type
        if 'Article' in schema_types or 'BlogPosting' in schema_types:
            recommendations.append("Ensure article schemas include author, datePublished, and dateModified")
        
        if 'Product' in schema_types:
            recommendations.append("Add price, availability, and review data to product schemas")
        
        if 'LocalBusiness' in schema_types:
            recommendations.append("Include complete address, phone, and business hours in LocalBusiness schema")
        
        return recommendations
    
    def _create_error_metrics(self, errors: List[str]) -> StructuredDataMetrics:
        """Create metrics object for error cases"""
        return StructuredDataMetrics(
            total_schemas=0,
            valid_schemas=0,
            invalid_schemas=0,
            schema_types=[],
            coverage_score=0.0,
            quality_score=0.0,
            completeness_score=0.0,
            seo_relevance_score=0.0,
            errors=errors,
            warnings=[],
            recommendations=["Fix the errors above to enable structured data analysis"],
            coverage_explanation="Unable to analyze coverage due to errors.",
            quality_explanation="Unable to analyze quality due to errors.",
            completeness_explanation="Unable to analyze completeness due to errors.",
            seo_relevance_explanation="Unable to analyze SEO relevance due to errors."
        )
    
    def generate_report(self, metrics: StructuredDataMetrics, url: str) -> str:
        """Generate a detailed report of structured data analysis"""
        report = f"""
# Structured Data Analysis Report
**URL:** {url}
**Analysis Date:** {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Summary
- **Total Schemas Found:** {metrics.total_schemas}
- **Valid Schemas:** {metrics.valid_schemas}
- **Invalid Schemas:** {metrics.invalid_schemas}
- **Schema Types:** {', '.join(metrics.schema_types) if metrics.schema_types else 'None'}

## Scores
- **Coverage Score:** {metrics.coverage_score:.1f}/100
- **Quality Score:** {metrics.quality_score:.1f}/100
- **Completeness Score:** {metrics.completeness_score:.1f}/100
- **SEO Relevance Score:** {metrics.seo_relevance_score:.1f}/100

## Overall Grade
"""
        
        # Calculate overall grade
        overall_score = (metrics.coverage_score + metrics.quality_score + 
                        metrics.completeness_score + metrics.seo_relevance_score) / 4
        
        if overall_score >= 90:
            grade = "A+"
        elif overall_score >= 80:
            grade = "A"
        elif overall_score >= 70:
            grade = "B"
        elif overall_score >= 60:
            grade = "C"
        elif overall_score >= 50:
            grade = "D"
        else:
            grade = "F"
        
        report += f"**Overall Grade: {grade} ({overall_score:.1f}/100)**\n\n"
        
        # Add errors if any
        if metrics.errors:
            report += "## Errors\n"
            for error in metrics.errors:
                report += f"- {error}\n"
            report += "\n"
        
        # Add warnings if any
        if metrics.warnings:
            report += "## Warnings\n"
            for warning in metrics.warnings:
                report += f"- {warning}\n"
            report += "\n"
        
        # Add recommendations
        if metrics.recommendations:
            report += "## Recommendations\n"
            for i, rec in enumerate(metrics.recommendations, 1):
                report += f"{i}. {rec}\n"
        
        return report

# Example usage and testing
if __name__ == "__main__":
    analyzer = StructuredDataAnalyzer()
    
    # Test with a sample URL
    test_url = "https://yogreet.com"
    print(f"Analyzing structured data for: {test_url}")
    
    metrics = analyzer.analyze_url(test_url)
    report = analyzer.generate_report(metrics, test_url)
    print(report)
