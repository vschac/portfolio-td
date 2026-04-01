<script>
  import StickySection from './StickySection.svelte'

  const items = [
    {
      meta: '2026 · Still',
      title: 'Noise Field I',
      body: 'Placeholder — process, parameters explored, and what drew you to this output.',
      tags: ['TouchDesigner', 'Generative'],
    },
    {
      meta: '2025 · Motion',
      title: 'Feedback Loop Study',
      body: 'Placeholder — duration, key variables, and what surprised you about the result.',
      tags: ['TouchDesigner', 'GLSL', 'Video'],
    },
    {
      meta: '2024 · Experiment',
      title: 'Reaction-Diffusion',
      body: 'Placeholder — what you were exploring and how the results compared to expectations.',
      tags: ['GLSL', 'Shader', 'Simulation'],
    },
  ]
</script>

<StickySection index="05" label="Gallery">
  <div class="entries">
    {#each items as item, i}
      {#if i > 0}<div class="divider"></div>{/if}
      <div class="entry">
        <div class="left">
          <span class="meta">{item.meta}</span>
          <div class="tags">
            {#each item.tags as tag}<span class="tag">{tag}</span>{/each}
          </div>
        </div>
        <div class="right">
          <h2 class="title">{item.title}</h2>
          <p class="body">{item.body}</p>
        </div>
      </div>
    {/each}
  </div>
</StickySection>

<style>
  .entries {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .divider {
    height: 1px;
    background: #1e1e1c;
    margin: 28px 0;
  }

  .entry {
    display: flex;
    gap: 8%;
    align-items: flex-start;
    font-family: 'IBM Plex Mono', monospace;
  }

  .left {
    flex: 0 0 220px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 3px;
  }

  .meta {
    font-size: 10px;
    letter-spacing: 0.16em;
    color: #6B6864;
    text-transform: uppercase;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .tag {
    font-size: 9px;
    letter-spacing: 0.1em;
    color: #484845;
    border: 1px solid #1e1e1c;
    padding: 3px 8px;
    text-transform: uppercase;
  }

  .right {
    flex: 1;
  }

  .title {
    font-size: clamp(16px, 1.6vw, 22px);
    font-weight: 400;
    color: #E2DDD5;
    letter-spacing: 0.01em;
    margin: 0 0 10px;
    line-height: 1.3;
  }

  .body {
    font-size: 12px;
    line-height: 1.85;
    color: #E2DDD5;
    opacity: 0.62;
    margin: 0;
    max-width: 520px;
  }
</style>
