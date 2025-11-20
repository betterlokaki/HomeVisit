<script lang="ts">
  // Image assets from Figma
  const imgDh7Jg5AWsAAcrt71 = "https://www.figma.com/api/mcp/asset/1ede7ea0-7e0c-4915-bb90-bb9a4bcc49e5";
  const imgEllipse1 = "https://www.figma.com/api/mcp/asset/15a8cdde-bd45-46bd-9a6a-4a443c719b15";
  const imgEllipse7 = "https://www.figma.com/api/mcp/asset/03550ac2-1210-439a-bf0d-b82a96307284";
  const imgEllipse5 = "https://www.figma.com/api/mcp/asset/d921f7b1-3642-4aa1-a761-1202cc99ce83";

  export let onMarkerClick: (markerId: string) => Promise<void> = async () => console.log('Marker clicked');

  function handleKeyDown(event: KeyboardEvent, handler: () => void) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handler();
    }
  }
</script>

<!-- Map Container - 2017:176 (Left Side) -->
<div 
  class="bg-[#141414] flex flex-col h-full items-end overflow-hidden relative rounded-[8px] shrink-0 max-w-[874px] w-full min-h-[600px]" 
>
  <!-- Map Image Container - 2017:177 -->
  <div 
    class="h-[934px] relative shrink-0 w-[874px] max-h-full" 
    data-name="Map Image"
  >
    <div aria-hidden="true" class="absolute inset-0 pointer-events-none">
      <img alt="map" class="absolute max-w-none object-cover size-full" src={imgDh7Jg5AWsAAcrt71} />
      <div class="absolute bg-[rgba(0,0,0,0.2)] inset-0" />
    </div>

    <!-- Map Markers - positioned absolutely within map container -->
    <div 
      class="absolute size-[10px] cursor-pointer hover:scale-125 transition-transform" 
      style="left: 534px; top: 86px;"
      on:click={() => onMarkerClick('marker-1')}
      on:keydown={(e) => handleKeyDown(e, () => onMarkerClick('marker-1'))}
      role="button"
      tabindex="0"
      aria-label="Marker 1"
    >
      <div class="absolute inset-0 bg-red-500 rounded-full opacity-70" />
    </div>

    <div 
      class="absolute size-[10px] cursor-pointer hover:scale-125 transition-transform" 
      style="left: 582px; top: 86px;"
      on:click={() => onMarkerClick('marker-2')}
      on:keydown={(e) => handleKeyDown(e, () => onMarkerClick('marker-2'))}
      role="button"
      tabindex="0"
      aria-label="Marker 2"
    >
      <div class="absolute inset-0 bg-blue-500 rounded-full opacity-70" />
    </div>

    <div 
      class="absolute size-[10px] cursor-pointer hover:scale-125 transition-transform" 
      style="left: 634px; top: 86px;"
      on:click={() => onMarkerClick('marker-3')}
      on:keydown={(e) => handleKeyDown(e, () => onMarkerClick('marker-3'))}
      role="button"
      tabindex="0"
      aria-label="Marker 3"
    >
      <img alt="marker 3" class="block max-w-none size-full rounded-full" src={imgEllipse7} />
    </div>

    <div 
      class="absolute size-[10px] cursor-pointer hover:scale-125 transition-transform" 
      style="left: 607px; top: 182px;"
      on:click={() => onMarkerClick('marker-4')}
      on:keydown={(e) => handleKeyDown(e, () => onMarkerClick('marker-4'))}
      role="button"
      tabindex="0"
      aria-label="Marker 4"
    >
      <div class="absolute inset-0 bg-green-500 rounded-full opacity-70" />
    </div>

    <div 
      class="absolute size-[10px] cursor-pointer hover:scale-125 transition-transform" 
      style="left: 513px; top: 157px;"
      on:click={() => onMarkerClick('marker-5')}
      on:keydown={(e) => handleKeyDown(e, () => onMarkerClick('marker-5'))}
      role="button"
      tabindex="0"
      aria-label="Marker 5"
    >
      <img alt="marker 5" class="block max-w-none size-full rounded-full" src={imgEllipse5} />
    </div>

    <div 
      class="absolute size-[10px] cursor-pointer hover:scale-125 transition-transform" 
      style="left: 671px; top: 187px;"
      on:click={() => onMarkerClick('marker-6')}
      on:keydown={(e) => handleKeyDown(e, () => onMarkerClick('marker-6'))}
      role="button"
      tabindex="0"
      aria-label="Marker 6"
    >
      <div class="absolute inset-0 bg-yellow-500 rounded-full opacity-70" />
    </div>

    <div 
      class="absolute size-[10px] cursor-pointer hover:scale-125 transition-transform" 
      style="left: 512px; top: 237px;"
      on:click={() => onMarkerClick('marker-7')}
      on:keydown={(e) => handleKeyDown(e, () => onMarkerClick('marker-7'))}
      role="button"
      tabindex="0"
      aria-label="Marker 7"
    >
      <div class="absolute inset-0 bg-purple-500 rounded-full opacity-70" />
    </div>

    <!-- Map Pin - Active Site Indicator -->
    <div 
      class="absolute overflow-clip size-[24px]" 
      style="left: 631px; top: 248px;"
      data-name="map-pin"
    />

    <!-- Map Legend Labels -->
    <p 
      class="absolute font-['Heebo'] font-bold leading-[22px] text-[14px] text-right text-white pointer-events-none" 
      style="left: 600px; top: 16px; transform: translateX(-100%);"
      dir="auto"
    >
      הובר
    </p>
    <p 
      class="absolute font-['Heebo'] font-bold leading-[22px] text-[14px] text-right text-white pointer-events-none" 
      style="left: 648px; top: 16px; transform: translateX(-100%);"
      dir="auto"
    >
      לחוץ
    </p>
    <p 
      class="absolute font-['Heebo'] font-bold leading-[22px] text-[14px] text-right text-white pointer-events-none" 
      style="left: 547px; top: 16px; transform: translateX(-100%);"
      dir="auto"
    >
      רגיל
    </p>
  </div>

  <!-- Scroll Indicator -->
  <div 
    class="h-[51px] relative shrink-0 w-[3px]"
  >
    <img alt="scroll" class="block max-w-none size-full" src={imgEllipse1} />
  </div>
</div>

<style>
  div {
    direction: rtl;
  }
</style>
