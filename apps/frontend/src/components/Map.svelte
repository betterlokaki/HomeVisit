<script lang="ts">
  /**
   * Map Component
   * 
   * Displays an interactive MapLibre GL map showing all sites as polygon overla
<style>
  .map {
    width: 100%;
    height: 100%;
    position: relative;
  }

  :global(.maplibregl-popup-content) {
    padding: 0.75rem !important;
    border-radius: 0.5rem !important;
  }

  :global(.maplibregl-popup-anchor-bottom .maplibregl-popup-tip) {
    border-top-color: white;
  }
</style>e color-coded by status and show popups on click.
   * Automatically highlights the selected site and fits bounds to all sites on load.
   * 
   * Props:
   * - sites: Array of EnrichedSite objects to display
   * - selectedSiteId: Currently selected site ID (null if none)
   */

  import { onMount } from "svelte";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import type { EnrichedSite } from "@homevisit/common/src";

  export let sites: EnrichedSite[] = [];
  export let selectedSiteId: number | null = null;

  let mapContainer: HTMLDivElement;
  let map: maplibregl.Map | null = null;
  let popups: Map<number, maplibregl.Popup> = new Map();

  onMount(() => {
    // Initialize map centered on first site or default
    const defaultLng = sites.length > 0 ? 0 : 0;
    const defaultLat = sites.length > 0 ? 0 : 0;

    map = new maplibregl.Map({
      container: mapContainer,
      style: "https://demotiles.maplibre.org/style.json", // Free demo tile style
      center: [defaultLng, defaultLat],
      zoom: 2,
    });

    map.on("load", () => {
      // Add source for site polygons
      map?.addSource("sites", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: sites.map((site) => ({
            type: "Feature",
            geometry: site.geometry,
            properties: {
              site_id: site.site_id,
              site_name: site.site_name,
              seen_status: site.seen_status,
            },
          })),
        },
      });

      // Add layer for site polygons
      map?.addLayer({
        id: "sites-layer",
        type: "fill",
        source: "sites",
        paint: {
          "fill-color": [
            "match",
            ["get", "seen_status"],
            "Seen",
            "#10b981",
            "Partial",
            "#f59e0b",
            "Not Seen",
            "#ef4444",
            "#9ca3af",
          ],
          "fill-opacity": 0.6,
        },
      });

      // Add outline layer
      map?.addLayer({
        id: "sites-outline",
        type: "line",
        source: "sites",
        paint: {
          "line-color": "#000000",
          "line-width": 2,
        },
      });

      // Click handler
      map?.on("click", "sites-layer", (e) => {
        const properties = e.features?.[0]?.properties;
        if (properties) {
          selectedSiteId = properties.site_id;

          // Show popup
          const coordinates = e.lngLat;
          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(
              `<div style="font-weight: 600; margin-bottom: 0.5rem;">${properties.site_name}</div>
               <div style="font-size: 0.875rem; color: #6b7280;">
                 <strong>Status:</strong> ${properties.seen_status}
               </div>`
            )
            .addTo(map!);
        }
      });

      // Change cursor on hover
      map?.on("mouseenter", "sites-layer", () => {
        if (map) map.getCanvas().style.cursor = "pointer";
      });
      map?.on("mouseleave", "sites-layer", () => {
        if (map) map.getCanvas().style.cursor = "";
      });

      if (sites.length > 0) {
        // Fit bounds to all sites
        const bounds = new maplibregl.LngLatBounds();
        sites.forEach((site) => {
          if (site.geometry.coordinates[0]) {
            site.geometry.coordinates[0].forEach(([lng, lat]) => {
              bounds.extend([lng, lat]);
            });
          }
        });
        map?.fitBounds(bounds, { padding: 50 });
      }
    });
  });
</script>

<div bind:this={mapContainer} class="map" />

<style>
  .map-disabled {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f3f4f6;
    color: #6b7280;
    font-size: 0.875rem;
    border: 2px dashed #d1d5db;
    border-radius: 0.5rem;
  }

  p {
    margin: 0.5rem 0;
  }
</style>
