<script>
  import SectionShell from './SectionShell.svelte'
  import { stream } from '../../stores/streamMode.svelte.js'

  let modalOpen = $state(false)

  function onKey(e) {
    if (e.key === 'Escape' && modalOpen) modalOpen = false
  }

  function toggleLive() {
    stream.live = !stream.live
  }
</script>

<svelte:window onkeydown={onKey} />

<SectionShell index="02" label="Live Visual">

  <div style="flex: 1; display: flex; flex-direction: column; gap: 40px;">

    <!-- Description of the graphic -->
    <div>
      <span class="sub-label">Visual System</span>
      <p class="body-text" style="margin-top: 14px; max-width: 400px;">
        The visualization to the right is a generative noise system built and
        rendered in real time inside TouchDesigner. Layered feedback loops,
        seed-driven noise fields, and iterative mutation produce the forms you
        see. By default you're watching a recorded loop.
      </p>
    </div>

    <!-- Live feed toggle -->
    <div>
      <span class="sub-label">Live Feed</span>
      <p class="body-text" style="margin-top: 14px; max-width: 420px;">
        Switch the panel to a direct peer-to-peer WebRTC stream from the live
        TouchDesigner session. This opens a direct connection to the host machine.
      </p>
      <button
        class="live-btn"
        class:is-live={stream.live}
        onclick={toggleLive}
        aria-pressed={stream.live}
      >
        <span class="live-dot" class:on={stream.live}></span>
        <span>{stream.live ? 'Back to recording' : 'View live feed'}</span>
        <span class="btn-arrow">{stream.live ? '⏹' : '→'}</span>
      </button>
      {#if stream.live && stream.status === 'connecting'}
        <p class="live-hint">Connecting to the live feed…</p>
      {:else if stream.live && stream.status === 'error'}
        <p class="live-hint err">Couldn't reach the live feed — the host may be offline. Showing the recording.</p>
      {:else if stream.live && stream.status === 'live'}
        <p class="live-hint ok">Live feed connected.</p>
      {/if}
    </div>

    <!-- Interactive controls -->
    <div>
      <span class="sub-label">Controls</span>
      <p class="body-text" style="margin-top: 14px; max-width: 420px;">
        While viewing the live stream, press a key to send a control signal
        straight into the TouchDesigner network:
      </p>
      <ul class="control-list">
        <li class="control-row">
          <span class="key-cap">1</span>
          <span class="control-label">Reset the feedback loop</span>
        </li>
        <li class="control-row">
          <span class="key-cap">2</span>
          <span class="control-label">Inject a burst of snapshot noise</span>
        </li>
        <li class="control-row">
          <span class="key-cap">3</span>
          <span class="control-label">Advance the noise seed</span>
        </li>
      </ul>
    </div>

    <!-- Blog button — pushed to bottom -->
    <div style="margin-top: auto; padding-top: 24px; border-top: 1px solid #2a2a27;">
      <p style="font-size: 12px; line-height: 1.7; color: #A8A39B; letter-spacing: 0.04em; margin-bottom: 20px; max-width: 400px;">
        Interested in how this was built? The tech notes cover the TouchDesigner
        network, WebRTC signaling, and fallback handling in detail.
      </p>
      <button class="blog-btn" onclick={() => (modalOpen = true)}>
        <span>Tech Notes</span>
        <span class="btn-arrow">→</span>
      </button>
    </div>

    <!-- Scroll nudge -->
    <div style="display: flex; align-items: center; gap: 12px;">
      <div class="scroll-track">
        <div class="scroll-runner"></div>
      </div>
      <span style="font-size: 10px; letter-spacing: 0.16em; color: #6B6864;">
        scroll to explore more
      </span>
    </div>

  </div>

</SectionShell>

<!-- Modal backdrop -->
{#if modalOpen}
  <div
    class="backdrop"
    role="button"
    tabindex="-1"
    aria-label="Close modal"
    onclick={() => (modalOpen = false)}
    onkeydown={(e) => e.key === 'Escape' && (modalOpen = false)}
  ></div>

  <!-- Modal panel -->
  <div class="modal" role="dialog" aria-modal="true" aria-label="Tech Notes">

    <div class="modal-header">
      <span class="sub-label">Tech Notes — Visual System</span>
      <button class="close-btn" onclick={() => (modalOpen = false)} aria-label="Close">✕</button>
    </div>

    <div class="modal-body">

      <h2 class="modal-title">Generative Noise System</h2>
      <div style="width: 36px; height: 1px; background: #222220; margin: 12px 0 32px;"></div>

      <span class="sub-label" style="display: block; margin-bottom: 10px;">Overview</span>
      <p class="body-text" style="margin-bottom: 32px;">
        [Placeholder — describe the high-level concept and motivation behind the
        piece. What were you exploring? What does the output represent or evoke?]
      </p>

      <span class="sub-label" style="display: block; margin-bottom: 10px;">TouchDesigner Network</span>
      <p class="body-text" style="margin-bottom: 32px;">
        [Placeholder — walk through the node graph: noise operators, feedback
        loops, compositing chain, and any custom GLSL. Include what each stage
        contributes to the final image.]
      </p>

      <span class="sub-label" style="display: block; margin-bottom: 10px;">WebRTC Pipeline</span>
      <p class="body-text" style="margin-bottom: 32px;">
        [Placeholder — explain the signaling server, how the offer/answer
        exchange works, and how the stream is received and displayed in the
        browser with minimal latency.]
      </p>

      <span class="sub-label" style="display: block; margin-bottom: 10px;">Interactive Controls</span>
      <p class="body-text">
        [Placeholder — detail how keypresses are relayed from the browser back to
        TouchDesigner, what each control does at the network level, and any
        interesting emergent behaviors you discovered.]
      </p>

    </div>
  </div>
{/if}

<style>
  .sub-label {
    font-size: 11px;
    letter-spacing: 0.18em;
    color: #A8A39B;
    text-transform: uppercase;
    font-family: 'IBM Plex Mono', monospace;
  }

  .body-text {
    font-size: 13px;
    line-height: 1.9;
    color: #E2DDD5;
    opacity: 0.86;
    font-family: 'IBM Plex Mono', monospace;
    margin: 0;
  }

  .control-list {
    list-style: none;
    margin: 18px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 420px;
  }

  .control-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .key-cap {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: 1px solid #45443f;
    border-bottom-width: 2px;
    border-radius: 4px;
    background: rgba(226, 221, 213, 0.04);
    color: #E2DDD5;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    font-weight: 500;
  }

  .control-label {
    font-size: 13px;
    line-height: 1.5;
    color: #C9C4BC;
    font-family: 'IBM Plex Mono', monospace;
  }

  /* Scroll animation */
  .scroll-track {
    position: relative;
    width: 1px;
    height: 24px;
    background: #272724;
    overflow: hidden;
    flex-shrink: 0;
  }

  .scroll-runner {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background: #6B6864;
    animation: scrollPulse 2.2s ease-in-out infinite;
  }

  @keyframes scrollPulse {
    0%   { height: 0%;   top: 0%;    }
    40%  { height: 100%; top: 0%;    }
    80%  { height: 0%;   top: 100%;  }
    100% { height: 0%;   top: 100%;  }
  }

  /* Live feed toggle */
  .live-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    margin-top: 20px;
    background: rgba(226, 221, 213, 0.05);
    border: 1px solid #54534d;
    color: #E2DDD5;
    padding: 12px 22px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
  }

  .live-btn:hover {
    border-color: #8F8B86;
    background: rgba(226, 221, 213, 0.09);
  }

  .live-btn.is-live {
    border-color: #6f5a4a;
    background: rgba(176, 128, 104, 0.1);
  }

  .live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #6B6864;
    flex-shrink: 0;
    transition: background 0.2s ease, box-shadow 0.2s ease;
  }

  .live-dot.on {
    background: #c8806a;
    box-shadow: 0 0 0 0 rgba(200, 128, 106, 0.7);
    animation: livedot 1.8s ease-out infinite;
  }

  @keyframes livedot {
    0%   { box-shadow: 0 0 0 0 rgba(200, 128, 106, 0.6); }
    70%  { box-shadow: 0 0 0 7px rgba(200, 128, 106, 0); }
    100% { box-shadow: 0 0 0 0 rgba(200, 128, 106, 0); }
  }

  .live-hint {
    margin: 14px 0 0;
    max-width: 420px;
    font-size: 11px;
    line-height: 1.6;
    letter-spacing: 0.04em;
    color: #8F8B86;
    font-family: 'IBM Plex Mono', monospace;
  }

  .live-hint.ok { color: #8a9c84; }
  .live-hint.err { color: #b08068; }

  /* Button */
  .blog-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: rgba(226, 221, 213, 0.04);
    border: 1px solid #45443f;
    color: #C9C4BC;
    padding: 12px 22px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
  }

  .blog-btn:hover {
    border-color: #6B6864;
    color: #FFFFFF;
    background: rgba(226, 221, 213, 0.08);
  }

  .btn-arrow {
    color: #8F8B86;
    transition: color 0.2s ease, transform 0.2s ease;
  }

  .blog-btn:hover .btn-arrow {
    color: #E2DDD5;
    transform: translateX(3px);
  }

  /* Modal backdrop */
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(14, 14, 13, 0.88);
    backdrop-filter: blur(3px);
    z-index: 200;
  }

  /* Modal panel */
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 201;
    background: #141413;
    border: 1px solid #222220;
    width: min(1100px, 96vw);
    height: 92vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    font-family: 'IBM Plex Mono', monospace;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 52px;
    border-bottom: 1px solid #1e1e1c;
    position: sticky;
    top: 0;
    background: #141413;
    z-index: 1;
    flex-shrink: 0;
  }

  .modal-body {
    padding: 60px 52px 80px;
    flex: 1;
  }

  .modal-title {
    font-size: 28px;
    font-weight: 400;
    letter-spacing: 0.02em;
    color: #E2DDD5;
    margin: 0;
    font-family: 'IBM Plex Mono', monospace;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #8F8B86;
    font-size: 13px;
    font-family: 'IBM Plex Mono', monospace;
    cursor: pointer;
    padding: 4px 8px;
    letter-spacing: 0.1em;
    transition: color 0.2s ease;
  }

  .close-btn:hover {
    color: #E2DDD5;
  }
</style>
