<script>
  import StickySection from './StickySection.svelte'
  import manifest from '../../../assets/gallery.json'

  const fullModules = import.meta.glob(
    '../../../assets/gallery/*.{jpg,jpeg,png,webp,avif,svg,JPG,JPEG,PNG,WEBP,AVIF,SVG}',
    { eager: true, query: '?url', import: 'default' }
  )
  const thumbModules = import.meta.glob(
    '../../../assets/gallery-thumbs/*.webp',
    { eager: true, query: '?url', import: 'default' }
  )
  const fullByFile = {}
  for (const [path, url] of Object.entries(fullModules)) {
    fullByFile[path.split('/').pop()] = url
  }
  const thumbByFile = {}
  for (const [path, url] of Object.entries(thumbModules)) {
    thumbByFile[path.split('/').pop()] = url
  }

  // Override the opening/hero photo regardless of tonal sort. Set to null
  // to use the naturally-darkest photo first.
  const HERO_FILE = 'IMG_6434.jpeg'

  const photos = manifest.photos
    .filter((p) => fullByFile[p.file])
    .map((p) => ({
      url: fullByFile[p.file],
      thumb: thumbByFile[p.thumb] ?? fullByFile[p.file],
      name: p.file.replace(/\.[^.]+$/, ''),
      ratio: p.ratio,
      accent: p.hex,
      file: p.file,
    }))

  if (HERO_FILE) {
    const i = photos.findIndex((p) => p.file === HERO_FILE)
    if (i > 0) photos.unshift(photos.splice(i, 1)[0])
  }

  const inManifest = new Set(manifest.photos.map((p) => p.file))
  const untracked = Object.keys(fullByFile).filter((f) => !inManifest.has(f))
  for (const file of untracked) {
    photos.push({
      url: fullByFile[file],
      thumb: fullByFile[file],
      name: file.replace(/\.[^.]+$/, ''),
      ratio: 1.5,
      accent: '#1e1e1c',
    })
  }
  if (untracked.length) {
    console.warn(
      `[gallery] ${untracked.length} untracked photo(s). Run 'npm run gallery:build' to re-index.`
    )
  }

  // Preview: 6 photos spread across the tonal range (dark → bright).
  // Six is a sweet spot — enough tiles that greedy row balancing produces
  // rows of near-equal height, while still reading as a curated preview.
  const PREVIEW_COUNT = 6
  const previewPhotos = Array.from({ length: PREVIEW_COUNT }, (_, i) => {
    if (photos.length === 0) return null
    const idx = photos.length === 1
      ? 0
      : Math.floor((i / (PREVIEW_COUNT - 1)) * (photos.length - 1))
    return photos[idx]
  }).filter(Boolean)
  const remaining = Math.max(0, photos.length - PREVIEW_COUNT)

  // Distribute the 5 photos + "+more" tile across two rows, greedy-balanced by
  // aspect-ratio sum so both rows end at roughly the same width — forms an
  // approximate horizontal rectangle. Each photo keeps its true proportions.
  const previewRows = (() => {
    const rows = [[], []]
    const sums = [0, 0]
    for (const p of previewPhotos) {
      const shorter = sums[0] <= sums[1] ? 0 : 1
      rows[shorter].push({ type: 'photo', ratio: p.ratio, photo: p })
      sums[shorter] += p.ratio
    }
    if (remaining > 0) {
      const shorter = sums[0] <= sums[1] ? 0 : 1
      rows[shorter].push({ type: 'more', ratio: 1 })
    }
    return rows
  })()


  // --- modal & responsive column count -----------------------------------
  let modalOpen = $state(false)
  let zoomed = $state(null)

  function openModal() { modalOpen = true }
  function closeModal() { modalOpen = false }
  function closeZoom() { zoomed = null }

  function onKey(e) {
    if (e.key !== 'Escape') return
    if (zoomed) closeZoom()
    else if (modalOpen) closeModal()
  }

  let colCount = $state(4)
  $effect(() => {
    const mqNarrow = window.matchMedia('(max-width: 600px)')
    const mqMid = window.matchMedia('(max-width: 900px)')
    const update = () => {
      if (mqNarrow.matches) colCount = 2
      else if (mqMid.matches) colCount = 3
      else colCount = 4
    }
    update()
    mqNarrow.addEventListener('change', update)
    mqMid.addEventListener('change', update)
    return () => {
      mqNarrow.removeEventListener('change', update)
      mqMid.removeEventListener('change', update)
    }
  })

  // Greedy balanced column distribution; each column reads dark → bright.
  const columns = $derived.by(() => {
    const cols = Array.from({ length: colCount }, () => [])
    const h = new Array(colCount).fill(0)
    for (const p of photos) {
      let shortest = 0
      for (let i = 1; i < colCount; i++) if (h[i] < h[shortest]) shortest = i
      cols[shortest].push(p)
      h[shortest] += 1 / p.ratio
    }
    return cols
  })

  // Pre-decode modal thumbs once the modal opens so scroll has no decode stalls.
  let modalMosaic = $state(null)
  let decoded = false
  $effect(() => {
    if (!modalOpen || !modalMosaic || decoded) return
    for (const img of modalMosaic.querySelectorAll('img')) {
      img.decode?.().catch(() => {})
    }
    decoded = true
  })

  // Lock background scroll while modal is open.
  $effect(() => {
    if (modalOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  })
</script>

<svelte:window onkeydown={onKey} />

<StickySection index="05" label="Gallery">
  {#if photos.length === 0}
    <div class="empty">
      <span class="empty-meta">// no photos yet</span>
      <p class="empty-body">
        Drop images into <code>src/assets/gallery/</code>, then run
        <code>npm run gallery:build</code>.
      </p>
    </div>
  {:else}
    <div class="sheet">
      {#each previewRows as row}
        <div
          class="row"
          style="grid-template-columns: {row.map((it) => `${it.ratio}fr`).join(' ')};"
        >
          {#each row as item, i (i)}
            {#if item.type === 'photo'}
              <button
                class="tile"
                style="--accent: {item.photo.accent};"
                onclick={openModal}
                aria-label={`Open gallery`}
              >
                <img src={item.photo.thumb} alt={item.photo.name} />
              </button>
            {:else}
              <button
                class="tile tile-more"
                onclick={openModal}
                aria-label={`View all ${photos.length} photos`}
              >
                <span class="more-count">+{remaining}</span>
                <span class="more-label">more</span>
              </button>
            {/if}
          {/each}
        </div>
      {/each}
    </div>

    <div class="footer">
      <span>{photos.length} frames</span>
      <span class="dot">·</span>
      <span>click to expand</span>
    </div>
  {/if}
</StickySection>

<!-- ========== modal: full vertical masonry ========== -->
{#if modalOpen}
  <div
    class="backdrop"
    role="button"
    tabindex="-1"
    aria-label="Close gallery"
    onclick={closeModal}
    onkeydown={(e) => e.key === 'Escape' && closeModal()}
  ></div>

  <div class="modal" role="dialog" aria-modal="true" aria-label="Gallery">
    <div class="modal-header">
      <span class="modal-label">Gallery — {photos.length} frames · dark → bright</span>
      <button class="modal-close" onclick={closeModal} aria-label="Close">✕</button>
    </div>

    <div class="modal-body">
      <div
        class="mosaic"
        bind:this={modalMosaic}
        style="grid-template-columns: repeat({colCount}, 1fr);"
      >
        {#each columns as col}
          <div class="col">
            {#each col as photo (photo.url)}
              <button
                class="cell"
                style="--accent: {photo.accent};"
                onclick={() => (zoomed = photo)}
                aria-label={`Open ${photo.name}`}
              >
                <img src={photo.thumb} alt={photo.name} />
              </button>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<!-- ========== fullscreen photo zoom (over modal) ========== -->
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
  /* ---------- section preview (two-row horizontal rectangle) ---------- */
  /* Each row has its own grid-template-columns set inline from its tiles'
     aspect ratios, so every photo renders at its true proportions. Row heights
     auto-fit the tallest image — rows are balanced by greedy aspect-ratio sum
     to keep heights close (~10% diff) while tiles stay uncropped. */
  .sheet {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    font-family: 'IBM Plex Mono', monospace;
  }
  .row {
    display: grid;
    gap: 10px;
  }

  .tile {
    position: relative;
    overflow: hidden;
    border: 1px solid #1e1e1c;
    background: #0e0e0d;
    padding: 0;
    cursor: pointer;
    min-width: 0;
    transition: border-color 0.25s ease, box-shadow 0.25s ease;
  }
  .tile:hover {
    border-color: var(--accent, #3a3a37);
    box-shadow: 0 0 0 1px var(--accent, #3a3a37);
  }

  /* width:100%; height:auto lets the image's natural aspect ratio drive the
     row height — every tile ends up the same height, with no cropping. */
  .tile img {
    width: 100%;
    height: auto;
    display: block;
  }

  /* +more has no photo; square it so its height matches the row. */
  .tile-more {
    aspect-ratio: 1;
  }

  .tile-index {
    position: absolute;
    top: 10px;
    left: 12px;
    font-size: 9px;
    letter-spacing: 0.2em;
    color: #E2DDD5;
    opacity: 0;
    transition: opacity 0.25s ease;
    mix-blend-mode: difference;
  }
  .tile:hover .tile-index { opacity: 0.8; }

  .tile-more {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #6B6864;
  }
  .tile-more:hover { color: #E2DDD5; }
  .more-count {
    font-size: clamp(22px, 2.4vw, 34px);
    font-weight: 400;
    letter-spacing: 0.02em;
  }
  .more-label {
    font-size: 9px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
  }

  .footer {
    display: flex;
    gap: 10px;
    margin-top: 18px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.16em;
    color: #484845;
    text-transform: uppercase;
  }
  .dot { color: #2a2a27; }

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

  /* ---------- modal ---------- */
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(14, 14, 13, 0.88);
    backdrop-filter: blur(3px);
    z-index: 200;
    animation: fade 0.2s ease;
  }
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 201;
    background: #141413;
    border: 1px solid #222220;
    width: min(1200px, 96vw);
    height: 92vh;
    display: flex;
    flex-direction: column;
    font-family: 'IBM Plex Mono', monospace;
    animation: fade 0.25s ease;
  }
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 40px;
    border-bottom: 1px solid #1e1e1c;
    flex-shrink: 0;
  }
  .modal-label {
    font-size: 11px;
    letter-spacing: 0.18em;
    color: #6B6864;
    text-transform: uppercase;
  }
  .modal-close {
    background: transparent;
    border: none;
    color: #3a3a37;
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    padding: 4px 8px;
    transition: color 0.2s ease;
  }
  .modal-close:hover { color: #E2DDD5; }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px 40px 48px;
    scrollbar-width: thin;
    scrollbar-color: #2a2a27 transparent;
  }
  .modal-body::-webkit-scrollbar { width: 4px; }
  .modal-body::-webkit-scrollbar-track { background: transparent; }
  .modal-body::-webkit-scrollbar-thumb { background: #2a2a27; }

  .mosaic {
    display: grid;
    gap: 10px;
    width: 100%;
  }
  .col {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }
  .cell {
    display: block;
    padding: 0;
    margin: 0;
    border: 1px solid #1e1e1c;
    background: #0e0e0d;
    cursor: pointer;
    overflow: hidden;
    line-height: 0;
    transition: border-color 0.4s ease, box-shadow 0.4s ease;
  }
  .cell:hover {
    border-color: var(--accent, #3a3a37);
    box-shadow: 0 0 0 1px var(--accent, #3a3a37);
  }
  .cell img {
    width: 100%;
    height: auto;
    display: block;
  }

  /* ---------- zoom ---------- */
  .zoom {
    position: fixed;
    inset: 0;
    z-index: 300;
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

  @keyframes fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* ---------- responsive ---------- */
  /* Preview grid stays at its fixed 6-column shape at every width.
     Only modal + zoom get mobile padding tweaks. */
  @media (max-width: 900px) {
    .modal-header { padding: 16px 20px; }
    .modal-body { padding: 16px 20px 32px; }
    .zoom { padding: 50px 20px; }
    .zoom-meta { top: 16px; left: 20px; right: 20px; }
  }
</style>
