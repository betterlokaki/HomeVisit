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
# All overlays intersect with database site polygons
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
            "wkt": "POLYGON((-74.2 40.55, -74.0 40.6, -73.95 40.65, -73.85 40.62, -74.1 40.5, -74.2 40.55))"
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
            "wkt": "POLYGON((26.0 26.0, 32.0 25.0, 34.0 28.0, 32.0 32.0, 28.0 31.0, 26.0 26.0))"
        },
        "Link": "https://example.com/api/resource/2",
        "properties_List": {
            "ImagingTechnique": "EO",
            "Sensor": "SAR-X",
            "Source": "SATELLITE",
            "Resolution": 0.37,
            "type": "urban",
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
            "entity_id": "3",
            "layer_id": "layer_4451"
        },
        "geo": {
            "wkt": "POLYGON((34.68 31.95, 34.8 32.02, 34.87 32.08, 34.95 32.05, 34.85 31.98, 34.68 31.95))"
        },
        "Link": "https://example.com/api/resource/3",
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
            "entity_id": "4",
            "layer_id": "layer_4451"
        },
        "geo": {
            "wkt": "POLYGON((35.18 31.72, 35.25 31.76, 35.29 31.82, 35.32 31.85, 35.20 31.78, 35.18 31.72))"
        },
        "Link": "https://example.com/api/resource/4",
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
            "entity_id": "5",
            "layer_id": "layer_4451"
        },
        "geo": {
            "wkt": "POLYGON((34.92 32.78, 35.02 32.83, 35.08 32.87, 35.05 32.82, 34.98 32.80, 34.92 32.78))"
        },
        "Link": "https://example.com/api/resource/5",
        "properties_List": {
            "ImagingTechnique": "EO",
            "Sensor": "SAR-X",
            "Source": "SATELLITE",
            "Resolution": 0.37,
            "type": "industrial",
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
            "entity_id": "6",
            "layer_id": "layer_4451"
        },
        "geo": {
            "wkt": "POLYGON((34.75 31.18, 34.85 31.23, 34.90 31.30, 34.88 31.26, 34.80 31.22, 34.75 31.18))"
        },
        "Link": "https://example.com/api/resource/6",
        "properties_List": {
            "ImagingTechnique": "EO",
            "Sensor": "SAR-X",
            "Source": "SATELLITE",
            "Resolution": 0.37,
            "type": "industrial",
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
            "entity_id": "7",
            "layer_id": "layer_4451"
        },
        "geo": {
            "wkt": "POLYGON((34.92 29.48, 35.02 29.53, 35.08 29.57, 35.05 29.52, 34.98 29.50, 34.92 29.48))"
        },
        "Link": "https://example.com/api/resource/7",
        "properties_List": {
            "ImagingTechnique": "EO",
            "Sensor": "SAR-X",
            "Source": "SATELLITE",
            "Resolution": 0.37,
            "type": "tourism",
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
            "entity_id": "8",
            "layer_id": "layer_4451"
        },
        "geo": {
            "wkt": "POLYGON((35.45 32.75, 35.60 32.82, 35.65 32.86, 35.62 32.82, 35.52 32.79, 35.45 32.75))"
        },
        "Link": "https://example.com/api/resource/8",
        "properties_List": {
            "ImagingTechnique": "EO",
            "Sensor": "SAR-X",
            "Source": "SATELLITE",
            "Resolution": 0.37,
            "type": "tourism",
            "density": "medium"
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

