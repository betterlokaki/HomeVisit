<script lang="ts">
  import { getImageUrl } from "../utils/imageMapper";
</script>

<!-- Header Section - Modernized with responsive units -->
<header
  class="box-border flex items-center justify-between px-1.5 py-0.75 relative rounded-lg shrink-0 w-full gap-1"
  style="background-color: #1A1A1A; border: 1px solid #434343;"
  data-name="header"
>
  <div
    class="flex flex-1 gap-1 items-center justify-start min-w-0 relative shrink-0"
  >
    <div class="text-base font-bold text-white truncate">ניהול בתים</div>
  </div>
  <div class="flex-shrink-0">
    <img
      alt="user profile"
      class="w-8 h-8 rounded-lg object-cover"
      style="border: 1px solid #434343;"
      src={getImageUrl(
        "https://www.figma.com/api/mcp/asset/fe3aad0c-1c04-41cd-9ffa-725ef1c483b6"
      )}
    />
  </div>
</header>

<style>
  header {
    direction: rtl;
  }
</style>
