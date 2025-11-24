<script>
  import "../app.css";
</script>

<slot />

<style>
  @import url("https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&display=swap");

  :global(html) {
    direction: rtl;
  }

  :global(body) {
    font-family: "Heebo", sans-serif;
    margin: 0;
    padding: 0;
    background-color: #000000;
    color: #ffffffe0;
    direction: rtl;
  }
</style>
