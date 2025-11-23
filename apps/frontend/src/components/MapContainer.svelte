<script lang="ts">
  import { onMount } from "svelte";
  import maplibregl from "maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";
  import type { VisitCard } from "../stores/visitStore";
  import { visitStore } from "../stores/visitStore";
  import { MAP_CONFIG } from "../config/mapConfig";
  import {
    wktToGeoJSON,
    getPolygonColor,
    getConvexHullBounds,
  } from "../utils/mapUtils";

  export let selectedSiteId: number | null = null;

  let mapContainer: HTMLDivElement;
  let map: maplibregl.Map | null = null;
  let cards: VisitCard[] = [];
  let mapLoaded = false;

  onMount(() => {
    // Initialize map
    if (!mapContainer) return;

    map = new maplibregl.Map({
      container: mapContainer,
      style: MAP_CONFIG.styleUrl,
      center: MAP_CONFIG.defaultCenter as [number, number],
      zoom: MAP_CONFIG.defaultZoom,
    });

    map.on("load", () => {
      mapLoaded = true;
      console.log("Map loaded. Cards available:", cards.length);
      if (cards.length > 0) {
        updateMapLayers(cards);
        fitToAllSites();
      }
    });

    map.on("error", (e) => {
      console.error("Map error:", e);
    });

    // Subscribe to visit store to get cards
    const unsubscribe = visitStore.subscribe((state) => {
      cards = state.cards;
      console.log("Cards updated:", cards.length, cards);
      if (map && mapLoaded) {
        console.log("Updating map layers with", cards.length, "cards");
        updateMapLayers(cards);
        if (cards.length > 0) {
          fitToAllSites();
        }
      }
    });

    return () => {
      unsubscribe();
      map?.remove();
    };
  });

  /**
   * Update map layers with current cards
   */
  function updateMapLayers(cardsToRender: VisitCard[]) {
    if (!map) return;

    console.log("updateMapLayers called with", cardsToRender.length, "cards");

    // Clear existing layers and sources
    try {
      // Get all layers and remove site-related ones
      const allLayers = map!.getStyle().layers || [];
      for (const layer of allLayers) {
        if (layer.id.startsWith("site-")) {
          console.log("Removing layer:", layer.id);
          map!.removeLayer(layer.id);
        }
      }

      // Get all sources and remove site-related ones
      const allSources = map!.getStyle().sources || {};
      for (const sourceId of Object.keys(allSources)) {
        if (sourceId.startsWith("site-source-")) {
          console.log("Removing source:", sourceId);
          map!.removeSource(sourceId);
        }
      }
    } catch (e) {
      console.warn("Error clearing existing layers:", e);
    }

    // Add new layers
    cardsToRender.forEach((card) => {
      try {
        console.log("Adding layer for site:", card.site_id, card.geometry);

        // Parse WKT geometry string
        const geoJSON = wktToGeoJSON(card.geometry, {
          site_id: card.site_id,
          site_name: card.site_name,
        });

        const layerId = `site-${card.site_id}`;
        const sourceId = `site-source-${card.site_id}`;
        const colors = getPolygonColor(card.updatedStatus);

        console.log("Colors for", card.site_id, ":", colors);
        console.log("GeoJSON:", geoJSON);

        // Add source
        map!.addSource(sourceId, {
          type: "geojson",
          data: geoJSON as any,
        });

        // Add fill layer
        map!.addLayer({
          id: `${layerId}-fill`,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": colors.fill,
            "fill-opacity": colors.fillOpacity,
          },
        });

        // Add stroke layer (on top of fill)
        map!.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": colors.stroke,
            "line-width": 3,
          },
        });

        // Add click handler to BOTH fill and stroke layers
        const clickHandler = () => {
          console.log("Clicked on site:", card.site_id);
          flyToSite(card);
          // Also dispatch event for card selection
          selectedSiteId = card.site_id;
        };

        map!.on("click", layerId, clickHandler);
        map!.on("click", `${layerId}-fill`, clickHandler);

        // Change cursor on hover - for both layers
        const enterHandler = () => {
          if (map) map.getCanvas().style.cursor = "pointer";
        };
        const leaveHandler = () => {
          if (map) map.getCanvas().style.cursor = "";
        };

        map!.on("mouseenter", layerId, enterHandler);
        map!.on("mouseleave", layerId, leaveHandler);
        map!.on("mouseenter", `${layerId}-fill`, enterHandler);
        map!.on("mouseleave", `${layerId}-fill`, leaveHandler);
      } catch (error) {
        console.error(
          `Failed to render polygon for site ${card.site_id}:`,
          error
        );
      }
    });
  }

  /**
   * Fly to a specific site with animation
   */
  function flyToSite(card: VisitCard) {
    if (!map) return;

    try {
      // Geometry is always WKT string from backend
      const geoJSON = wktToGeoJSON(card.geometry);
      const coords = geoJSON.geometry.coordinates[0] as Array<[number, number]>;

      // Calculate bounds of this polygon
      let minLng = coords[0][0];
      let maxLng = coords[0][0];
      let minLat = coords[0][1];
      let maxLat = coords[0][1];

      for (const [lng, lat] of coords) {
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      }

      // Fit map to show the entire polygon with padding
      const padding = 50; // padding in pixels
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {
          padding: padding,
          duration: MAP_CONFIG.flyDuration,
          maxZoom: 16,
        }
      );
    } catch (error) {
      console.error("Failed to fly to site:", error);
    }
  }

  /**
   * Fit map to all sites (ConvexHull bounds)
   */
  function fitToAllSites() {
    if (!map || cards.length === 0) return;

    const bounds = getConvexHullBounds(cards);
    if (!bounds) return;

    const [minLng, minLat, maxLng, maxLat] = bounds;

    // Add padding
    const padding = 0.05;
    const paddingLng = (maxLng - minLng) * padding;
    const paddingLat = (maxLat - minLat) * padding;

    map.fitBounds(
      [
        [minLng - paddingLng, minLat - paddingLat],
        [maxLng + paddingLng, maxLat + paddingLat],
      ],
      { duration: 1000 }
    );
  }

  // Watch for selected site changes from card clicks
  $: if (selectedSiteId !== null && map) {
    const selectedCard = cards.find((c) => c.site_id === selectedSiteId);
    if (selectedCard) {
      flyToSite(selectedCard);
    }
  }
</script>

<!-- Map Container -->
<div
  class="bg-gray-900 flex flex-col h-full items-end overflow-hidden relative rounded-lg shrink-0 w-full"
  style="min-height: 600px; position: relative;"
>
  <!-- MapLibre GL Container -->
  <div
    bind:this={mapContainer}
    class="w-full h-full rounded-lg"
    style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;"
  />
</div>

<style>
  :global(.maplibregl-canvas) {
    position: absolute;
    top: 0;
    left: 0;
  }

  :global(.maplibregl-ctrl-bottom-left) {
    display: none;
  }

  :global(.maplibregl-ctrl-bottom-right) {
    display: none;
  }

  :global(.maplibregl-ctrl-top-left) {
    display: none;
  }

  :global(.maplibregl-ctrl-top-right) {
    display: none;
  }
</style>
