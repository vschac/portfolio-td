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

    // --- Smoke wisps ---
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    let w = 0, h = 0
    let raf: number

    function resize() {
      const rect = canvas.parentElement!.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Fill black so trail fade works from the start
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, h)
    }
    resize()
    window.addEventListener('resize', resize)

    function rand(lo: number, hi: number) { return lo + Math.random() * (hi - lo) }

    // Simple 2D noise — layered sine gives smooth organic flow
    function flowAngle(x: number, y: number, t: number): number {
      const scale = 0.0018 // controls how "zoomed in" the field is
      const s = scale
      return (
        Math.sin(x * s * 1.2 + y * s * 0.8 + t) *
        Math.cos(y * s * 1.4 - x * s * 0.5 + t * 0.7) +
        Math.sin(x * s * 0.6 - y * s * 1.6 + t * 0.4) * 0.5
      ) * Math.PI * 2
    }

    // Particle type — each wisp stores a trail of recent positions
    const TRAIL_LENGTH = 120 // how many past positions to keep

    type Wisp = {
      x: number; y: number
      trail: { x: number; y: number }[]
      speed: number
      width: number
      opacity: number
      offset: number
    }

    const WISP_COUNT = 5
    const wisps: Wisp[] = []

    function spawnWisp(): Wisp {
      const x = rand(w * 0.05, w * 0.95)
      const y = rand(h * 0.05, h * 0.95)
      return {
        x, y,
        trail: [{ x, y }],
        speed: rand(1.2, 2.4),
        width: rand(1.2, 2.5),
        opacity: rand(0.16, 0.32),
        offset: rand(0, 1000),
      }
    }

    for (let i = 0; i < WISP_COUNT; i++) wisps.push(spawnWisp())

    let t = 0

    function update() {
      t += 0.003
      for (let i = 0; i < wisps.length; i++) {
        const p = wisps[i]

        // Sample the flow field at this position
        const angle = flowAngle(p.x + p.offset, p.y + p.offset, t)
        p.x += Math.cos(angle) * p.speed
        p.y += Math.sin(angle) * p.speed

        // Push current position to trail
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > TRAIL_LENGTH) p.trail.shift()

        // Off-screen? Respawn
        const margin = 40
        if (p.x < -margin || p.x > w + margin || p.y < -margin || p.y > h + margin) {
          wisps[i] = spawnWisp()
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'

      for (const p of wisps) {
        const trail = p.trail
        if (trail.length < 2) continue

        // Draw trail as segments with fading opacity: bright at head, transparent at tail
        for (let j = 1; j < trail.length; j++) {
          const progress = j / trail.length // 0 = tail, 1 = head
          const alpha = p.opacity * progress * progress // quadratic falloff
          if (alpha < 0.005) continue

          ctx.beginPath()
          ctx.moveTo(trail[j - 1].x, trail[j - 1].y)
          ctx.lineTo(trail[j].x, trail[j].y)
          ctx.strokeStyle = `rgba(226, 221, 213, ${alpha})`
          ctx.lineWidth = p.width * (0.3 + 0.7 * progress) // thinner at tail
          ctx.stroke()
        }
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

  <!-- Smoke wisps canvas -->
  <canvas class="wisps-canvas" bind:this={canvas} aria-hidden="true"></canvas>

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

  .wisps-canvas {
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
    .wisps-canvas { display: none; }
  }
</style>
