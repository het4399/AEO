#!/usr/bin/env python3
"""
Test script to verify the backend API is working correctly
"""

import requests
import json
import sys

def test_api():
    """Test the backend API endpoints"""
    base_url = "http://localhost:5000/api"
    
    print("🧪 Testing AEO Structured Data Analyzer API")
    print("=" * 50)
    
    # Test health endpoint
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {e}")
        print("💡 Make sure the backend is running: python backend_api.py")
        return False
    
    # Test analyze endpoint
    print("\n2. Testing analyze endpoint...")
    test_url = "https://yogreet.com"
    
    try:
        payload = {"url": test_url}
        response = requests.post(
            f"{base_url}/analyze",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Analysis successful for {test_url}")
                print(f"   Grade: {data.get('grade')} ({data.get('overall_score')}/100)")
                print(f"   Schemas found: {data.get('metrics', {}).get('total_schemas', 0)}")
                return True
            else:
                print(f"❌ Analysis failed: {data.get('error')}")
                return False
        else:
            print(f"❌ Analysis request failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Analysis request failed: {e}")
        return False

if __name__ == "__main__":
    success = test_api()
    if success:
        print("\n🎉 All tests passed! The API is working correctly.")
        sys.exit(0)
    else:
        print("\n💥 Tests failed! Check the backend server.")
        sys.exit(1)
