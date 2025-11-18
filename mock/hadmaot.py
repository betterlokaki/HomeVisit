"""
Basic API Skeleton
A simple Flask-based REST API with basic structure
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)

# Enable CORS
CORS(app)

# Configuration
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
app.config['PORT'] = int(os.getenv('PORT', 5001))

# Mock overlay data transformed to match answer_by_hapuch schema
MOCK_OVERLAYS = [
    {
        "classification": {
            "clearence_level": "UNCLASSIFIED",
            "publish_procedure": "STANDARD",
            "triangle": "A12"
        },
        "date": datetime.now().isoformat(),
        "exclusive_id": {
            "data_store_name": "ElasticDataStore01",
            "entity_id": "1",
            "layer_id": "layer_4451"
        },
        "geo": {
            "wkt": "POLYGON((-74.0 40.6, -73.95 40.65, -73.9 40.62, -73.92 40.55, -74.05 40.58, -74.0 40.6))"
        },
        "Link": "https://example.com/api/resource/1",
        "properties_List": {
            "ImagingTechnique": "EO",
            "Sensor": "SAR-X",
            "Source": "SATELLITE",
            "Resolution": 0.37,
            "type": "commercial",
            "density": "high"
        }
    },
    {
        "classification": {
            "clearence_level": "UNCLASSIFIED",
            "publish_procedure": "STANDARD",
            "triangle": "A12"
        },
        "date": datetime.now().isoformat(),
        "exclusive_id": {
            "data_store_name": "ElasticDataStore01",
            "entity_id": "2",
            "layer_id": "layer_4451"
        },
        "geo": {
            "wkt": "POLYGON((34.76 32.06, 34.78 32.08, 34.8 32.07, 34.79 32.05, 34.77 32.04, 34.76 32.06))"
        },
        "Link": "https://example.com/api/resource/2",
        "properties_List": {
            "ImagingTechnique": "EO",
            "Sensor": "SAR-X",
            "Source": "SATELLITE",
            "Resolution": 0.37,
            "type": "residential",
            "density": "medium"
        }
    },
    {
        "classification": {
            "clearence_level": "UNCLASSIFIED",
            "publish_procedure": "STANDARD",
            "triangle": "A12"
        },
        "date": datetime.now().isoformat(),
        "exclusive_id": {
            "data_store_name": "ElasticDataStore01",
            "entity_id": "3",
            "layer_id": "layer_4451"
        },
        "geo": {
            "wkt": "POLYGON((35.22 31.78, 35.24 31.8, 35.26 31.79, 35.25 31.77, 35.23 31.76, 35.22 31.78))"
        },
        "Link": "https://example.com/api/resource/3",
        "properties_List": {
            "ImagingTechnique": "EO",
            "Sensor": "SAR-X",
            "Source": "SATELLITE",
            "Resolution": 0.37,
            "type": "historical",
            "density": "high"
        }
    },
    {
        "classification": {
            "clearence_level": "UNCLASSIFIED",
            "publish_procedure": "STANDARD",
            "triangle": "A12"
        },
        "date": datetime.now().isoformat(),
        "exclusive_id": {
            "data_store_name": "ElasticDataStore01",
            "entity_id": "4",
            "layer_id": "layer_4451"
        },
        "geo": {
            "wkt": "POLYGON((34.97 32.82, 34.99 32.84, 35.01 32.83, 35.0 32.81, 34.98 32.80, 34.97 32.82))"
        },
        "Link": "https://example.com/api/resource/4",
        "properties_List": {
            "ImagingTechnique": "EO",
            "Sensor": "SAR-X",
            "Source": "SATELLITE",
            "Resolution": 0.37,
            "type": "industrial",
            "density": "high"
        }
    }
]




# ============================================================================
# ROUTES
# ============================================================================

@app.route('/health', methods=['POST'])
def answer_by_hapuch():
    """Health check endpoint with overlay data"""
    return jsonify(MOCK_OVERLAYS), 200



# ============================================================================
# SERVER STARTUP
# ============================================================================

if __name__ == '__main__':
    port = app.config['PORT']
    debug = app.config['DEBUG']
    print(f"🚀 Starting API server on port {port} (debug={debug})")
    app.run(host='0.0.0.0', port=port, debug=debug)

