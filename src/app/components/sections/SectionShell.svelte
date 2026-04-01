<script>
  import { fromAction } from 'svelte/attachments'

  const { index, label, minHeight = '100vh', children } = $props()

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
  {@attach fromAction(scrollReveal)}
  style="scroll-snap-align: start;
    width: 100%;
    min-height: {minHeight};
    background: #141413;
    border-top: 1px solid #1e1e1c;
    font-family: 'IBM Plex Mono', monospace;
    display: flex;
    flex-direction: column;
    padding: 52px 10% 80px;
    box-sizing: border-box;
  "
>
  <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 64px;">
    <span class="section-label">{label}</span>
    <span style="font-size: 10px; letter-spacing: 0.1em; color: #272724">{index}</span>
  </div>

  {@render children?.()}
</section>

<style>
  .section-label {
    font-size: 10px;
    letter-spacing: 0.2em;
    color: #3a3a37;
    text-transform: uppercase;
    display: block;
  }
</style>
