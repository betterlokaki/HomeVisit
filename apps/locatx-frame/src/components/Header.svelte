<script lang="ts">
  // Image assets from Figma
  const imgImage1 = "https://www.figma.com/api/mcp/asset/fe3aad0c-1c04-41cd-9ffa-725ef1c483b6";
</script>

<!-- Header Section - 2017:163 -->
<header 
  class="bg-[#141414] box-border flex items-start justify-between px-[24px] py-[12px] relative rounded-[8px] shrink-0 w-full" 
  data-name="header"
>
  <div 
    class="flex flex-[1_0_0] gap-[12px] items-center justify-end min-h-px min-w-px relative shrink-0" 
  >
    <div 
      class="box-border flex flex-[1_0_0] flex-col gap-[10px] items-start min-h-px min-w-px px-[8px] py-0 relative shrink-0" 
    >
      <div 
        class="flex gap-[16px] items-center relative shrink-0 w-full" 
        data-name="left side - header"
      >
        <div class="text-[14px] font-bold text-white">
          ניהול אתרים
        </div>
      </div>
    </div>
    <div class="h-[32px] shrink-0 w-[240px]" data-name="right side -header" />
    <div 
      class="flex flex-col gap-[10px] h-[58px] items-end relative shrink-0 w-[71px]" 
    >
      <div 
        class="aspect-[1430/1128] relative shrink-0 w-full" 
        data-name="image 1"
      >
        <img alt="user profile" class="absolute inset-0 max-w-none object-cover pointer-events-none size-full rounded-[8px]" src={imgImage1} />
      </div>
    </div>
  </div>
</header>

<style>
  header {
    direction: rtl;
  }
</style>
