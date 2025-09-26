
import requests
import extruct
import json
from w3lib.html import get_base_url
from structured_data_analyzer import StructuredDataAnalyzer

def analyze_structured_data(url):
    """
    Analyze structured data for a given URL using the comprehensive analyzer
    """
    analyzer = StructuredDataAnalyzer()
    
    print(f"🔍 Analyzing structured data for: {url}")
    print("=" * 60)
    
    # Get detailed metrics
    metrics = analyzer.analyze_url(url)
    
    # Generate and display report
    report = analyzer.generate_report(metrics, url)
    print(report)
    
    # Also show raw JSON-LD data for reference
    print("\n" + "=" * 60)
    print("📋 Raw JSON-LD Data:")
    print("=" * 60)
    
    try:
        html = requests.get(url).text
        base_url = get_base_url(html, url)
        data = extruct.extract(html, base_url=base_url)
        
        if data.get('json-ld'):
            for i, schema in enumerate(data['json-ld'], 1):
                print(f"\nSchema {i}:")
                print(json.dumps(schema, indent=2))
        else:
            print("No JSON-LD data found")
            
    except Exception as e:
        print(f"Error extracting raw data: {e}")

if __name__ == "__main__":
    # Test with your URL
    url = 'https://yogreet.com'
    analyze_structured_data(url)
    
    # You can also test with other URLs
    # analyze_structured_data('https://example.com')
