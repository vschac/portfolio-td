<script>
  import StickySection from './StickySection.svelte'

  const items = [
    {
      meta: 'Jan - Jun 2026 · Co-op',
      title: 'Platform Engineer',
      bullets: [
        'Built a CDK-based disaster recovery pattern using AWS resources and streamlined the cold-deploy process for our application into an arbitrary AWS account. ',
        'Designed and deployed ElastiCache (Redis) caching layer, dramatically improving page load latency and improving scalability under peak traﬃc',
        'Built end-to-end on-call automations integrating Slack, Datadog, Notion, and Linear, reducing manual incident coordination and postmortem overhead',
        'Developed Apache Superset dashboards to monitor claims processing and internal KPIs, enabling data-driven decision making across operations',
      ],
      tags: ['Svelte', 'Node.js', 'TypeScript', 'AWS', 'Datadog', 'Postgres', 'Superset'],
    },
    {
      meta: 'Jan - Jun 2025 · Co-op',
      title: 'Lead Software Engineer',
      bullets: [
        'Accelerated all Fast-PT computations by 2–3x through a multi-tiered caching system',
        'Redesigned and modernized the API to enable seamless integration with cosmology software tools (e.g., CLASS, CAMB)',
        'Authored comprehensive documentation and implemented a unit testing framework (pytest) to improve maintainability and scientific reproducibility',
      ],
      tags: ['Python', 'Pytest', 'Numpy', 'Scipy', 'Jax'],
    },
  ]
</script>

<StickySection index="03" label="Experience">
  <div class="grid">
    {#each items as item, i}
      <div class="card">
        <div class="card-top">
          <span class="meta">{item.meta}</span>
          <h2 class="title">{item.title}</h2>
          <ul class="bullets">
            {#each item.bullets as bullet}<li>{bullet}</li>{/each}
          </ul>
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
    padding: 44px 48px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
  }

  .card-top {
    display: flex;
    flex-direction: column;
    gap: 16px;
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

  .bullets {
    font-size: 12px;
    line-height: 1.85;
    color: #E2DDD5;
    opacity: 0.62;
    margin: 0;
    padding-left: 16px;
    list-style: none;
  }

  .bullets li {
    position: relative;
    padding-left: 4px;
    margin-bottom: 8px;
  }

  .bullets li::before {
    content: '—';
    position: absolute;
    left: -16px;
    color: #3a3a37;
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
