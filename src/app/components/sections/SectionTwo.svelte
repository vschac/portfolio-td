<script>
  import SectionShell from './SectionShell.svelte'

  let modalOpen = $state(false)
</script>

<SectionShell index="02" label="Live Visual" blendTop>

  <div style="flex: 1; display: flex; flex-direction: column; gap: 40px;">

    <!-- Description of the graphic -->
    <div>
      <span class="sub-label">Visual System</span>
      <p class="body-text" style="margin-top: 14px; max-width: 400px;">
        The visualization to the right is a generative noise system built and
        rendered in real time inside TouchDesigner. Layered feedback loops,
        seed-driven noise fields, and iterative mutation produce the forms you
        see. The stream is delivered live over WebRTC.
      </p>
    </div>

    <!-- Interactive hint -->
    <div>
      <span class="sub-label">Controls</span>
      <p class="body-text" style="margin-top: 14px; max-width: 400px;">
        While viewing the stream, keys <span class="key-badge">1</span>
        <span class="key-badge">2</span> <span class="key-badge">3</span>
        send control signals to the TouchDesigner network — resetting feedback,
        adding snapshot noise, and incrementing the noise seed respectively.
      </p>
    </div>

    <!-- Blog button — pushed to bottom -->
    <div style="margin-top: auto; padding-top: 24px; border-top: 1px solid #1e1e1c;">
      <p style="font-size: 11px; line-height: 1.7; color: #3a3a37; letter-spacing: 0.04em; margin-bottom: 20px;">
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
      <span style="font-size: 10px; letter-spacing: 0.16em; color: #3a3a37;">
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
    color: #6B6864;
    text-transform: uppercase;
    font-family: 'IBM Plex Mono', monospace;
  }

  .body-text {
    font-size: 13px;
    line-height: 1.9;
    color: #E2DDD5;
    opacity: 0.62;
    font-family: 'IBM Plex Mono', monospace;
    margin: 0;
  }

  .key-badge {
    display: inline-block;
    border: 1px solid #272724;
    padding: 0px 5px;
    font-size: 11px;
    color: #6B6864;
    letter-spacing: 0.04em;
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

  /* Button */
  .blog-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: transparent;
    border: 1px solid #222220;
    color: #6B6864;
    padding: 10px 20px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;
  }

  .blog-btn:hover {
    border-color: #484845;
    color: #E2DDD5;
  }

  .btn-arrow {
    color: #3a3a37;
    transition: color 0.2s ease, transform 0.2s ease;
  }

  .blog-btn:hover .btn-arrow {
    color: #6B6864;
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
    color: #3a3a37;
    font-size: 11px;
    font-family: 'IBM Plex Mono', monospace;
    cursor: pointer;
    padding: 4px 8px;
    letter-spacing: 0.1em;
    transition: color 0.2s ease;
  }

  .close-btn:hover {
    color: #6B6864;
  }
</style>
