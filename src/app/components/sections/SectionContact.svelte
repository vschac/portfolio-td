<script>
  const C = {
    fg:    '#E2DDD5',
    fgDim: '#6B6864',
  }

  const LINKS = [
    { label: 'GitHub',   href: 'https://github.com' },
    { label: 'Email',    href: 'mailto:you@example.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'CV',       href: '#' },
  ]
</script>

<section style="
  width: 100%;
  background: #141413;
  border-top: 1px solid #1e1e1c;
  font-family: 'IBM Plex Mono', monospace;
  padding: 52px 10% 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
">
  <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 40px;">
    <span class="section-label">Contact</span>
    <span style="font-size: 10px; letter-spacing: 0.1em; color: #272724">06</span>
  </div>

  <div style="display: flex; flex-direction: column;">
    {#each LINKS as l (l.label)}
      <a
        href={l.href}
        target={l.href.startsWith('http') ? '_blank' : undefined}
        rel="noreferrer"
        class="contact-link"
        style="color: {C.fg}"
      >
        <span style="display: inline-block; width: 16px; height: 1px; background: {C.fgDim}; flex-shrink: 0;"></span>
        {l.label}
      </a>
    {/each}
  </div>

  <div style="margin-top: auto; padding-top: 52px;">
    <span style="font-size: 10px; letter-spacing: 0.08em; color: #272724">All work © 2026</span>
  </div>
</section>

<style>
  .section-label {
    font-size: 10px;
    letter-spacing: 0.2em;
    color: #3a3a37;
    text-transform: uppercase;
    display: block;
  }

  .contact-link {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    letter-spacing: 0.04em;
    opacity: 0.55;
    text-decoration: none;
    padding-top: 8px;
    padding-bottom: 8px;
    transition: opacity 0.2s;
  }

  .contact-link:hover { opacity: 1; }
</style>
