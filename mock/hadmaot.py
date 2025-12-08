"""
Basic API Skeleton
A simple Flask-based REST API with basic structure
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import random
from datetime import datetime, timedelta

# Initialize Flask app
app = Flask(__name__)

# Enable CORS
CORS(app)

# Configuration
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
app.config['PORT'] = int(os.getenv('PORT', 5002))

# Status constants
STATUS_VALUES = ["Full", "Partial", "No"]

# Cover update status constants
COVER_STATUS_VALUES = ["Full", "Partial", "No"]


def generate_cover_update_history(refresh_time_seconds: int) -> list[dict]:
    """
    Generate random cover update history from the start of current month until today.
    Each entry is at refresh_time intervals.
    """
    now = datetime.now()
    # Start of current month
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    history = []
    current_time = start_of_month
    
    while current_time <= now:
        history.append({
            "date": current_time.isoformat(),
            "status": random.choice(COVER_STATUS_VALUES)
        })
        current_time += timedelta(seconds=refresh_time_seconds)
    
    return history


def extract_site_names(request_body: dict) -> list[str]:
    """
    Extract site names (text_id) from the nested request structure.
    The request has dynamic keys, so we search for the object containing 'text_id'.
    """
    for key, value in request_body.items():
        if isinstance(value, dict) and 'text_id' in value:
            return value.get('text_id', [])
    return []


def generate_status_item(site_name: str) -> dict:
    """
    Generate a random status response item for a given site name.
    """
    return {
        "siteName": site_name,
        "status": random.choice(STATUS_VALUES),
        "projectLink": f"http://example.com/project/{site_name.replace(' ', '_')}"
    }


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
    },
    # ============================================================================
    # 5minutely Group Sites - Tokyo, Sydney, Singapore, Dubai, Mumbai, Hong Kong
    # ============================================================================
    {
        "classification": {
            "clearence_level": "UNCLASSIFIED",
            "publish_procedure": "STANDARD",
            "triangle": "A12"
        },
        "date": datetime.now().isoformat(),
        "exclusive_id": {
            "data_store_name": "ElasticDataStore01",
            "entity_id": "9",
            "layer_id": "layer_4451"
        },
        "geo": {
            "wkt": "POLYGON((139.55 35.55, 139.85 35.68, 140.05 35.62, 139.92 35.52, 139.70 35.48, 139.55 35.55))"
        },
        "Link": "https://example.com/api/resource/9",
        "properties_List": {
            "ImagingTechnique": "EO",
            "Sensor": "SAR-X",
            "Source": "SATELLITE",
            "Resolution": 0.37,
            "type": "metropolitan",
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
            "entity_id": "10",
            "layer_id": "layer_4451"
        },
        "geo": {
            "wkt": "POLYGON((150.95 -33.92, 151.15 -33.82, 151.28 -33.78, 151.32 -33.88, 151.22 -33.98, 150.95 -33.92))"
        },
        "Link": "https://example.com/api/resource/10",
        "properties_List": {
            "ImagingTechnique": "EO",
            "Sensor": "SAR-X",
            "Source": "SATELLITE",
            "Resolution": 0.37,
            "type": "harbor",
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
            "entity_id": "11",
            "layer_id": "layer_4451"
        },
        "geo": {
            "wkt": "POLYGON((103.68 1.18, 103.88 1.33, 104.02 1.28, 103.92 1.18, 103.78 1.13, 103.68 1.18))"
        },
        "Link": "https://example.com/api/resource/11",
        "properties_List": {
            "ImagingTechnique": "EO",
            "Sensor": "SAR-X",
            "Source": "SATELLITE",
            "Resolution": 0.37,
            "type": "island",
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
            "entity_id": "12",
            "layer_id": "layer_4451"
        },
        "geo": {
            "wkt": "POLYGON((55.05 24.98, 55.25 25.12, 55.38 25.17, 55.42 25.08, 55.32 24.98, 55.05 24.98))"
        },
        "Link": "https://example.com/api/resource/12",
        "properties_List": {
            "ImagingTechnique": "EO",
            "Sensor": "SAR-X",
            "Source": "SATELLITE",
            "Resolution": 0.37,
            "type": "desert",
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
            "entity_id": "13",
            "layer_id": "layer_4451"
        },
        "geo": {
            "wkt": "POLYGON((72.78 18.88, 72.92 18.98, 73.02 19.03, 72.97 18.93, 72.83 18.86, 72.78 18.88))"
        },
        "Link": "https://example.com/api/resource/13",
        "properties_List": {
            "ImagingTechnique": "EO",
            "Sensor": "SAR-X",
            "Source": "SATELLITE",
            "Resolution": 0.37,
            "type": "coastal",
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
            "entity_id": "14",
            "layer_id": "layer_4451"
        },
        "geo": {
            "wkt": "POLYGON((113.98 22.18, 114.12 22.28, 114.28 22.37, 114.32 22.28, 114.22 22.18, 113.98 22.18))"
        },
        "Link": "https://example.com/api/resource/14",
        "properties_List": {
            "ImagingTechnique": "EO",
            "Sensor": "SAR-X",
            "Source": "SATELLITE",
            "Resolution": 0.37,
            "type": "financial",
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
    return jsonify({"entities_list": MOCK_OVERLAYS}), 200


@app.route('/status', methods=['POST'])
def get_status():
    """
    Status endpoint that accepts site names and returns random status responses.
    Request format: { "dataKey": { "text": [...], "text_id": ["SiteA", "SiteB"] }, ... }
    Response format: { "statusResults": [{ "siteName": "...", "status": "...", "projectLink": "..." }] }
    """
    request_body = request.get_json() or {}
    site_names = extract_site_names(request_body)
    
    status_items = [generate_status_item(name) for name in site_names]
    
    return jsonify({"statusResults": status_items}), 200


@app.route('/cover_update', methods=['POST'])
def get_cover_update():
    """
    Cover update endpoint that accepts site geometry and refresh_time in nested format.
    Returns historical cover update statuses from start of month to today.
    Request format: 
    { 
        "geometryOuterKey": { "geometryInnerKey": ["WKT_STRING"] },
        "secondsOuterKey": { "secondsInnerKey": [refresh_time_int] }
    }
    Response format: { "randomKey": [{ "date": "...", "status": "..." }, ...] }
    """
    request_body = request.get_json() or {}
    
    # Extract geometry and refresh_time from nested dynamic keys
    # Keys are dynamic, so we parse by structure: first key with string array = geometry, first key with int array = seconds
    geometry = ''
    refresh_time = 86400  # Default 1 day in seconds
    
    for outer_key, inner_obj in request_body.items():
        if isinstance(inner_obj, dict):
            for inner_key, values in inner_obj.items():
                if isinstance(values, list) and len(values) > 0:
                    first_value = values[0]
                    if isinstance(first_value, str):
                        geometry = first_value
                    elif isinstance(first_value, (int, float)):
                        refresh_time = int(first_value)
    
    # Ensure refresh_time is reasonable (at least 1 hour, at most 1 week)
    refresh_time = max(3600, min(refresh_time, 604800))
    
    history = generate_cover_update_history(refresh_time)
    
    return jsonify({"randomKey": history}), 200


# ============================================================================
# SERVER STARTUP
# ============================================================================

if __name__ == '__main__':
    port = app.config['PORT']
    debug = app.config['DEBUG']
    print(f"🚀 Starting API server on port {port} (debug={debug})")
    app.run(host='0.0.0.0', port=port, debug=debug)

