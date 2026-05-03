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
  let canvas: HTMLCanvasElement

  onMount(() => {
    // Clock
    const tick = () => {
      time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
    tick()
    const clockId = setInterval(tick, 1000)

    // --- Flowing lines ---
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    let w = 0, h = 0
    let raf: number

    function resize() {
      const rect = canvas.parentElement!.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // --- Line system ---
    const LINE_COUNT = 6
    // Shared flow bias — lines drift in a coherent diagonal direction
    const FLOW_ANGLE = Math.PI * -0.3
    const FLOW_BIAS = 0.28

    type Line = {
      pts: { x: number; y: number; vx: number; vy: number; phase: number }[]
      opacity: number
      width: number
      speed: number
    }
    const lines: Line[] = []

    function rand(lo: number, hi: number) { return lo + Math.random() * (hi - lo) }

    // long = true forces a line that spans ≥ 2/3 of the panel diagonal
    function spawnLine(onScreen = false, long = false): Line {
      const pts = []
      const diag = Math.hypot(w, h)
      // spread × 3 = total point span; for "long", ensure ≥ 2/3 of diagonal
      const minSpread = long ? diag * 0.25 : Math.max(160, diag * 0.12)
      const maxSpread = long ? diag * 0.38 : diag * 0.22
      const spread = rand(minSpread, maxSpread)

      const angle = FLOW_ANGLE + rand(-0.35, 0.35)

      // Centre of the curve sits inside the visible area
      const cx = onScreen ? rand(w * 0.2, w * 0.8) : rand(-w * 0.1, w * 1.1)
      const cy = onScreen ? rand(h * 0.2, h * 0.8) : rand(-h * 0.1, h * 1.1)

      // Place 4 control points centred on (cx,cy)
      for (let j = 0; j < 4; j++) {
        const t = (j - 1.5) // -1.5, -0.5, 0.5, 1.5  — symmetric around centre
        const wobble = long ? rand(-0.15, 0.15) : rand(-0.3, 0.3)
        pts.push({
          x: cx + Math.cos(angle + wobble) * spread * t,
          y: cy + Math.sin(angle + wobble) * spread * t,
          vx: Math.cos(FLOW_ANGLE) * FLOW_BIAS + rand(-0.10, 0.10),
          vy: Math.sin(FLOW_ANGLE) * FLOW_BIAS + rand(-0.10, 0.10),
          phase: rand(0, Math.PI * 2),
        })
      }
      return {
        pts,
        opacity: long ? rand(0.14, 0.26) : rand(0.12, 0.30),
        width: long ? rand(1.4, 2.6) : rand(1.2, 2.8),
        speed: rand(0.6, 1.2),
      }
    }

    // First two lines are always long sweeping arcs; the rest are medium
    for (let i = 0; i < LINE_COUNT; i++) {
      lines.push(spawnLine(true, i < 2))
    }

    let t = 0

    function update() {
      t += 0.006
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        for (const p of line.pts) {
          // Drift + sine wobble perpendicular to flow — gives organic curving
          const wobble = Math.sin(t * 1.2 + p.phase) * 0.14
          p.x += (p.vx + Math.sin(FLOW_ANGLE + Math.PI / 2) * wobble) * line.speed
          p.y += (p.vy + Math.cos(FLOW_ANGLE + Math.PI / 2) * wobble) * line.speed
        }

        // Off-screen? Respawn from an edge
        const allOff = line.pts.every(p =>
          p.x < -w * 0.3 || p.x > w * 1.3 || p.y < -h * 0.3 || p.y > h * 1.3
        )
        if (allOff) lines[i] = spawnLine(true, i < 2)
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'

      for (const line of lines) {
        const [p0, p1, p2, p3] = line.pts

        // Gradient stroke: fade in from start, fade out at end
        const grad = ctx.createLinearGradient(p0.x, p0.y, p3.x, p3.y)
        const c = `226, 221, 213`
        grad.addColorStop(0,    `rgba(${c}, 0)`)
        grad.addColorStop(0.15, `rgba(${c}, ${line.opacity})`)
        grad.addColorStop(0.5,  `rgba(${c}, ${line.opacity})`)
        grad.addColorStop(0.85, `rgba(${c}, ${line.opacity})`)
        grad.addColorStop(1,    `rgba(${c}, 0)`)

        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y)
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)
        ctx.strokeStyle = grad
        ctx.lineWidth = line.width
        ctx.stroke()
      }
    }

    function loop() {
      update()
      draw()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      clearInterval(clockId)
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  })
</script>

<div class="hero-root h-full flex flex-col" style="font-family: 'IBM Plex Mono', monospace; background: {C.bg}">

  <!-- Flowing lines canvas -->
  <canvas class="lines-canvas" bind:this={canvas} aria-hidden="true"></canvas>

  <!-- Top bar -->
  <div class="hero-content flex items-center justify-between px-8 py-5 shrink-0" style="border-bottom: 1px solid {C.border}">
    <span style="font-size: 10px; letter-spacing: 0.14em; color: {C.fgDim}">Portfolio / 2026</span>
    <span style="font-size: 10px; letter-spacing: 0.06em; color: {C.fgFaint}">{time}</span>
  </div>

  <!-- Hero content -->
  <div class="hero-content relative flex-1 flex flex-col justify-center px-8 pb-16">

    <!-- Name -->
    <div class="fade-up" style="animation-delay: 0.15s">
      <div style="
        font-family: 'IBM Plex Sans Condensed', sans-serif;
        font-size: clamp(50px, 5.2vw, 74px);
        font-weight: 700;
        line-height: 0.9;
        letter-spacing: -0.02em;
        color: {C.fg};
        text-transform: uppercase;
      ">VINCENT<br />SCHACKNIES</div>
    </div>

    <!-- Subtitle -->
    <div class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 fade-up" style="animation-delay: 0.32s">
      <span style="font-size: 11px; letter-spacing: 0.1em; color: {C.fgDim}">CS Student</span>
      <span style="color: {C.fgFaint}">·</span>
      <span style="font-size: 11px; letter-spacing: 0.1em; color: {C.fgDim}">Developer</span>
      <span style="color: {C.fgFaint}">·</span>
      <span style="font-size: 11px; letter-spacing: 0.1em; color: {C.fgDim}">Artist</span>
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

    <!-- Scroll indicator -->
    <div class="absolute bottom-10 left-8 flex items-center gap-3 fade-in" style="animation-delay: 1.2s">
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

  .hero-root { position: relative; overflow: hidden; }

  .lines-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .hero-content { position: relative; z-index: 1; }

  .fade-up { opacity: 0; animation: fadeUp 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
  .fade-in { opacity: 0; animation: fadeIn 0.6s ease forwards; }
  .divider-line { transform: scaleX(0); transform-origin: left; animation: expandX 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
  .section-label { font-size: 10px; letter-spacing: 0.18em; color: #484845; text-transform: uppercase; display: block; }
  .scroll-line-wrap { position: relative; width: 1px; height: 28px; background: #3a3a37; overflow: hidden; }
  .scroll-line-inner { position: absolute; top: 0; left: 0; width: 100%; background: #6B6864; animation: scrollLine 2s ease-in-out infinite; }

  @media (prefers-reduced-motion: reduce) {
    .lines-canvas { display: none; }
  }
</style>
