<!-- 
  LocatX Frame - Site Visit Management Interface
  Converted from Figma Frame 2017:162 (Page 3)
  
  Layout:
  - Top: Header toolbar with user name and profile picture
  - Left: Map section with markers and legend
  - Right: Tickets panel with filters and visit cards (RTL Hebrew)
-->

<script lang="ts">
  // Image assets from Figma (valid for 7 days)
  const imgSizeDefualtImageYes = "https://www.figma.com/api/mcp/asset/290490a2-5396-4f24-97ea-74c38365d0e9";
  const imgImage1 = "https://www.figma.com/api/mcp/asset/fe3aad0c-1c04-41cd-9ffa-725ef1c483b6";
  const imgDh7Jg5AWsAAcrt71 = "https://www.figma.com/api/mcp/asset/1ede7ea0-7e0c-4915-bb90-bb9a4bcc49e5";
  const imgVector = "https://www.figma.com/api/mcp/asset/91636383-9b42-436d-b2c8-f460e654377a";
  const imgVector1 = "https://www.figma.com/api/mcp/asset/21456f3d-7309-4435-9d98-85b64264d593";
  const imgVector2 = "https://www.figma.com/api/mcp/asset/17325962-5fde-4cd0-873b-d78ea088b73c";
  const imgVector3 = "https://www.figma.com/api/mcp/asset/7c5e6a34-4138-455f-9811-3cef886a43fc";
  const imgEllipse1 = "https://www.figma.com/api/mcp/asset/15a8cdde-bd45-46bd-9a6a-4a443c719b15";
  const imgEllipse2 = "https://www.figma.com/api/mcp/asset/8d737b67-199c-42be-9d1c-4dc5c43b079b";
  const imgEllipse8 = "https://www.figma.com/api/mcp/asset/cc8fe8de-31f7-43fb-ad11-87265528d4d2";
  const imgEllipse7 = "https://www.figma.com/api/mcp/asset/03550ac2-1210-439a-bf0d-b82a96307284";
  const imgEllipse3 = "https://www.figma.com/api/mcp/asset/051eac42-6e3d-4589-a0fe-14a92c291351";
  const imgEllipse5 = "https://www.figma.com/api/mcp/asset/d921f7b1-3642-4aa1-a761-1202cc99ce83";
  const imgEllipse6 = "https://www.figma.com/api/mcp/asset/8fce0ca8-dfee-4c9c-8d83-84f036f80e1d";
  const img = "https://www.figma.com/api/mcp/asset/048c86ff-e79d-4483-8859-702d8db23cdb";
  const img1 = "https://www.figma.com/api/mcp/asset/d06002c0-215c-4ee9-8f0f-676445a616fc";
  const img2 = "https://www.figma.com/api/mcp/asset/4f6da687-3b39-4f18-b901-674f8b56eb8f";
  const img3 = "https://www.figma.com/api/mcp/asset/6e8aa37e-5765-43ab-8729-7774f326405a";
  const img4 = "https://www.figma.com/api/mcp/asset/671bcbbd-ed89-4e21-8c04-0f17add86636";

  // Interaction handlers
  function handleInspectorSelect() {
    // TODO: Implement inspector dropdown selection
    console.log('Inspector selected');
  }

  function handleFilterToggle(filter: string) {
    // TODO: Implement filter toggle logic
    console.log('Filter toggled:', filter);
  }

  function handleVisitAction(action: string, visitId: number) {
    // TODO: Implement visit action (cancel, complete, partial, return)
    console.log('Visit action:', action, 'for visit:', visitId);
  }

  function handleMarkerClick(markerId: string) {
    // TODO: Implement marker click to select site on map
    console.log('Marker clicked:', markerId);
  }

  function handleKeyDown(event: KeyboardEvent, handler: () => void) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handler();
    }
  }
</script>

<!-- Root Container - Frame 2017:162 -->
<div 
  class="bg-[#000000] box-border flex flex-col gap-[24px] items-end px-[24px] py-[20px] relative min-h-screen w-full overflow-auto" 
  dir="rtl"
  data-node-id="2017:162"
