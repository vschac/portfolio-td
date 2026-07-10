<script>
  import { onMount } from 'svelte'

  // ── Links ────────────────────────────────────────────────────────────

  const LINKS = [
    { label: 'GitHub',   href: 'https://github.com/vschac' },
    { label: 'Email',    href: 'mailto:vincent.schacknies@icloud.com' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/vschacknies' },
    { label: 'Resume',   href: '/resume.pdf' },
  ]

  // ── Glyph decode on hover (echoes the hero name-unscramble) ────────────
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@*+=-/<>'
  const randGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]

  let labels = $state(LINKS.map((l) => l.label.split('').map((c) => ({ c, done: true }))))
  let reduce = false
  const activeTimers = new Map()

  function decode(i) {
    if (reduce) return
    const target = LINKS[i].label
    clearInterval(activeTimers.get(i))
    let revealed = 0
    const render = () => {
      const cut = Math.floor(revealed)
      labels[i] = target.split('').map((ch, j) => {
        const done = j < cut
        return { c: done ? ch : randGlyph(), done }
      })
      if (cut >= target.length) clearInterval(activeTimers.get(i))
    }
    const id = setInterval(() => { revealed += 0.5; render() }, 40)
    activeTimers.set(i, id)
    render()
  }

  // ── Live clock (echoes the hero top bar) ───────────────────────────────
  let time = $state('')

  onMount(() => {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tick = () => {
      time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
    tick()
    const clockId = setInterval(tick, 1000)
    return () => {
      clearInterval(clockId)
      activeTimers.forEach(clearInterval)
    }
  })
</script>

<footer class="foot">
  <!-- Frosted panel — same blur treatment as the project/experience cards,
       floating over the continued diamond grid -->
  <div class="panel">
    <div class="inner">

      <!-- Left: identity -->
      <div class="left">
        <span class="tag">Vincent Schacknies</span>
        <span class="sub">Contact Information</span>
      </div>

      <!-- Right: links -->
      <nav class="links">
        {#each LINKS as l, i (l.label)}
          <a
            href={l.href}
            target={l.href.startsWith('http') || l.href.endsWith('.pdf') ? '_blank' : undefined}
            rel="noreferrer"
            class="link"
            onmouseenter={() => decode(i)}
          >{#each labels[i] as ch}<span class:done={ch.done}>{ch.c}</span>{/each}</a>
        {/each}
      </nav>

    </div>

    <!-- Baseline bar -->
    <div class="baseline">
      <span class="meta">All work &copy; 2026</span>
      <span class="time">{time}</span>
    </div>
  </div>
</footer>

<style>
  .foot {
    width: 100%;
    font-family: 'IBM Plex Mono', monospace;
    box-sizing: border-box;
    /* short footer below a full-viewport snap section — make its
       bottom a valid snap target so it's reachable under `y mandatory` */
    scroll-snap-align: end;
    /* — the signature diamond grid, continued from StickySection.
       background-attachment: fixed keeps it aligned with the sections above — */
    background:
      repeating-linear-gradient(62deg,#0000 calc(-650% / 13) calc(50% / 13),#0a0a09 0 calc(100% / 13),#0000 0 calc(150% / 13),#0b0b0a 0 calc(200% / 13),#0000 0 calc(250% / 13),#0a0a09 0 calc(300% / 13)) 0px 0px,
      repeating-linear-gradient(62deg,#0000 calc(-650% / 13) calc(50% / 13),#0a0a09 0 calc(100% / 13),#0000 0 calc(150% / 13),#0b0b0a 0 calc(200% / 13),#0000 0 calc(250% / 13),#0a0a09 0 calc(300% / 13)) 26px 44px,
      repeating-linear-gradient(-62deg,#0000 calc(-650% / 13) calc(50% / 13),#0a0a09 0 calc(100% / 13),#0000 0 calc(150% / 13),#0b0b0a 0 calc(200% / 13),#0000 0 calc(250% / 13),#0a0a09 0 calc(300% / 13)) 0px 0px,
      repeating-linear-gradient(-62deg,#0000 calc(-650% / 13) calc(50% / 13),#0a0a09 0 calc(100% / 13),#0000 0 calc(150% / 13),#0b0b0a 0 calc(200% / 13),#0000 0 calc(250% / 13),#0a0a09 0 calc(300% / 13)) 26px 44px,
      repeating-linear-gradient(62deg,#0000 calc(-650% / 13) calc(50% / 13),#161514 0 calc(100% / 13),#0000 0 calc(150% / 13),#131211 0 calc(200% / 13),#0000 0 calc(250% / 13),#100f0f 0 calc(300% / 13)) 0px 0px,
      repeating-linear-gradient(62deg,#0000 calc(-650% / 13) calc(50% / 13),#100f0f 0 calc(100% / 13),#0000 0 calc(150% / 13),#161514 0 calc(200% / 13),#0000 0 calc(250% / 13),#131211 0 calc(300% / 13)) 24px 40px,
      repeating-linear-gradient(-62deg,#0000 calc(-650% / 13) calc(50% / 13),#131211 0 calc(100% / 13),#0000 0 calc(150% / 13),#100f0f 0 calc(200% / 13),#0000 0 calc(250% / 13),#161514 0 calc(300% / 13)) 0px 0px,
      repeating-linear-gradient(-62deg,#0000 calc(-650% / 13) calc(50% / 13),#161514 0 calc(100% / 13),#0000 0 calc(150% / 13),#131211 0 calc(200% / 13),#0000 0 calc(250% / 13),#100f0f 0 calc(300% / 13)) 24px 40px,
      repeating-linear-gradient(62deg,#0000 calc(-650% / 13) calc(50% / 13),#1a191800 0 calc(100% / 13),#0000 0 calc(150% / 13),#1c1b19 0 calc(200% / 13),#0000 0 calc(250% / 13)) 12px 20px #0f0f0e;
    background-size:
      52px 88px,52px 88px,52px 88px,52px 88px,
      48px 80px,48px 80px,48px 80px,48px 80px,
      96px 160px;
    background-attachment: fixed;
  }

  /* frosted glass over the grid — mirrors the project/experience cards */
  .panel {
    padding: 40px 10% 24px;
    box-sizing: border-box;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
  }

  .inner {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 28px;
  }

  /* — identity — */
  .left {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tag {
    font-family: 'IBM Plex Sans Condensed', sans-serif;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #E2DDD5;
  }

  .sub {
    font-size: 11px;
    letter-spacing: 0.04em;
    color: #6B6864;
    opacity: 0.85;
  }

  /* — links — */
  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 28px;
  }

  .link {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    padding-bottom: 3px;
    border-bottom: 1px solid transparent;
    transition: border-color 0.25s ease;
  }
  .link:hover { border-bottom-color: #33322f; }

  /* undecoded glyphs sit dim, resolved letters glow up — like the hero name */
  .link span { color: #6B6864; transition: color 0.2s ease; }
  .link span.done { color: #E2DDD5; }

  /* — baseline — */
  .baseline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 36px;
    padding-top: 18px;
    border-top: 1px solid #1e1e1c;
  }

  .meta {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #3a3a37;
  }

  .time {
    font-size: 10px;
    letter-spacing: 0.06em;
    color: #272724;
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 640px) {
    .inner { flex-direction: column; align-items: flex-start; }
    .links { gap: 20px; }
  }
</style>
