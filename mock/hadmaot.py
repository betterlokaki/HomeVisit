"""
Basic API Skeleton
A simple Flask-based REST API with basic structure
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import os
from shapely import wkt
from shapely.geometry import shape

# Initialize Flask app
app = Flask(__name__)

# Enable CORS
CORS(app)

# Configuration
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
app.config['PORT'] = int(os.getenv('PORT', 5001))

# Mock overlay data with 5-point polygons (some intersecting with sites)
MOCK_OVERLAYS = [
    {
        "overlay_id": 1,
        "overlay_name": "NYC Downtown Overlay",
        "wkt": "POLYGON((-74.0 40.6, -73.95 40.65, -73.9 40.62, -73.92 40.55, -74.0 40.6))",  # Intersects with New York
        "properties": {"type": "commercial", "density": "high"}
    },
    {
        "overlay_id": 2,
        "overlay_name": "Tel Aviv Central",
        "wkt": "POLYGON((34.76 32.06, 34.78 32.08, 34.8 32.07, 34.79 32.05, 34.76 32.06))",  # Intersects with Tel Aviv
        "properties": {"type": "residential", "density": "medium"}
    },
    {
        "overlay_id": 3,
        "overlay_name": "Jerusalem Old City",
        "wkt": "POLYGON((35.22 31.78, 35.24 31.8, 35.26 31.79, 35.25 31.77, 35.22 31.78))",  # Intersects with Jerusalem
        "properties": {"type": "historical", "density": "high"}
    },
    {
        "overlay_id": 4,
        "overlay_name": "Haifa Port",
        "wkt": "POLYGON((34.97 32.82, 34.99 32.84, 35.01 32.83, 35.0 32.81, 34.97 32.82))",  # Intersects with Haifa
        "properties": {"type": "industrial", "density": "high"}
    },
    {
        "overlay_id": 5,
        "overlay_name": "Beer Sheva Industrial",
        "wkt": "POLYGON((34.8 31.23, 34.82 31.25, 34.84 31.24, 34.83 31.22, 34.8 31.23))",  # Intersects with Beer Sheva
        "properties": {"type": "industrial", "density": "medium"}
    },
    {
        "overlay_id": 6,
        "overlay_name": "Eilat Resort Zone",
        "wkt": "POLYGON((34.97 29.52, 34.99 29.54, 35.01 29.53, 35.0 29.51, 34.97 29.52))",  # Intersects with Eilat
        "properties": {"type": "tourism", "density": "medium"}
    },
    {
        "overlay_id": 7,
        "overlay_name": "Cairo District",
        "wkt": "POLYGON((31.2 30.0, 31.3 30.1, 31.25 30.2, 31.1 30.1, 31.2 30.0))",  # Does NOT intersect
        "properties": {"type": "urban", "density": "high"}
    },
    {
        "overlay_id": 8,
        "overlay_name": "Sinai Peninsula Zone",
        "wkt": "POLYGON((33.5 28.5, 33.8 28.7, 33.9 28.6, 33.7 28.4, 33.5 28.5))",  # Does NOT intersect
        "properties": {"type": "desert", "density": "low"}
    }
]




# ============================================================================
# ROUTES
# ============================================================================

@app.route('/health', methods=['POST'])
def answer_by_hapuch():
    """Health check endpoint with overlay data"""
    return jsonify({
    "classification": {
        "clearence_level": "UNCLASSIFIED",
        "publish_procedure": "STANDARD",
        "triangle": "A12"
    },
    "date": datetime(2025, 11, 25, 9, 47, 23),
    "exclusive_id": {
        "data_store_name": "ElasticDataStore01",
        "entity_id": "ef23d9ab-8c0d-41c1-a10f-77d9aa92eb41",
        "layer_id": "layer_4451"
    },
    "geo": {
        "wkt": wkt.loads("POINT (34.7818 32.0853)")
    },
    "Link": "https://example.com/api/resource/ef23d9ab",
    "properties_List": {
        "Azimuth": 134.5,
        "AlternateUrls": [
            "https://alt.example.com/img1",
            "https://cdn.example.com/archive/img1"
        ],
        "DiggerStatus": "READY",
        "RegistrationQuality": "GOOD",
        "ImagingTechnique": "ORTHO",
        "ERIS_LEG_ID": 9124,
        "GlobalId": "GLB-2025-0012294",
        "Url": "https://example.com/images/hires123.jpg",
        "PUBLISHPROCEDURE": 3,
        "TRIANGLEID": 410,
        "TRIANGLE_CL": 2,
        "Resolution": 0.37,
        "Sensor": "SAR-X",
        "Source": "SATELLITE",
        "SensorLocation": {
            "wkt": wkt.loads("POINT (35.2034 31.7717)")
        },
        "Leg": "LEG-22",
        "Sortie": "SORTIE-118",
        "approximateTransform": "matrix(1.002, 0.004, -0.003, 0.998, 12, 9)",
        "ImageHeight": 4096,
        "ImageWidth": 6144,
        "HasAlgorithmicRegistration": True
    },
    "overlays": MOCK_OVERLAYS
}
    ), 200



# ============================================================================
# SERVER STARTUP
# ============================================================================

if __name__ == '__main__':
    port = app.config['PORT']
    debug = app.config['DEBUG']
    print(f"🚀 Starting API server on port {port} (debug={debug})")
    app.run(host='0.0.0.0', port=port, debug=debug)

