<script lang="ts">
  import { onMount } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';

  interface Site {
    id: string;
    name: string;
    geometry: {
      type: string;
      coordinates: number[];
    };
    status: 'online' | 'offline' | 'maintenance';
    last_seen: string;
    last_data: string;
  }

  export let sites: Site[] = [];
  export let selectedSiteId: string | null = null;

  let mapContainer: HTMLDivElement;
  let map: maplibregl.Map | null = null;
  let markers: Map<string, maplibregl.Marker> = new Map();

  onMount(() => {
    // Initialize map centered on first site or default
    const defaultLng = sites.length > 0 ? sites[0].geometry.coordinates[0] : 0;
    const defaultLat = sites.length > 0 ? sites[0].geometry.coordinates[1] : 0;

    map = new maplibregl.Map({
      container: mapContainer,
      style: 'https://demotiles.maplibre.org/style.json', // Free demo tile style
      center: [defaultLng, defaultLat],
      zoom: 3
    });

    // Add markers for all sites
    sites.forEach((site) => {
      addMarker(site);
    });

    map.on('load', () => {
      if (sites.length > 0) {
        // Fit bounds to all sites
        const bounds = new maplibregl.LngLatBounds();
        sites.forEach((site) => {
          bounds.extend([site.geometry.coordinates[0], site.geometry.coordinates[1]]);
        });
        map?.fitBounds(bounds, { padding: 50 });
      }
    });
  });

  const addMarker = (site: Site) => {
    if (!map) return;

    const statusColor = {
      online: '#10b981',
      offline: '#ef4444',
      maintenance: '#f59e0b'
    }[site.status];

    // Create marker element
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundColor = statusColor;
    el.style.width = '12px';
    el.style.height = '12px';
    el.style.borderRadius = '50%';
    el.style.border = '3px solid white';
    el.style.cursor = 'pointer';
    el.style.boxShadow = `0 0 0 2px ${statusColor}`;

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([site.geometry.coordinates[0], site.geometry.coordinates[1]])
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setHTML(
          `<div style="font-weight: 600; margin-bottom: 0.5rem;">${site.name}</div>
           <div style="font-size: 0.875rem; color: #6b7280;">
             <strong>Status:</strong> ${site.status}<br>
             <strong>ID:</strong> ${site.id}
           </div>`
        )
      )
      .addTo(map);

    markers.set(site.id, marker);

    // Click to select
    el.addEventListener('click', () => {
      selectedSiteId = site.id;
      marker.togglePopup();
    });
  };

  // Update marker highlight when selection changes
  $: if (map && selectedSiteId) {
    markers.forEach((marker, id) => {
      const el = marker.getElement();
      if (id === selectedSiteId) {
        el.style.width = '16px';
        el.style.height = '16px';
        el.style.border = '4px solid white';
        el.style.zIndex = '10';
      } else {
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.border = '3px solid white';
        el.style.zIndex = '1';
      }
    });
  }
</script>

<div bind:this={mapContainer} class="map" />

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
</style>
