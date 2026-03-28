<script lang="ts">
  import { onMount } from 'svelte'

  const C = {
    bg:      '#141413',
    fg:      '#E2DDD5',
    fgDim:   '#6B6864',
    fgFaint: '#3a3a37',
    border:  '#222220',
  }

  let time = $state('')

  onMount(() => {
    const tick = () => {
      time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
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
      discipline. My work sits at the boundary between systems thinking
      and visual expression — from low-level code to generative graphics.
      I believe the most interesting problems live at the intersection of
      rigour and intuition.
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

  .fade-up { opacity: 0; animation: fadeUp 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
  .fade-in { opacity: 0; animation: fadeIn 0.6s ease forwards; }
  .divider-line { transform: scaleX(0); transform-origin: left; animation: expandX 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
  .section-label { font-size: 10px; letter-spacing: 0.18em; color: #484845; text-transform: uppercase; display: block; }
  .scroll-line-wrap { position: relative; width: 1px; height: 28px; background: #3a3a37; overflow: hidden; }
  .scroll-line-inner { position: absolute; top: 0; left: 0; width: 100%; background: #6B6864; animation: scrollLine 2s ease-in-out infinite; }
</style>
