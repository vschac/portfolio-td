<script>
  import { fromAction } from 'svelte/attachments'

  const { index, label, minHeight = '100vh', blendTop = false, children } = $props()

  function scrollReveal(node) {
    node.style.opacity = '0'
    node.style.transform = 'translateY(16px)'
    node.style.transition = 'opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.style.opacity = '1'
          node.style.transform = 'translateY(0)'
          observer.disconnect()
        }
      },
      { rootMargin: '-80px' }
    )
    observer.observe(node)
    return { destroy() { observer.disconnect() } }
  }
</script>

<section
  class="shell"
  style="min-height: {minHeight};"
>
  {#if blendTop}
    <div class="blend-top" aria-hidden="true"></div>
  {/if}
  <div class="inner" {@attach fromAction(scrollReveal)}>
    <div class="header">
      <span class="section-label">{label}</span>
      <span class="section-index">{index}</span>
    </div>
    {@render children?.()}
  </div>
</section>

<style>
  .shell {
    scroll-snap-align: start;
    width: 100%;
    position: relative;
    font-family: 'IBM Plex Mono', monospace;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: hidden;
    background:
      /* ghost layer — slightly off-scale for drift */
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
      /* base diamond grid */
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
      /* highlight variation layer */
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
  }

  /* Blur overlay to soften the pattern */
  .shell::before {
    content: '';
    position: absolute;
    inset: 0;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    z-index: 0;
    pointer-events: none;
  }


  .blend-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: linear-gradient(to bottom, #000000, transparent);
    pointer-events: none;
    z-index: 1;
  }

  .inner {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 52px 10% 80px;
  }

  .header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 64px;
  }

  .section-label {
    font-size: 10px;
    letter-spacing: 0.2em;
    color: #3a3a37;
    text-transform: uppercase;
    display: block;
  }

  .section-index {
    font-size: 10px;
    letter-spacing: 0.1em;
    color: #272724;
  }
</style>
