<script>
  const { index, label, children } = $props()
</script>

<div class="panel">

    <div class="header">
      <span class="section-label">{label}</span>
      <span class="section-index">{index}</span>
    </div>

    <div class="content">
      {@render children?.()}
    </div>

  </div>

<style>
  .panel {
    scroll-snap-align: start;
    min-height: 100vh;
    background-color: #141413;
    background-image: radial-gradient(circle, #252523 1.5px, transparent 1.5px);
    background-size: 28px 28px;
    background-attachment: fixed;
    border-top: 1px solid #1e1e1c;
    font-family: 'IBM Plex Mono', monospace;
    display: flex;
    flex-direction: column;
    padding: 52px 10% 72px;
    box-sizing: border-box;
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 52px;
    flex-shrink: 0;
  }

  .section-label {
    font-size: 10px;
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
