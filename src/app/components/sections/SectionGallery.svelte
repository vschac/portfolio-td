<script>
  import StickySection from './StickySection.svelte'

  // Drop any image into src/assets/gallery/ — it shows up automatically.
  const modules = import.meta.glob(
    '../../../assets/gallery/*.{jpg,jpeg,png,webp,avif,svg,JPG,JPEG,PNG,WEBP,AVIF,SVG}',
    { eager: true, query: '?url', import: 'default' }
  )
  const photos = Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, url]) => ({
      url,
      name: path.split('/').pop().replace(/\.[^.]+$/, ''),
      ratio: 1.5, // placeholder until loaded
    }))

  const ROWS = 2
  const COLOR_CACHE_KEY = 'gallery:colors:v1'

  let aspects = $state({})
  let colorMap = $state({}) // { url: { h, s, l, hex } }

  // Hydrate color cache from localStorage — avoids re-sampling on repeat visits.
  try {
    const cached = localStorage.getItem(COLOR_CACHE_KEY)
    if (cached) colorMap = JSON.parse(cached)
  } catch {}

  // --- color sampling -----------------------------------------------------

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const l = (max + min) / 2
    let h = 0, s = 0
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }
    return [h, s, l]
  }

  function hslToHex(h, s, l) {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    let r, g, b
    if (s === 0) r = g = b = l
    else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }
    const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0')
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  function sampleColor(url) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        try {
          const size = 48
          const c = document.createElement('canvas')
          c.width = size; c.height = size
          const ctx = c.getContext('2d', { willReadFrequently: true })
          ctx.drawImage(img, 0, 0, size, size)
          const { data } = ctx.getImageData(0, 0, size, size)
          let r = 0, g = 0, b = 0, n = 0
          for (let i = 0; i < data.length; i += 4) {
            r += data[i]; g += data[i+1]; b += data[i+2]; n++
          }
          r /= n; g /= n; b /= n
          const [h, s, l] = rgbToHsl(r, g, b)
          // accent = same hue, clamped saturation/lightness so it reads as
          // a quiet tint instead of a blown-out color.
          const hex = hslToHex(h, Math.min(s * 1.2, 0.55), 0.5)
          resolve({ h, s, l, hex })
        } catch {
          resolve({ h: 0, s: 0, l: 0.5, hex: '#2a2a27' })
        }
      }
      img.onerror = () => resolve({ h: 0, s: 0, l: 0.5, hex: '#2a2a27' })
      img.src = url
    })
  }

  // Preload images — one pass for aspect ratio + color sampling.
  $effect(() => {
    let cancelled = false

    const run = async () => {
      for (const p of photos) {
        if (cancelled) break
        if (!aspects[p.url]) {
          // natural dimensions
          await new Promise((res) => {
            const img = new Image()
            img.onload = () => {
              if (img.naturalWidth && img.naturalHeight) {
                aspects = { ...aspects, [p.url]: img.naturalWidth / img.naturalHeight }
              }
              res()
            }
            img.onerror = res
            img.src = p.url
          })
        }
        if (!colorMap[p.url]) {
          const c = await sampleColor(p.url)
          if (!cancelled) colorMap = { ...colorMap, [p.url]: c }
        }
      }
      if (!cancelled) {
        try {
          localStorage.setItem(COLOR_CACHE_KEY, JSON.stringify(colorMap))
        } catch {}
      }
    }

    const idle = typeof window.requestIdleCallback === 'function'
      ? window.requestIdleCallback
      : (cb) => setTimeout(cb, 1)
    idle(run)

    return () => { cancelled = true }
  })

  // --- layout --------------------------------------------------------------

  // Sort by lightness (dark → bright), then greedy-distribute into N rows
  // balanced by total aspect-ratio width. Interweaves orientations naturally.
  const rows = $derived.by(() => {
    const sorted = [...photos].sort((a, b) => {
      const la = colorMap[a.url]?.l ?? 0.5
      const lb = colorMap[b.url]?.l ?? 0.5
      return la - lb
    })
    const r = Array.from({ length: ROWS }, () => [])
    const w = new Array(ROWS).fill(0)
    for (const p of sorted) {
      const ratio = aspects[p.url] ?? p.ratio
      let shortest = 0
      for (let i = 1; i < ROWS; i++) if (w[i] < w[shortest]) shortest = i
      r[shortest].push({
        ...p,
        ratio,
        accent: colorMap[p.url]?.hex ?? '#1e1e1c',
      })
      w[shortest] += ratio
    }
    return r
  })

  // Expanded state — fullscreen single-photo zoom
  let zoomed = $state(null)
  function closeZoom() { zoomed = null }
  function onKey(e) {
    if (zoomed && e.key === 'Escape') closeZoom()
  }

  // Scroll progress indicator
  let scroller = $state(null)
  let progress = $state(0)
  function onScroll() {
    if (!scroller) return
    const max = scroller.scrollWidth - scroller.clientWidth
    progress = max > 0 ? scroller.scrollLeft / max : 0
  }

  // Translate vertical wheel to horizontal scroll so trackpad/mouse users
  // can scroll through without needing shift.
  function onWheel(e) {
    if (!scroller) return
    // Only hijack when vertical delta dominates (normal scroll wheel);
    // leave real horizontal gestures untouched.
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      scroller.scrollLeft += e.deltaY
      e.preventDefault()
    }
  }
