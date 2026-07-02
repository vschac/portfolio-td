<script>
  import StickySection from './StickySection.svelte'

  const items = [
    {
      meta: '2026 · Web + systems',
      title: 'This Portfolio',
      body: 'Svelte app with a live WebRTC stream from a TouchDesigner generative system. Keypress signals route back to the TD network in real time. The intermediary signaling server is self-hosted and connects to Vercel via a funnel.',
      tags: ['Svelte', 'WebRTC', 'TouchDesigner'],
    },
    {
      meta: '2025 · Dev Tools',
      title: 'Vit',
      body: 'A version control software written in C++ following the Git object model that provides AI powered features such as adding comments, generating reviews, and splitting large commits into smaller descriptive ones.',
      tags: ['C++', 'Ollama', 'OpenAI API'],
    },
    {
      meta: '2025 · Scientific Computing',
      title: 'JaxPT',
      body: 'A diﬀerential perturbation theory calculator for cosmology research written in Python. JAX-PT is a re-write of the FAST-PT codebase to leverage Jax’s autodiﬀerentiation, GPU acceleration, and JIT compilation, providing up to 100x',
      tags: ['Python', 'Jax', 'Numpy'],
    },
    {
      meta: '2025 · Mobile',
      title: 'KTP Member App',
      body: 'Contributed to the development of a React Native mobile app for the national Kappa Theta Pi technical fraternity, enabling members to access resources, events, and community updates for their chapter.',
      tags: ['React Native', 'Typescript', 'Expo'],
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
