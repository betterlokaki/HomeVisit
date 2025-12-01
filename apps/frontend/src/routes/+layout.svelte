<script>
  import "../app.css";
</script>

<slot />

<style>
  /* Local Heebo font - Hebrew subset */
  @font-face {
    font-family: "Heebo";
    font-style: normal;
    font-weight: 400 700;
    font-display: swap;
    src: url("/fonts/heebo-hebrew.woff2") format("woff2");
    unicode-range: U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC,
      U+FB1D-FB4F;
  }

  /* Local Heebo font - Latin subset */
  @font-face {
    font-family: "Heebo";
    font-style: normal;
    font-weight: 400 700;
    font-display: swap;
    src: url("/fonts/heebo-latin.woff2") format("woff2");
    unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
      U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191,
      U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
  }

  :global(html) {
    direction: rtl;
  }

  :global(body) {
    font-family: "Heebo", sans-serif;
    margin: 0;
    padding: 0;
    background-color: #1a1a1a;
    color: #ffffffe0;
    direction: rtl;
  }
</style>
