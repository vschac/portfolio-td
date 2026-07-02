<script>
  const { index, label, children } = $props()
</script>

<div class="panel">
  <div class="inner">
    <div class="header">
      <span class="section-label">{label}</span>
      <span class="section-index">{index}</span>
    </div>

    <div class="content">
      {@render children?.()}
    </div>
  </div>
</div>

<style>
  .panel {
    scroll-snap-align: start;
    min-height: 100vh;
    background:
      /* — ghost layer: same structure, slightly off-scale, darker — */
      repeating-linear-gradient(
          62deg,
          #0000 calc(-650% / 13) calc(50% / 13),
          #0a0a09 0 calc(100% / 13),
          #0000 0 calc(150% / 13),
          #0b0b0a 0 calc(200% / 13),
          #0000 0 calc(250% / 13),
          #0a0a09 0 calc(300% / 13)
        ) 0px 0px,
      repeating-linear-gradient(
          62deg,
          #0000 calc(-650% / 13) calc(50% / 13),
          #0a0a09 0 calc(100% / 13),
          #0000 0 calc(150% / 13),
          #0b0b0a 0 calc(200% / 13),
          #0000 0 calc(250% / 13),
          #0a0a09 0 calc(300% / 13)
        ) 26px 44px,
      repeating-linear-gradient(
          -62deg,
          #0000 calc(-650% / 13) calc(50% / 13),
          #0a0a09 0 calc(100% / 13),
          #0000 0 calc(150% / 13),
          #0b0b0a 0 calc(200% / 13),
          #0000 0 calc(250% / 13),
          #0a0a09 0 calc(300% / 13)
        ) 0px 0px,
      repeating-linear-gradient(
          -62deg,
          #0000 calc(-650% / 13) calc(50% / 13),
          #0a0a09 0 calc(100% / 13),
          #0000 0 calc(150% / 13),
          #0b0b0a 0 calc(200% / 13),
          #0000 0 calc(250% / 13),
          #0a0a09 0 calc(300% / 13)
        ) 26px 44px,
      /* — base diamond grid — */
      repeating-linear-gradient(
          62deg,
          #0000 calc(-650% / 13) calc(50% / 13),
          #161514 0 calc(100% / 13),
          #0000 0 calc(150% / 13),
          #131211 0 calc(200% / 13),
          #0000 0 calc(250% / 13),
          #100f0f 0 calc(300% / 13)
        ) 0px 0px,
      repeating-linear-gradient(
          62deg,
          #0000 calc(-650% / 13) calc(50% / 13),
          #100f0f 0 calc(100% / 13),
          #0000 0 calc(150% / 13),
          #161514 0 calc(200% / 13),
          #0000 0 calc(250% / 13),
          #131211 0 calc(300% / 13)
        ) 24px 40px,
      repeating-linear-gradient(
          -62deg,
          #0000 calc(-650% / 13) calc(50% / 13),
          #131211 0 calc(100% / 13),
          #0000 0 calc(150% / 13),
          #100f0f 0 calc(200% / 13),
          #0000 0 calc(250% / 13),
          #161514 0 calc(300% / 13)
        ) 0px 0px,
      repeating-linear-gradient(
          -62deg,
          #0000 calc(-650% / 13) calc(50% / 13),
          #161514 0 calc(100% / 13),
          #0000 0 calc(150% / 13),
          #131211 0 calc(200% / 13),
          #0000 0 calc(250% / 13),
          #100f0f 0 calc(300% / 13)
        ) 24px 40px,
      /* — highlight variation layer — */
      repeating-linear-gradient(
          62deg,
          #0000 calc(-650% / 13) calc(50% / 13),
          #1a191800 0 calc(100% / 13),
          #0000 0 calc(150% / 13),
          #1c1b19 0 calc(200% / 13),
          #0000 0 calc(250% / 13)
        ) 12px 20px #0f0f0e;
    background-size:
      52px 88px, 52px 88px, 52px 88px, 52px 88px,
      48px 80px, 48px 80px, 48px 80px, 48px 80px,
      96px 160px;
    background-attachment: fixed;
    font-family: 'IBM Plex Mono', monospace;
    overflow: hidden;
  }

  .inner {
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    padding: 52px 5% 72px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 52px;
    flex-shrink: 0;
  }

  .section-label {
    font-size: 14px;
    letter-spacing: 0.2em;
    color: #3a3a37;
    text-transform: uppercase;
  }

  .section-index {
    font-size: 10px;
    letter-spacing: 0.1em;
    color: #272724;
  }

  .content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
