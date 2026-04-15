<script>
  import StickySection from './StickySection.svelte'

  const items = [
    {
      meta: '2026 · Web',
      title: 'This Portfolio',
      body: 'Svelte + Vite site with a live WebRTC stream from a TouchDesigner generative system. Keypress signals route back to the TD network in real time.',
      tags: ['Svelte', 'WebRTC', 'TouchDesigner'],
    },
    {
      meta: '2025 · Generative Art',
      title: 'Generative Noise System',
      body: 'Placeholder — concept, how the visual system was constructed, and what made it interesting to build.',
      tags: ['TouchDesigner', 'GLSL', 'Feedback'],
    },
    {
      meta: '2024 · Audio',
      title: 'Music Visualizer',
      body: 'Placeholder — how it responds to audio, the rendering approach, and the aesthetic goal.',
      tags: ['WebAudio API', 'Canvas', 'JavaScript'],
    },
    {
      meta: '2024 · Tool',
      title: 'CLI Build Pipeline',
      body: 'Placeholder — what it automates, how it fits into a workflow, and why it was worth building from scratch.',
      tags: ['Go', 'Docker', 'CI/CD'],
    },
  ]
</script>

<StickySection index="04" label="Projects">
  <div class="grid">
    {#each items as item}
      <div class="card">
        <div class="card-top">
          <span class="meta">{item.meta}</span>
          <h2 class="title">{item.title}</h2>
          <p class="body">{item.body}</p>
        </div>
        <div class="tags">
          {#each item.tags as tag}<span class="tag">{tag}</span>{/each}
        </div>
      </div>
    {/each}
  </div>
</StickySection>

<style>
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
    font-family: 'IBM Plex Mono', monospace;
    flex: 1;
  }

  .card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 36px 40px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
  }

  .card-top {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .meta {
    font-size: 10px;
    letter-spacing: 0.16em;
    color: #6B6864;
    text-transform: uppercase;
  }

  .title {
    font-size: clamp(18px, 1.8vw, 26px);
    font-weight: 400;
    color: #E2DDD5;
    letter-spacing: 0.01em;
    margin: 0;
    line-height: 1.3;
  }

  .body {
    font-size: 12px;
    line-height: 1.85;
    color: #E2DDD5;
    opacity: 0.62;
    margin: 0;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 28px;
  }

  .tag {
    font-size: 9px;
    letter-spacing: 0.1em;
    color: #484845;
    border: 1px solid #1e1e1c;
    padding: 3px 8px;
    text-transform: uppercase;
  }
</style>
