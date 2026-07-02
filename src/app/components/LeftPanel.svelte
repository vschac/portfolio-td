<script lang="ts">
  import { onMount } from 'svelte'

  const C = {
    bg:      '#000000',
    fg:      '#E2DDD5',
    fgDim:   '#6B6864',
    fgFaint: '#3a3a37',
    border:  '#222220',
  }

  let time = $state('')

  // --- Name unscramble ---------------------------------------------------
  const TARGET1 = 'VINCENT'
  const TARGET2 = 'SCHACKNIES'
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@*+=-/<>'

  // Start fully resolved so there's no flash before JS runs / on SSR.
  let chars1 = $state(TARGET1.split('').map((c) => ({ c, done: true })))
  let chars2 = $state(TARGET2.split('').map((c) => ({ c, done: true })))

  let timers: ReturnType<typeof setInterval>[] = []
  let timeouts: ReturnType<typeof setTimeout>[] = []
  let scrambling = false
  let reduce = false

  function clearScramble() {
    timers.forEach(clearInterval)
    timeouts.forEach(clearTimeout)
    timers = []
    timeouts = []
  }

  function randGlyph() {
    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
  }

  function animateLine(target: string, assign: (a: { c: string; done: boolean }[]) => void) {
    let revealed = 0 // reveals ~one char every 2 ticks
    const render = () => {
      const cut = Math.floor(revealed)
      assign(
        target.split('').map((ch, i) => {
          if (ch === ' ') return { c: ' ', done: true }
          const done = i < cut
          return { c: done ? ch : randGlyph(), done }
        })
      )
      if (cut >= target.length) clearInterval(id)
    }
    const id = setInterval(() => {
      revealed += 0.5
      render()
    }, 45)
    timers.push(id)
    render()
  }

  // Decode the name into place (used on load and re-triggered on hover).
  function runScramble() {
    if (scrambling) return
    scrambling = true
    clearScramble()
    animateLine(TARGET1, (a) => (chars1 = a))
    const totalTicks = (TARGET1.length / 0.5) * 45
    timeouts.push(setTimeout(() => animateLine(TARGET2, (a) => (chars2 = a)), 240))
    // release the lock a touch after the second line finishes
    timeouts.push(setTimeout(() => (scrambling = false), 240 + totalTicks + 200))
  }

  // --- ASCII flow-field backdrop ----------------------------------------
  let canvasEl: HTMLCanvasElement

  onMount(() => {
    const tick = () => {
      time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
    tick()
    const clockId = setInterval(tick, 1000)

    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    let ro: ResizeObserver | null = null

    if (!reduce) {
      // kick off the name decode shortly after the entrance begins
      timeouts.push(setTimeout(runScramble, 350))

      if (canvasEl) {
        const ctx = canvasEl.getContext('2d')!
        const RAMP = ' ·:-=+*o#%@'
        const cell = 16
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        let cols = 0
        let rows = 0
        let t = 0

        const resize = () => {
          const r = canvasEl.getBoundingClientRect()
          canvasEl.width = Math.max(1, Math.floor(r.width * dpr))
          canvasEl.height = Math.max(1, Math.floor(r.height * dpr))
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
          cols = Math.ceil(r.width / cell)
          rows = Math.ceil(r.height / cell)
          ctx.font = '13px "IBM Plex Mono", monospace'
          ctx.textBaseline = 'top'
        }
        resize()
        ro = new ResizeObserver(resize)
        ro.observe(canvasEl)

        let last = 0
        const draw = (now: number) => {
          raf = requestAnimationFrame(draw)
          if (now - last < 66) return // ~15fps is plenty for this
          last = now

          const w = canvasEl.width / dpr
          const h = canvasEl.height / dpr
          ctx.clearRect(0, 0, w, h)
          t += 0.05

          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              const v =
                Math.sin(x * 0.28 + t) +
                Math.sin(y * 0.22 - t * 0.7) +
                Math.sin((x + y) * 0.16 + t * 0.5)
              const n = (v + 3) / 6 // 0..1
              const idx = Math.floor(n * (RAMP.length - 1))
              const ch = RAMP[idx]
              if (ch === ' ') continue
              ctx.fillStyle = `rgba(226,221,213,${(0.04 + n * 0.1).toFixed(3)})`
              ctx.fillText(ch, x * cell, y * cell)
            }
          }
        }
        raf = requestAnimationFrame(draw)
      }
    }

    return () => {
      clearInterval(clockId)
      clearScramble()
      if (raf) cancelAnimationFrame(raf)
      if (ro) ro.disconnect()
    }
  })
</script>

