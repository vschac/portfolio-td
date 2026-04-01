<script>
  import StickySection from './StickySection.svelte'

  const items = [
    {
      meta: 'Summer 2025 · Internship',
      title: 'Software Engineer Intern',
      body: 'Placeholder — company, role, and what you shipped.',
      tags: ['React', 'Node.js', 'TypeScript'],
    },
    {
      meta: 'Fall 2024 · Research',
      title: 'Undergraduate Research Assistant',
      body: 'Placeholder — research focus, contributions, and outcomes.',
      tags: ['Python', 'PyTorch', 'Data Analysis'],
    },
    {
      meta: '2023 – Present · Independent',
      title: 'Freelance Developer',
      body: 'Placeholder — types of work, clients, and what you built.',
      tags: ['Svelte', 'TouchDesigner', 'WebRTC'],
    },
  ]
</script>

<StickySection index="03" label="Experience">
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