>
  <!-- Header Section - 2017:163 -->
  <div 
    class="bg-[#141414] box-border flex items-start justify-between px-[24px] py-[12px] relative rounded-[8px] shrink-0 w-full max-w-[1852px]" 
    data-name="header" 
    data-node-id="2017:163"
  >
    <div 
      class="flex flex-[1_0_0] gap-[12px] items-center justify-end min-h-px min-w-px relative shrink-0" 
      data-node-id="2017:164"
    >
      <div 
        class="box-border flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px px-[8px] py-0 relative shrink-0" 
        data-node-id="2017:165"
      >
        <div 
          class="flex gap-[16px] items-center relative shrink-0 w-full" 
          data-name="left side - header" 
          data-node-id="2017:166"
        >
          <div 
            class="flex gap-[16px] items-center relative shrink-0" 
            data-node-id="2017:167"
          >
            <div 
              class="flex items-center justify-center relative shrink-0" 
              data-node-id="2017:168"
            >
              <p 
                class="font-['Heebo'] font-normal leading-[22px] relative shrink-0 text-[14px] text-[#ffffffe0] text-right" 
                dir="auto" 
                data-node-id="2017:169"
              >
                ישראל ישראלי
              </p>
            </div>
            <div class="relative shrink-0 size-[28px]" data-name="Component 7" data-node-id="2017:170">
              <img alt="" class="block max-w-none size-full" src={imgSizeDefualtImageYes} />
            </div>
          </div>
          <div class="h-[36px] shrink-0 w-0" data-name="devider" data-node-id="2017:171" />
        </div>
      </div>
      <div class="h-[32px] shrink-0 w-[240px]" data-name="right side -header" data-node-id="2017:172" />
      <div 
        class="flex flex-col gap-[10px] h-[58px] items-end relative shrink-0 w-[71px]" 
        data-node-id="2017:173"
      >
        <div 
          class="aspect-[1430/1128] relative shrink-0 w-full" 
          data-name="image 1" 
          data-node-id="2017:174"
        >
          <img alt="" class="absolute inset-0 max-w-none object-cover pointer-events-none size-full rounded-[8px]" src={imgImage1} />
        </div>
      </div>
    </div>
  </div>

  <!-- Main Content Area - 2017:175 -->
  <div 
    class="flex flex-[1_0_0] gap-[24px] items-center justify-start min-h-px min-w-px relative shrink-0 w-full max-w-[1852px] flex-wrap" 
    data-node-id="2017:175"
  >
    <!-- Map Container - 2017:176 (Left Side) -->
    <div 
      class="bg-[#141414] flex flex-[1_0_0] flex-col h-full items-end min-h-px min-w-px overflow-hidden relative rounded-[8px] shrink-0 max-w-[874px] w-full min-h-[600px]" 
      data-node-id="2017:176"
    >
      <!-- Map Image Container - 2017:177 -->
      <div 
        class="h-[934px] relative shrink-0 w-[874px] max-h-full" 
        data-name="DH7JG5AWsAAcrt7 1" 
        data-node-id="2017:177"
      >
        <div aria-hidden="true" class="absolute inset-0 pointer-events-none">
          <img alt="" class="absolute max-w-none object-cover size-full" src={imgDh7Jg5AWsAAcrt71} />
          <div class="absolute bg-[rgba(0,0,0,0.2)] inset-0" />
        </div>

        <!-- Map Markers - positioned absolutely within map container -->
        <div 
          class="absolute size-[10px] cursor-pointer" 
          style="left: 534px; top: 86px;"
          data-node-id="2017:303"
          on:click={() => handleMarkerClick('2017:303')}
          on:keydown={(e) => handleKeyDown(e, () => handleMarkerClick('2017:303'))}
          role="button"
          tabindex="0"
        >
          <div class="absolute inset-0">
            <img alt="" class="block max-w-none size-full" src={imgEllipse2} />
          </div>
        </div>
        <div 
          class="absolute size-[10px] cursor-pointer" 
          style="left: 582px; top: 86px;"
          data-node-id="2017:321"
          on:click={() => handleMarkerClick('2017:321')}
          on:keydown={(e) => handleKeyDown(e, () => handleMarkerClick('2017:321'))}
          role="button"
          tabindex="0"
        >
          <div class="absolute inset-0">
            <img alt="" class="block max-w-none size-full" src={imgEllipse8} />
          </div>
        </div>
        <div 
          class="absolute size-[10px] cursor-pointer" 
          style="left: 634px; top: 86px;"
          data-node-id="2017:316"
          on:click={() => handleMarkerClick('2017:316')}
          on:keydown={(e) => handleKeyDown(e, () => handleMarkerClick('2017:316'))}
          role="button"
          tabindex="0"
        >
          <img alt="" class="block max-w-none size-full" src={imgEllipse7} />
        </div>
        <div 
          class="absolute size-[10px] cursor-pointer" 
          style="left: 607px; top: 182px;"
          data-node-id="2017:308"
          on:click={() => handleMarkerClick('2017:308')}
          on:keydown={(e) => handleKeyDown(e, () => handleMarkerClick('2017:308'))}
          role="button"
          tabindex="0"
        >
          <div class="absolute inset-0">
            <img alt="" class="block max-w-none size-full" src={imgEllipse3} />
          </div>
        </div>
        <div 
          class="absolute size-[10px] cursor-pointer" 
          style="left: 513px; top: 157px;"
          data-node-id="2017:311"
          on:click={() => handleMarkerClick('2017:311')}
          on:keydown={(e) => handleKeyDown(e, () => handleMarkerClick('2017:311'))}
          role="button"
          tabindex="0"
        >
          <img alt="" class="block max-w-none size-full" src={imgEllipse5} />
        </div>
        <div 
          class="absolute size-[10px] cursor-pointer" 
          style="left: 671px; top: 187px;"
          data-node-id="2017:312"
          on:click={() => handleMarkerClick('2017:312')}
          on:keydown={(e) => handleKeyDown(e, () => handleMarkerClick('2017:312'))}
          role="button"
          tabindex="0"
        >
          <div class="absolute inset-0">
            <img alt="" class="block max-w-none size-full" src={imgEllipse6} />
          </div>
        </div>
        <div 
          class="absolute size-[10px] cursor-pointer" 
          style="left: 512px; top: 237px;"
          data-node-id="2017:310"
          on:click={() => handleMarkerClick('2017:310')}
          on:keydown={(e) => handleKeyDown(e, () => handleMarkerClick('2017:310'))}
          role="button"
          tabindex="0"
        >
          <div class="absolute inset-0">
            <img alt="" class="block max-w-none size-full" src={imgEllipse3} />
          </div>
        </div>

        <!-- Map Pin - Active Site Indicator - 2017:313 -->
        <div 
          class="absolute overflow-clip size-[24px]" 
          style="left: 631px; top: 248px;"
          data-name="map-pin" 
          data-node-id="2017:313"
        />

        <!-- Map Legend Labels -->
        <p 
          class="absolute font-['Heebo'] font-bold leading-[22px] text-[14px] text-right text-white pointer-events-none" 
          style="left: 600px; top: 16px; transform: translateX(-100%);"
          dir="auto" 
          data-node-id="2017:323"
        >
          הובר
        </p>
        <p 
          class="absolute font-['Heebo'] font-bold leading-[22px] text-[14px] text-right text-white pointer-events-none" 
          style="left: 648px; top: 16px; transform: translateX(-100%);"
          dir="auto" 
          data-node-id="2017:325"
        >
          לחוץ
        </p>
        <p 
          class="absolute font-['Heebo'] font-bold leading-[22px] text-[14px] text-right text-white pointer-events-none" 
          style="left: 547px; top: 16px; transform: translateX(-100%);"
          dir="auto" 
          data-node-id="2017:324"
        >
          רגיל
        </p>
      </div>

      <!-- Scroll Indicator - 2017:302 -->
      <div 
        class="h-[51px] relative shrink-0 w-[3px]" 
        data-node-id="2017:302"
      >
        <img alt="" class="block max-w-none size-full" src={imgEllipse1} />
      </div>
    </div>

    <!-- Tickets Panel - 2017:178 (Right Side) -->
    <div 
      class="bg-[#141414] box-border flex flex-col gap-[24px] h-full items-end overflow-clip p-[12px] relative rounded-[8px] shrink-0 max-w-[954px] w-full flex-1 min-h-[600px]" 
      data-node-id="2017:178"
    >
      <!-- Title Section - 2017:179 -->
      <div 
        class="flex flex-col gap-[10px] items-end justify-center relative shrink-0 w-full" 
        data-node-id="2017:179"
      >
        <div 
          class="flex gap-[24px] items-center relative shrink-0 w-full" 
          data-node-id="2017:180"
        >
          <div 
            class="flex flex-[1_0_0] gap-[24px] items-center justify-end min-h-px min-w-px relative shrink-0" 
            data-node-id="2017:181"
          >
            <div 
              class="flex flex-col font-['Heebo'] font-bold justify-center leading-[0] relative shrink-0 text-[16px] text-[#ffffffe0] whitespace-nowrap" 
              data-node-id="2017:182"
            >
              <p class="leading-[24px]" dir="auto">
                ניהול הביקורים באתרים שלי (10)
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Section - 2017:183 -->
      <div 
        class="flex gap-[12px] items-start justify-end relative shrink-0" 
        data-node-id="2017:183"
      >
        <!-- Inspector Dropdown - 2017:184 -->
        <div 
          class="flex flex-col gap-[16px] h-[32px] items-end justify-center relative shrink-0" 
          data-name="Menu Button" 
          data-node-id="2017:184"
        >
          <div 
            class="border border-[#434343] border-solid box-border flex gap-[8px] h-[32px] items-center px-[16px] py-0 relative rounded-[8px] shrink-0 cursor-pointer" 
            data-name="trigger" 
            data-node-id="I2017:184;189:14663"
            on:click={handleInspectorSelect}
            on:keydown={(e) => handleKeyDown(e, handleInspectorSelect)}
            role="button"
            tabindex="0"
          >
            <div class="overflow-clip relative shrink-0 size-[14px]" data-name="chevron-down" data-node-id="434:1721">
              <div class="absolute bottom-[37.5%] left-1/4 right-1/4 top-[37.5%]" data-name="Vector" data-node-id="434:1722">
                <div class="absolute inset-[-8.33%_-4.17%]">
                  <img alt="" class="block max-w-none size-full" src={imgVector3} />
                </div>
              </div>
            </div>
            <p 
              class="font-['Heebo'] font-normal leading-[22px] relative shrink-0 text-[14px] text-[#ffffffe0] text-right" 
              dir="auto" 
              data-node-id="I2017:184;189:14663;189:13270"
            >
              פקח: ישראל ישראלי
            </p>
          </div>
        </div>

        <!-- Filter Buttons -->
        <div 
          class="bg-[#131c17] box-border flex gap-[8px] h-[32px] items-center justify-center px-[12px] py-0 relative rounded-[8px] shrink-0 cursor-pointer" 
          data-name=".select__item" 
          data-node-id="2017:185"
          on:click={() => handleFilterToggle('awaiting')}
          on:keydown={(e) => handleKeyDown(e, () => handleFilterToggle('awaiting'))}
          role="button"
          tabindex="0"
        >
          <p 
            class="font-['Heebo'] font-bold leading-[22px] relative shrink-0 text-[14px] text-[#ffffffe0] text-right" 
            dir="auto" 
            data-node-id="I2017:185;74443:158224"
          >
            מחכה לביקור
          </p>
        </div>
        <div 
          class="bg-[#131c17] box-border flex gap-[8px] h-[32px] items-center justify-center px-[12px] py-0 relative rounded-[8px] shrink-0 cursor-pointer" 
          data-name=".select__item" 
          data-node-id="2017:186"
          on:click={() => handleFilterToggle('collection')}
          on:keydown={(e) => handleKeyDown(e, () => handleFilterToggle('collection'))}
          role="button"
          tabindex="0"
        >
          <p 
            class="font-['Heebo'] font-bold leading-[22px] relative shrink-0 text-[14px] text-[#ffffffe0] text-right" 
            dir="auto" 
            data-node-id="I2017:186;74443:158224"
          >
            דרוש לאיסוף
          </p>
        </div>
        <div 
          class="bg-[#131c17] box-border flex gap-[8px] h-[32px] items-center justify-center px-[12px] py-0 relative rounded-[8px] shrink-0 cursor-pointer" 
          data-name=".select__item" 
          data-node-id="2017:188"
          on:click={() => handleFilterToggle('completed')}
          on:keydown={(e) => handleKeyDown(e, () => handleFilterToggle('completed'))}
          role="button"
          tabindex="0"
        >
          <p 
            class="font-['Heebo'] font-bold leading-[22px] relative shrink-0 text-[14px] text-[#ffffffe0] text-right" 
            dir="auto" 
            data-node-id="I2017:188;74443:158224"
          >
            בוצע חלקית/מלא
          </p>
        </div>
      </div>

      <!-- Visit Card 1: Active Visit - 2017:189 -->
      <div 
        class="bg-[#1f1f1f] border border-[#1668dc] border-solid relative rounded-[8px] shrink-0 w-full" 
        data-node-id="2017:189"
      >
        <div class="box-border flex flex-col gap-[8px] items-end overflow-clip p-[16px] relative rounded-[inherit] w-full">
          <div 
            class="flex gap-[8px] items-center justify-end relative shrink-0 w-full" 
            data-node-id="2017:190"
          >
            <div 
              class="flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative shrink-0" 
              data-node-id="2017:191"
            >
              <!-- Cancel Icon Button -->
              <div 
                class="border border-[#434343] border-solid box-border flex gap-[8px] h-[32px] items-center justify-center px-[8px] py-[4px] relative rounded-[8px] shrink-0 cursor-pointer" 
                data-name="Button" 
                data-node-id="2017:192"
                on:click={() => handleVisitAction('cancel', 1)}
                on:keydown={(e) => handleKeyDown(e, () => handleVisitAction('cancel', 1))}
                role="button"
                tabindex="0"
              >
                <div class="overflow-clip relative shrink-0 size-[16px]" data-name="🎰 icon" data-node-id="I2017:192;114:3100">
                  <div class="absolute inset-[12.5%_20.83%]" data-name="Vector" data-node-id="I2017:192;114:3100;71595:47323">
                    <div class="absolute inset-[-4.17%_-5.36%]">
                      <img alt="" class="block max-w-none size-full" src={img} />
                    </div>
                  </div>
                </div>
              </div>
              <!-- Divider -->
              <div class="flex flex-row items-center self-stretch">
                <div 
                  class="box-border flex h-full items-start px-[8px] py-0 relative shrink-0" 
                  data-name="Divider__Vertical" 
                  data-node-id="2017:193"
                >
                  <div 
                    class="bg-[#434343] h-full shrink-0 w-px" 
                    data-name="Divider" 
                    data-node-id="I2017:193;151:5232"
                  />
                </div>
              </div>
              <!-- Cancel Visit Button -->
              <div 
                class="box-border flex gap-[8px] h-[32px] items-center justify-center px-[16px] py-[4px] relative rounded-[8px] shrink-0 cursor-pointer" 
                data-name="Button" 
                data-node-id="2017:194"
                on:click={() => handleVisitAction('cancel-visit', 1)}
                on:keydown={(e) => handleKeyDown(e, () => handleVisitAction('cancel-visit', 1))}
                role="button"
                tabindex="0"
              >
                <p 
                  class="font-['Heebo'] font-normal leading-[22px] relative shrink-0 text-[14px] text-[#1668dc] text-right" 
                  dir="auto" 
                  data-node-id="I2017:194;114:1821"
                >
                  בטל ביקור
                </p>
              </div>
              <!-- Partially Completed Button -->
              <div 
                class="border border-[#434343] border-solid box-border flex gap-[8px] h-[32px] items-center justify-center px-[16px] py-[4px] relative rounded-[8px] shrink-0 cursor-pointer" 
                data-name="Button" 
                data-node-id="2017:195"
                on:click={() => handleVisitAction('partial', 1)}
                on:keydown={(e) => handleKeyDown(e, () => handleVisitAction('partial', 1))}
                role="button"
                tabindex="0"
              >
                <p 
                  class="font-['Heebo'] font-normal leading-[22px] relative shrink-0 text-[14px] text-[#ffffffe0] text-right" 
                  dir="auto" 
                  data-node-id="I2017:195;114:1809"
                >
                  בוצע חלקית
                </p>
              </div>
              <!-- Completed Button -->
              <div 
                class="bg-[#1668dc] box-border flex gap-[8px] h-[32px] items-center justify-center px-[16px] py-[4px] relative rounded-[8px] shrink-0 cursor-pointer" 
                data-name="Button" 
                data-node-id="2017:196"
                on:click={() => handleVisitAction('complete', 1)}
                on:keydown={(e) => handleKeyDown(e, () => handleVisitAction('complete', 1))}
                role="button"
                tabindex="0"
              >
                <p 
                  class="font-['Heebo'] font-normal leading-[22px] relative shrink-0 text-[14px] text-[#ffffff] text-right" 
                  dir="auto" 
                  data-node-id="I2017:196;18:9577"
                >
                  בוצע
                </p>
              </div>
            </div>
            <!-- Site Info -->
            <div 
              class="flex items-center relative shrink-0" 
              data-node-id="2017:197"
            >
              <div 
                class="box-border flex gap-[8px] h-[32px] items-center justify-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" 
                data-name="Button" 
                data-node-id="2017:198"
              >
                <div class="overflow-clip relative shrink-0 size-[16px]" data-name="🎰 icon" data-node-id="I2017:198;114:3106">
                  <div class="absolute inset-[12.5%]" data-name="Vector" data-node-id="I2017:198;114:3106;71595:49945">
                    <div class="absolute inset-[-4.17%]">
                      <img alt="" class="block max-w-none size-full" src={img1} />
                    </div>
                  </div>
                </div>
              </div>
              <div 
                class="flex flex-col font-['Heebo'] font-bold justify-center leading-[0] relative shrink-0 text-[16px] text-[#ffffffe0] text-right whitespace-nowrap" 
                data-node-id="2017:199"
              >
                <p class="leading-[24px]" dir="auto">
                  אגמון החולה
                </p>
              </div>
            </div>
            <!-- Status Tag -->
            <div 
              class="flex gap-[8px] items-center justify-end relative shrink-0" 
              data-node-id="2017:200"
            >
              <div 
                class="flex flex-col gap-[8px] items-end relative shrink-0 w-[99px]" 
                data-node-id="2017:201"
              >
                <div 
                  class="bg-[#111a2c] border border-[#15325b] border-solid box-border flex gap-[4px] items-center justify-center px-[8px] py-px relative rounded-[4px] shrink-0 w-full" 
                  data-name="Tag__Status" 
                  data-node-id="2017:202"
                >
                  <p 
                    class="font-['Heebo'] font-normal leading-[20px] relative shrink-0 text-[12px] text-[#1668dc] text-right" 
                    dir="auto" 
                    data-node-id="I2017:202;137:7893"
                  >
                    בתהליך ביקור
                  </p>
                  <div class="overflow-clip relative shrink-0 size-[12px]" data-name="Icon" data-node-id="I2017:202;137:7892">
                    <div class="absolute inset-[12.5%]" data-name="Vector" data-node-id="I2017:202;137:7892;71595:42381">
                      <div class="absolute inset-[-5.56%]">
                        <img alt="" class="block max-w-none size-full" src={img2} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Card Footer -->
          <div 
            class="flex gap-[12px] items-start justify-end leading-[0] relative shrink-0 text-[12px] text-[#ffffffe0]" 
            data-node-id="2017:203"
          >
            <div 
              class="flex flex-col font-['Heebo'] font-normal justify-center relative shrink-0 whitespace-nowrap" 
              data-node-id="2017:204"
            >
              <p class="leading-[20px]" dir="auto">
                ישראל ישראלי
              </p>
            </div>
            <div 
              class="flex flex-col font-['Heebo'] font-bold justify-center relative shrink-0 text-right w-[97px]" 
              data-node-id="2017:205"
            >
              <p class="leading-[20px] whitespace-pre-wrap" dir="auto">
                פקח אחראי
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Visit Card 2: No Collection - 2017:206 -->
      <div 
        class="bg-[#1f1f1f] box-border flex flex-col gap-[8px] items-end overflow-clip p-[16px] relative rounded-[8px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] shrink-0 w-full" 
        data-node-id="2017:206"
      >
        <div 
          class="flex gap-[8px] items-center justify-end relative shrink-0 w-full" 
          data-node-id="2017:207"
        >
          <div 
            class="flex items-center relative shrink-0" 
            data-node-id="2017:208"
          >
            <div 
              class="box-border flex gap-[8px] h-[32px] items-center justify-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" 
              data-name="Button" 
              data-node-id="2017:209"
            >
              <div class="overflow-clip relative shrink-0 size-[16px]" data-name="🎰 icon" data-node-id="I2017:209;114:3106">
                <div class="absolute inset-[12.5%]" data-name="Vector" data-node-id="I2017:209;114:3106;71595:49945">
                  <div class="absolute inset-[-4.17%]">
                    <img alt="" class="block max-w-none size-full" src={img1} />
                  </div>
                </div>
              </div>
            </div>
            <div 
              class="flex flex-col font-['Heebo'] font-bold justify-center leading-[0] relative shrink-0 text-[16px] text-[#ffffffe0] text-right whitespace-nowrap" 
              data-node-id="2017:210"
            >
              <p class="leading-[24px]" dir="auto">
                אגמון החולה
              </p>
            </div>
          </div>
          <div 
            class="bg-[#2a1215] border border-[#58181c] border-solid box-border flex gap-[4px] items-center justify-center px-[8px] py-px relative rounded-[4px] shrink-0" 
            data-name="Tag__Status" 
            data-node-id="2017:211"
          >
            <p 
              class="font-['Heebo'] font-normal leading-[20px] relative shrink-0 text-[12px] text-[#d32029] text-right" 
              dir="auto" 
              data-node-id="I2017:211;137:7885"
            >
              אין איסוף
            </p>
            <div class="overflow-clip relative shrink-0 size-[12px]" data-name="circle-x" data-node-id="520:9216">
              <div class="absolute inset-[12.5%]" data-name="Vector" data-node-id="520:9217">
                <div class="absolute inset-[-2.78%]">
                  <img alt="" class="block max-w-none size-full" src={imgVector2} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div 
          class="flex gap-[12px] items-start justify-end leading-[0] relative shrink-0 text-[12px] text-[#ffffffe0]" 
          data-node-id="2017:212"
        >
          <div 
            class="flex flex-col font-['Heebo'] font-normal justify-center relative shrink-0 whitespace-nowrap" 
            data-node-id="2017:213"
          >
            <p class="leading-[20px]" dir="auto">
              ישראל ישראלי
            </p>
          </div>
          <div 
            class="flex flex-col font-['Heebo'] font-bold justify-center relative shrink-0 text-right w-[97px]" 
            data-node-id="2017:214"
          >
            <p class="leading-[20px] whitespace-pre-wrap" dir="auto">
              פקח אחראי
            </p>
          </div>
        </div>
      </div>

      <!-- Visit Card 3: Awaiting Visit - 2017:215 -->
      <div 
        class="bg-[#1f1f1f] box-border flex flex-col gap-[8px] items-end overflow-clip p-[16px] relative rounded-[8px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] shrink-0 w-full" 
        data-node-id="2017:215"
      >
        <div 
          class="flex gap-[8px] items-center justify-end relative shrink-0 w-full" 
          data-node-id="2017:216"
        >
          <div 
            class="flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative shrink-0" 
            data-node-id="2017:217"
          >
            <div 
              class="bg-[#1668dc] box-border flex gap-[8px] h-[32px] items-center justify-center px-[16px] py-[4px] relative rounded-[8px] shrink-0 cursor-pointer" 
              data-name="Button" 
              data-node-id="2017:218"
              on:click={() => handleVisitAction('visit', 3)}
              on:keydown={(e) => handleKeyDown(e, () => handleVisitAction('visit', 3))}
              role="button"
              tabindex="0"
            >
              <p 
                class="font-['Heebo'] font-normal leading-[22px] relative shrink-0 text-[14px] text-[#ffffff] text-right" 
                dir="auto" 
                data-node-id="I2017:218;18:9577"
              >
                בקר
              </p>
              <div class="overflow-clip relative shrink-0 size-[16px]" data-name="bolt" data-node-id="2005:2469">
                <div class="absolute inset-[12.5%_20.83%]" data-name="Vector" data-node-id="2005:2470">
                  <div class="absolute inset-[-2.78%_-3.57%]">
                    <img alt="" class="block max-w-none size-full" src={imgVector1} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div 
            class="flex items-center relative shrink-0" 
            data-node-id="2017:219"
          >
            <div 
              class="box-border flex gap-[8px] h-[32px] items-center justify-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" 
              data-name="Button" 
              data-node-id="2017:220"
            >
              <div class="overflow-clip relative shrink-0 size-[16px]" data-name="🎰 icon" data-node-id="I2017:220;114:3106">
                <div class="absolute inset-[12.5%]" data-name="Vector" data-node-id="I2017:220;114:3106;71595:49945">
                  <div class="absolute inset-[-4.17%]">
                    <img alt="" class="block max-w-none size-full" src={img1} />
                  </div>
                </div>
              </div>
            </div>
            <div 
              class="flex flex-col font-['Heebo'] font-bold justify-center leading-[0] relative shrink-0 text-[16px] text-[#ffffffe0] text-right whitespace-nowrap" 
              data-node-id="2017:221"
            >
              <p class="leading-[24px]" dir="auto">
                אגמון החולה
              </p>
            </div>
          </div>
          <div 
            class="bg-[#2b2111] border border-[#594214] border-solid box-border flex gap-[4px] items-center justify-center px-[8px] py-px relative rounded-[4px] shrink-0" 
            data-name="Tag__Status" 
            data-node-id="2017:222"
          >
            <p 
              class="font-['Heebo'] font-normal leading-[20px] relative shrink-0 text-[12px] text-[#d89614] text-right" 
              dir="auto" 
              data-node-id="I2017:222;137:7889"
            >
              מחכה לביקור
            </p>
            <div class="overflow-clip relative shrink-0 size-[12px]" data-name="Icon" data-node-id="I2017:222;137:7888">
              <div class="absolute bottom-[12.5%] left-1/4 right-1/4 top-[12.5%]" data-name="Vector" data-node-id="I2017:222;137:7888;71595:49929">
                <div class="absolute inset-[-5.56%_-8.33%]">
                  <img alt="" class="block max-w-none size-full" src={img3} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div 
          class="flex gap-[12px] items-start justify-end leading-[0] relative shrink-0 text-[12px] text-[#ffffffe0]" 
          data-node-id="2017:223"
        >
          <div 
            class="flex flex-col font-['Heebo'] font-normal justify-center relative shrink-0 whitespace-nowrap" 
            data-node-id="2017:224"
          >
            <p class="leading-[20px]" dir="auto">
              ישראל ישראלי
            </p>
          </div>
          <div 
            class="flex flex-col font-['Heebo'] font-bold justify-center relative shrink-0 text-right w-[97px]" 
            data-node-id="2017:225"
          >
            <p class="leading-[20px] whitespace-pre-wrap" dir="auto">
              פקח אחראי
            </p>
          </div>
        </div>
      </div>

      <!-- Visit Card 4: Completed - 2017:226 -->
      <div 
        class="bg-[#1f1f1f] box-border flex flex-col gap-[8px] items-end overflow-clip p-[16px] relative rounded-[8px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] shrink-0 w-full" 
        data-node-id="2017:226"
      >
        <div 
          class="flex gap-[8px] items-center justify-end relative shrink-0 w-full" 
          data-node-id="2017:227"
        >
          <div 
            class="flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative shrink-0" 
            data-node-id="2017:228"
          >
            <div 
              class="border border-[#434343] border-solid box-border flex gap-[8px] h-[32px] items-center justify-center px-[16px] py-[4px] relative rounded-[8px] shrink-0 cursor-pointer" 
              data-name="Button" 
              data-node-id="2017:229"
              on:click={() => handleVisitAction('return', 4)}
              on:keydown={(e) => handleKeyDown(e, () => handleVisitAction('return', 4))}
              role="button"
              tabindex="0"
            >
              <p 
                class="font-['Heebo'] font-normal leading-[22px] relative shrink-0 text-[14px] text-[#ffffffe0] text-right" 
                dir="auto" 
                data-node-id="I2017:229;114:1809"
              >
                החזר לביצוע
              </p>
            </div>
          </div>
          <div 
            class="flex items-center relative shrink-0" 
            data-node-id="2017:230"
          >
            <div 
              class="box-border flex gap-[8px] h-[32px] items-center justify-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" 
              data-name="Button" 
              data-node-id="2017:231"
            >
              <div class="overflow-clip relative shrink-0 size-[16px]" data-name="🎰 icon" data-node-id="I2017:231;114:3106">
                <div class="absolute inset-[12.5%]" data-name="Vector" data-node-id="I2017:231;114:3106;71595:49945">
                  <div class="absolute inset-[-4.17%]">
                    <img alt="" class="block max-w-none size-full" src={img1} />
                  </div>
                </div>
              </div>
            </div>
            <div 
              class="flex flex-col font-['Heebo'] font-bold justify-center leading-[0] relative shrink-0 text-[16px] text-[#ffffffe0] text-right whitespace-nowrap" 
              data-node-id="2017:232"
            >
              <p class="leading-[24px]" dir="auto">
                אגמון החולה
              </p>
            </div>
          </div>
          <div 
            class="bg-[#ffffff05] border border-[#434343] border-solid box-border flex gap-[4px] items-center justify-center px-[8px] py-px relative rounded-[4px] shrink-0" 
            data-name="Tag__Status" 
            data-node-id="2017:233"
          >
            <p 
              class="font-['Heebo'] font-normal leading-[20px] relative shrink-0 text-[12px] text-[#ffffffe0] text-right" 
              dir="auto" 
              data-node-id="I2017:233;137:7897"
            >
              בוצע
            </p>
            <div class="overflow-clip relative shrink-0 size-[12px]" data-name="Icon" data-node-id="I2017:233;137:7896">
              <div class="absolute inset-[29.17%_16.67%_29.17%_20.83%]" data-name="Vector" data-node-id="I2017:233;137:7896;71595:49723">
                <div class="absolute inset-[-10%_-6.67%]">
                  <img alt="" class="block max-w-none size-full" src={img4} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div 
          class="flex gap-[12px] items-start justify-end leading-[0] relative shrink-0 text-[12px] text-[#ffffffe0]" 
          data-node-id="2017:234"
        >
          <div 
            class="flex flex-col font-['Heebo'] font-normal justify-center relative shrink-0 whitespace-nowrap" 
            data-node-id="2017:235"
          >
            <p class="leading-[20px]" dir="auto">
              ישראל ישראלי
            </p>
          </div>
          <div 
            class="flex flex-col font-['Heebo'] font-bold justify-center relative shrink-0 text-right w-[97px]" 
            data-node-id="2017:236"
          >
            <p class="leading-[20px] whitespace-pre-wrap" dir="auto">
              פקח אחראי
            </p>
          </div>
        </div>
      </div>

      <!-- Visit Card 5: Partially Completed - 2017:237 -->
      <div 
        class="bg-[#1f1f1f] box-border flex flex-col gap-[8px] items-end overflow-clip p-[16px] relative rounded-[8px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] shrink-0 w-full" 
        data-node-id="2017:237"
      >
        <div 
          class="flex gap-[8px] items-center justify-end relative shrink-0 w-full" 
          data-node-id="2017:238"
        >
          <div 
            class="flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative shrink-0" 
            data-node-id="2017:239"
          >
            <div 
              class="border border-[#434343] border-solid box-border flex gap-[8px] h-[32px] items-center justify-center px-[16px] py-[4px] relative rounded-[8px] shrink-0 cursor-pointer" 
              data-name="Button" 
              data-node-id="2017:240"
              on:click={() => handleVisitAction('return', 5)}
              on:keydown={(e) => handleKeyDown(e, () => handleVisitAction('return', 5))}
              role="button"
              tabindex="0"
            >
              <p 
                class="font-['Heebo'] font-normal leading-[22px] relative shrink-0 text-[14px] text-[#ffffffe0] text-right" 
                dir="auto" 
                data-node-id="I2017:240;114:1809"
              >
                החזר לביצוע
              </p>
            </div>
          </div>
          <div 
            class="flex items-center relative shrink-0" 
            data-node-id="2017:241"
          >
            <div 
              class="box-border flex gap-[8px] h-[32px] items-center justify-center px-[8px] py-[4px] relative rounded-[8px] shrink-0" 
              data-name="Button" 
              data-node-id="2017:242"
            >
              <div class="overflow-clip relative shrink-0 size-[16px]" data-name="🎰 icon" data-node-id="I2017:242;114:3106">
                <div class="absolute inset-[12.5%]" data-name="Vector" data-node-id="I2017:242;114:3106;71595:49945">
                  <div class="absolute inset-[-4.17%]">
                    <img alt="" class="block max-w-none size-full" src={img1} />
                  </div>
                </div>
              </div>
            </div>
            <div 
              class="flex flex-col font-['Heebo'] font-bold justify-center leading-[0] relative shrink-0 text-[16px] text-[#ffffffe0] text-right whitespace-nowrap" 
              data-node-id="2017:243"
            >
              <p class="leading-[24px]" dir="auto">
                אגמון החולה
              </p>
            </div>
          </div>
          <div 
            class="bg-[#ffffff05] border border-[#434343] border-solid box-border flex gap-[4px] items-center justify-center px-[8px] py-px relative rounded-[4px] shrink-0" 
            data-name="Tag__Status" 
            data-node-id="2017:244"
          >
            <p 
              class="font-['Heebo'] font-normal leading-[20px] relative shrink-0 text-[12px] text-[#ffffffe0] text-right" 
              dir="auto" 
              data-node-id="I2017:244;137:7901"
            >
              בוצע חלקית
            </p>
            <div class="overflow-clip relative shrink-0 size-[12px]" data-name="circle-minus" data-node-id="2005:117">
              <div class="absolute inset-[12.5%]" data-name="Vector" data-node-id="2005:118">
                <div class="absolute inset-[-2.78%]">
                  <img alt="" class="block max-w-none size-full" src={imgVector} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div 
          class="flex gap-[12px] items-start justify-end leading-[0] relative shrink-0 text-[12px] text-[#ffffffe0]" 
          data-node-id="2017:245"
        >
          <div 
            class="flex flex-col font-['Heebo'] font-normal justify-center relative shrink-0 whitespace-nowrap" 
            data-node-id="2017:246"
          >
            <p class="leading-[20px]" dir="auto">
              ישראל ישראלי
            </p>
          </div>
          <div 
            class="flex flex-col font-['Heebo'] font-bold justify-center relative shrink-0 text-right w-[97px]" 
            data-node-id="2017:247"
          >
            <p class="leading-[20px] whitespace-pre-wrap" dir="auto">
              פקח אחראי
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&display=swap');
  
  :global(body) {
    font-family: 'Heebo', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #000000;
    color: #ffffffe0;
  }
</style>