</script>

<svelte:window onkeydown={onKey} />

<StickySection index="05" label="Gallery">
  {#if photos.length === 0}
    <div class="empty">
      <span class="empty-meta">// no photos yet</span>
      <p class="empty-body">
        Drop images into <code>src/assets/gallery/</code> and they'll appear here.
      </p>
    </div>
  {:else}
    <div
      class="scroller"
      bind:this={scroller}
      onscroll={onScroll}
      onwheel={onWheel}
    >
      {#each rows as row}
        <div class="row">
          {#each row as photo (photo.url)}
            <button
              class="cell"
              style="aspect-ratio: {photo.ratio}; --accent: {photo.accent};"
              onclick={() => (zoomed = photo)}
              aria-label={`Open ${photo.name}`}
            >
              <img src={photo.url} alt={photo.name} loading="lazy" />
            </button>
          {/each}
        </div>
      {/each}
    </div>

    <div class="footer">
      <span class="count">{photos.length} frames</span>
      <div class="progress">
        <div class="progress-bar" style="transform: scaleX({progress});"></div>
      </div>
      <span class="hint">scroll →</span>
    </div>
  {/if}
</StickySection>

{#if zoomed}
  <div class="zoom" onclick={closeZoom} role="dialog" aria-modal="true">
    <img src={zoomed.url} alt={zoomed.name} onclick={(e) => e.stopPropagation()} />
    <div class="zoom-meta">
      <span class="zoom-name">{zoomed.name}</span>
      <button class="zoom-close" onclick={closeZoom}>close ✕</button>
    </div>
  </div>
{/if}

<style>
  /* ---------- mosaic ---------- */
  .scroller {
    --row-h: clamp(180px, 32vh, 320px);
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-x: auto;
    overflow-y: hidden;
    width: 100%;
    scrollbar-width: thin;
    scrollbar-color: #2a2a27 transparent;
  }
  .scroller::-webkit-scrollbar { height: 4px; }
  .scroller::-webkit-scrollbar-track { background: transparent; }
  .scroller::-webkit-scrollbar-thumb { background: #2a2a27; }
  .scroller::-webkit-scrollbar-thumb:hover { background: #3a3a37; }

  .row {
    display: flex;
    gap: 10px;
    height: var(--row-h);
    width: max-content;
    flex-shrink: 0;
  }

  .cell {
    position: relative;
    height: 100%;
    width: auto;
    flex: 0 0 auto;
    padding: 0;
    border: 1px solid #1e1e1c;
    background: #0e0e0d;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.4s ease, box-shadow 0.4s ease;
  }
  .cell:hover {
    border-color: var(--accent, #3a3a37);
    box-shadow: 0 0 0 1px var(--accent, #3a3a37);
  }

  .cell img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    display: block;
    filter: grayscale(0.12) contrast(1.02);
    transition: filter 0.4s ease, transform 0.6s ease;
  }
  .cell:hover img {
    filter: grayscale(0) contrast(1.05);
    transform: scale(1.02);
  }

  /* ---------- footer ---------- */
  .footer {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-top: 18px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.16em;
    color: #484845;
    text-transform: uppercase;
    flex-shrink: 0;
  }
  .count, .hint { flex-shrink: 0; }

  .progress {
    flex: 1;
    height: 1px;
    background: #1e1e1c;
    overflow: hidden;
  }
  .progress-bar {
    height: 100%;
    width: 100%;
    background: #6B6864;
    transform-origin: left center;
    transform: scaleX(0);
    transition: transform 0.1s linear;
  }

  /* ---------- empty ---------- */
  .empty {
    font-family: 'IBM Plex Mono', monospace;
    color: #6B6864;
  }
  .empty-meta {
    font-size: 10px;
    letter-spacing: 0.16em;
    color: #484845;
    text-transform: uppercase;
  }
  .empty-body {
    margin: 10px 0 0;
    font-size: 12px;
    opacity: 0.7;
  }
  .empty-body code {
    color: #E2DDD5;
    background: #1e1e1c;
    padding: 2px 6px;
    font-size: 11px;
  }

  /* ---------- zoom ---------- */
  .zoom {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(10, 10, 9, 0.96);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 40px;
    box-sizing: border-box;
    cursor: zoom-out;
    animation: fade 0.25s ease;
    font-family: 'IBM Plex Mono', monospace;
  }
  @keyframes fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .zoom img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border: 1px solid #1e1e1c;
    cursor: default;
  }
  .zoom-meta {
    position: fixed;
    top: 24px;
    left: 40px;
    right: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .zoom-name {
    font-size: 10px;
    letter-spacing: 0.2em;
    color: #6B6864;
    text-transform: uppercase;
  }
  .zoom-close {
    background: none;
    border: 1px solid #1e1e1c;
    color: #6B6864;
    font-family: inherit;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 8px 14px;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .zoom-close:hover {
    color: #E2DDD5;
    border-color: #3a3a37;
  }

  /* ---------- responsive ---------- */
  @media (max-width: 900px) {
    .zoom { padding: 50px 20px; }
    .zoom-meta { top: 16px; left: 20px; right: 20px; }
  }
</style>