<div class="h-full flex flex-col" style="font-family: 'IBM Plex Mono', monospace; background: {C.bg}">

  <!-- Top bar -->
  <div class="flex items-center justify-between px-8 py-5 shrink-0" style="border-bottom: 1px solid {C.border}">
    <span style="font-size: 10px; letter-spacing: 0.14em; color: {C.fgDim}">Portfolio / 2026</span>
    <span style="font-size: 10px; letter-spacing: 0.06em; color: {C.fgFaint}">{time}</span>
  </div>

  <!-- Hero content -->
  <div class="relative flex-1 flex flex-col justify-center px-8 pb-16">

    <!-- ASCII flow-field backdrop -->
    <canvas bind:this={canvasEl} class="ascii-bg" aria-hidden="true"></canvas>

    <div class="hero-content">

      <!-- Name -->
      <div class="fade-up" style="animation-delay: 0.15s">
        <div
          class="name"
          role="img"
          aria-label="Vincent Schacknies"
          onmouseenter={runScramble}
          style="
            font-family: 'IBM Plex Sans Condensed', sans-serif;
            font-size: clamp(50px, 5.2vw, 74px);
            font-weight: 700;
            line-height: 0.9;
            letter-spacing: -0.02em;
            color: {C.fg};
            text-transform: uppercase;
          "
        ><span class="name-line">{#each chars1 as ch}<span class:done={ch.done}>{ch.c}</span>{/each}</span><br /><span class="name-line">{#each chars2 as ch}<span class:done={ch.done}>{ch.c}</span>{/each}</span></div>
      </div>

      <!-- Subtitle -->
      <div class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 fade-up" style="animation-delay: 0.32s">
        <span style="font-size: 11px; letter-spacing: 0.1em; color: {C.fgDim}">CS Student</span>
        <span style="color: {C.fgFaint}">·</span>
        <span style="font-size: 11px; letter-spacing: 0.1em; color: {C.fgDim}">Developer</span>
        <span style="color: {C.fgFaint}">·</span>
        <span style="font-size: 11px; letter-spacing: 0.1em; color: {C.fgDim}">Creative tech enthusiast</span>
      </div>

      <!-- Divider -->
      <div class="divider-line" style="height: 1px; background: {C.border}; margin-top: 48px; margin-bottom: 36px; max-width: 320px; animation-delay: 0.52s"></div>

      <!-- About label -->
      <div class="fade-up" style="animation-delay: 0.62s">
        <span class="section-label">About</span>
      </div>

      <!-- Bio -->
      <p class="mt-3 fade-up" style="font-size: 13px; line-height: 1.85; color: {C.fg}; opacity: 0.62; max-width: 460px; animation-delay: 0.75s">
        I study computer science and treat programming as a creative
        discipline. I like combining skills across disciplines with programming
        and systems design to create unique projects. The world is a very tech-driven
        place, and knowing how to express yourself in it is a valuable skill.
      </p>

    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-10 left-8 flex items-center gap-3 fade-in scroll-indicator" style="animation-delay: 1.2s">
      <div class="scroll-line-wrap"><div class="scroll-line-inner"></div></div>
      <span style="font-size: 10px; letter-spacing: 0.16em; color: {C.fgFaint}">scroll</span>
    </div>
  </div>
</div>

<style>
  @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes expandX { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes scrollLine { 0% { height: 0%; top: 0%; } 40% { height: 100%; top: 0%; } 80% { height: 0%; top: 100%; } 100% { height: 0%; top: 100%; } }

  .fade-up { opacity: 0; animation: fadeUp 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
  .fade-in { opacity: 0; animation: fadeIn 0.6s ease forwards; }
  .divider-line { transform: scaleX(0); transform-origin: left; animation: expandX 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
  .section-label { font-size: 10px; letter-spacing: 0.18em; color: #484845; text-transform: uppercase; display: block; }
  .scroll-line-wrap { position: relative; width: 1px; height: 28px; background: #3a3a37; overflow: hidden; }
  .scroll-line-inner { position: absolute; top: 0; left: 0; width: 100%; background: #6B6864; animation: scrollLine 2s ease-in-out infinite; }

  /* Stacking: content + scroll cue sit above the ASCII canvas */
  .hero-content { position: relative; z-index: 1; padding-left: 64px; }
  .scroll-indicator { z-index: 1; }

  .ascii-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    /* keep the field faint behind the name, stronger toward the edges */
    -webkit-mask-image: radial-gradient(ellipse 60% 70% at 42% 46%, transparent 0%, rgba(0,0,0,0.35) 42%, #000 80%);
            mask-image: radial-gradient(ellipse 60% 70% at 42% 46%, transparent 0%, rgba(0,0,0,0.35) 42%, #000 80%);
  }

  /* Name decode: unresolved glyphs sit dim, resolved letters glow up */
  .name { cursor: default; }
  .name-line { display: inline-block; }
  .name span { color: #6B6864; transition: color 0.25s ease; }
  .name span.done { color: #E2DDD5; }

  @media (prefers-reduced-motion: reduce) {
    .name span { color: #E2DDD5; transition: none; }
    .ascii-bg { display: none; }
  }
</style>
