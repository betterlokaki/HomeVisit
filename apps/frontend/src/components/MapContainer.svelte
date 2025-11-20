<script lang="ts">
  import { getImageUrl } from "../utils/imageMapper";

  // Image assets from Figma - converted to local paths
  const imgMap = getImageUrl(
    "https://www.figma.com/api/mcp/asset/1ede7ea0-7e0c-4915-bb90-bb9a4bcc49e5"
  );

  export let onMarkerClick: (markerId: string) => Promise<void> = async () =>
    console.log("Marker clicked");

  function handleKeyDown(event: KeyboardEvent, handler: () => void) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler();
    }
  }
</script>

<!-- Map Container - Dark theme -->
<div
  class="bg-gray-900 flex flex-col h-full items-end overflow-hidden relative rounded-lg shrink-0 w-full"
  style="min-height: 600px;"
>
  <!-- Map Image Container -->
  <div
    class="relative shrink-0 w-full flex-1 overflow-hidden"
    data-name="Map Image"
  >
    <div
      aria-hidden="true"
      class="absolute inset-0 pointer-events-none bg-opacity-20 bg-black"
    >
      <img
        alt="map"
        class="absolute max-w-none object-cover size-full"
        src={imgMap}
      />
    </div>

    <!-- Map Markers - positioned absolutely within map container -->
    <div
      class="absolute w-2 h-2 cursor-pointer hover:scale-125 transition-transform"
      style="left: 60%; top: 15%;"
      on:click={() => onMarkerClick("marker-1")}
      on:keydown={(e) => handleKeyDown(e, () => onMarkerClick("marker-1"))}
      role="button"
      tabindex="0"
      aria-label="Marker 1"
    >
      <div class="absolute inset-0 bg-red-500 rounded-full opacity-70" />
    </div>

    <div
      class="absolute w-2 h-2 cursor-pointer hover:scale-125 transition-transform"
      style="left: 65%; top: 15%;"
      on:click={() => onMarkerClick("marker-2")}
      on:keydown={(e) => handleKeyDown(e, () => onMarkerClick("marker-2"))}
      role="button"
      tabindex="0"
      aria-label="Marker 2"
    >
      <div class="absolute inset-0 bg-blue-500 rounded-full opacity-70" />
    </div>

    <div
      class="absolute w-2 h-2 cursor-pointer hover:scale-125 transition-transform"
      style="left: 70%; top: 15%;"
      on:click={() => onMarkerClick("marker-3")}
      on:keydown={(e) => handleKeyDown(e, () => onMarkerClick("marker-3"))}
      role="button"
      tabindex="0"
      aria-label="Marker 3"
    >
      <img
        alt="marker 3"
        class="block max-w-none size-full rounded-full"
        src={getImageUrl(
          "https://www.figma.com/api/mcp/asset/03550ac2-1210-439a-bf0d-b82a96307284"
        )}
      />
    </div>

    <div
      class="absolute w-2 h-2 cursor-pointer hover:scale-125 transition-transform"
      style="left: 68%; top: 25%;"
      on:click={() => onMarkerClick("marker-4")}
      on:keydown={(e) => handleKeyDown(e, () => onMarkerClick("marker-4"))}
      role="button"
      tabindex="0"
      aria-label="Marker 4"
    >
      <div class="absolute inset-0 bg-green-500 rounded-full opacity-70" />
    </div>

    <div
      class="absolute w-2 h-2 cursor-pointer hover:scale-125 transition-transform"
      style="left: 58%; top: 22%;"
      on:click={() => onMarkerClick("marker-5")}
      on:keydown={(e) => handleKeyDown(e, () => onMarkerClick("marker-5"))}
      role="button"
      tabindex="0"
      aria-label="Marker 5"
    >
      <img
        alt="marker 5"
        class="block max-w-none size-full rounded-full"
        src={getImageUrl(
          "https://www.figma.com/api/mcp/asset/d921f7b1-3642-4aa1-a761-1202cc99ce83"
        )}
      />
    </div>

    <div
      class="absolute w-2 h-2 cursor-pointer hover:scale-125 transition-transform"
      style="left: 75%; top: 27%;"
      on:click={() => onMarkerClick("marker-6")}
      on:keydown={(e) => handleKeyDown(e, () => onMarkerClick("marker-6"))}
      role="button"
      tabindex="0"
      aria-label="Marker 6"
    >
      <div class="absolute inset-0 bg-yellow-500 rounded-full opacity-70" />
    </div>

    <div
      class="absolute w-2 h-2 cursor-pointer hover:scale-125 transition-transform"
      style="left: 58%; top: 40%;"
      on:click={() => onMarkerClick("marker-7")}
      on:keydown={(e) => handleKeyDown(e, () => onMarkerClick("marker-7"))}
      role="button"
      tabindex="0"
      aria-label="Marker 7"
    >
      <div class="absolute inset-0 bg-purple-500 rounded-full opacity-70" />
    </div>

    <!-- Map Pin - Active Site Indicator -->
    <div
      class="absolute w-1.5 h-1.5"
      style="left: 70%; top: 43%;"
      data-name="map-pin"
    />

    <!-- Map Legend Labels -->
    <p
      class="absolute font-bold leading-tight text-sm text-right text-white pointer-events-none"
      style="right: 5%; top: 2%;"
      dir="auto"
    >
      הובר
    </p>
    <p
      class="absolute font-bold leading-tight text-sm text-right text-white pointer-events-none"
      style="right: 8%; top: 2%;"
      dir="auto"
    >
      לחוץ
    </p>
    <p
      class="absolute font-bold leading-tight text-sm text-right text-white pointer-events-none"
      style="right: 15%; top: 2%;"
      dir="auto"
    >
      רגיל
    </p>
  </div>

  <!-- Scroll Indicator -->
  <div class="w-0.5 h-12 relative shrink-0">
    <img
      alt="scroll"
      class="block max-w-none size-full"
      src={getImageUrl(
        "https://www.figma.com/api/mcp/asset/15a8cdde-bd45-46bd-9a6a-4a443c719b15"
      )}
    />
  </div>
</div>

<style>
  div {
    direction: rtl;
  }
</style>
