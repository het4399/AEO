# AEO Structured Data Analyzer

A comprehensive TypeScript React application for analyzing website structured data and providing actionable insights for Answer Engine Optimization (AEO).

## Features

- 🔍 **Comprehensive Analysis**: Analyzes JSON-LD, Microdata, and RDFa formats
- 📊 **Detailed Metrics**: Coverage, Quality, Completeness, and SEO Relevance scores
- 🎯 **Grade System**: A+ to F grading with color-coded results
- 📋 **Actionable Recommendations**: Specific suggestions for improvement
- 🚨 **Error Detection**: Identifies validation errors and warnings
- 📱 **Responsive Design**: Modern UI with Tailwind CSS

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API calls

### Backend
- **Flask** with Python
- **extruct** for structured data extraction
- **CORS** enabled for frontend communication

## Project Structure

```
AEO/
├── src/
│   ├── components/          # React components
│   │   ├── AnalysisForm.tsx
│   │   ├── ErrorDisplay.tsx
│   │   ├── MetricCard.tsx
│   │   └── ResultsDisplay.tsx
│   ├── services/           # API services
│   │   └── api.ts
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx             # Main app component
│   ├── index.tsx           # App entry point
│   └── index.css           # Global styles
├── backend_api.py          # Flask API server
├── structured_data_analyzer.py  # Core analysis logic
├── requirements.txt        # Python dependencies
├── package.json           # Node.js dependencies
├── tsconfig.json          # TypeScript configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## Installation & Setup

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the Flask API server:**
   ```bash
   python backend_api.py
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Start the React development server:**
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`

## Usage

1. Open the web application in your browser
2. Enter a website URL in the input field
3. Click "Analyze" to get structured data analysis
4. Review the grade, metrics, and recommendations
5. Use the insights to improve your website's structured data

## API Endpoints

### `POST /api/analyze`
Analyzes structured data for a given URL.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com",
  "grade": "A",
  "grade_color": "#10B981",
  "overall_score": 85.5,
  "metrics": {
    "total_schemas": 5,
    "valid_schemas": 4,
    "invalid_schemas": 1,
    "schema_types": ["Organization", "WebSite", "WebPage"],
    "coverage_score": 80.0,
    "quality_score": 90.0,
    "completeness_score": 75.0,
    "seo_relevance_score": 85.0
  },
  "errors": [],
  "warnings": [],
  "recommendations": [
    "Add more detailed properties to existing schemas",
    "Consider adding nested objects for richer data"
  ]
}
```

### `GET /api/health`
Health check endpoint.

## Metrics Explained

- **Coverage Score**: How well the page covers important schema types
- **Quality Score**: Percentage of valid vs invalid schemas
- **Completeness Score**: Data richness and nested structures
- **SEO Relevance Score**: SEO-critical schema presence

## Development

### TypeScript Configuration
The project uses strict TypeScript configuration with:
- Strict type checking
- React JSX support
- Modern ES6+ features

### Styling
- Tailwind CSS for utility-first styling
- Responsive design with mobile-first approach
- Custom components with consistent design system

### API Integration
- Type-safe API calls with Axios
- Error handling and loading states
- Environment-based configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
