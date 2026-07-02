<script>
  import SectionShell from './SectionShell.svelte'
  import { stream } from '../../stores/streamMode.svelte.js'
  import diagramUrl from '../../../assets/portfolio-diagram.png'

  let modalOpen = $state(false)

  function onKey(e) {
    if (e.key === 'Escape' && modalOpen) modalOpen = false
  }

  function toggleLive() {
    stream.live = !stream.live
  }

  // Lock background scroll while the tech-notes modal is open.
  $effect(() => {
    if (modalOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  })
</script>

<svelte:window onkeydown={onKey} />

<SectionShell index="02" label="Live Visual">

  <div style="flex: 1; display: flex; flex-direction: column; gap: clamp(8px, 1.7vh, 24px);">

    <!-- Description of the graphic -->
    <div>
      <span class="sub-label">Visual System</span>
      <p class="body-text" style="margin-top: clamp(8px, 1.2vh, 14px); max-width: 400px;">
        The visualization to the right is a generative noise system built and
        rendered in real time inside TouchDesigner. Layered feedback loops,
        seed-driven noise fields, and iterative mutation produce the forms you
        see. By default you're watching a recorded loop.
      </p>
    </div>

    <!-- Live feed toggle -->
    <div>
      <span class="sub-label">Live Feed</span>
      <p class="body-text" style="margin-top: clamp(8px, 1.2vh, 14px); max-width: 420px;">
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
      <p class="body-text" style="margin-top: clamp(8px, 1.2vh, 14px); max-width: 420px;">
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
          <span class="control-label">Rotate the noise</span>
        </li>
        <li class="control-row">
          <span class="key-cap">3</span>
          <span class="control-label">Advance the noise seed</span>
        </li>
      </ul>
    </div>

    <!-- Blog button — pushed to bottom -->
    <div style="margin-top: auto; padding-top: clamp(14px, 2vh, 24px); border-top: 1px solid #2a2a27;">
      <p style="font-size: 12px; line-height: 1.6; color: #A8A39B; letter-spacing: 0.04em; margin-bottom: clamp(12px, 1.6vh, 20px); max-width: 400px;">
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
      <p class="body-text" style="margin-bottom: 24px;">
        The idea for this project was to combine my passion for system design with Touch Designer, an interactive visual programming software. For reference, this is often the software used in interactive tech-oriented museums or to create the visuals used by DJs and other music artists. Touch Designer has lots of native support that allows it to act as its own graphical-engine server, however the challenge here proved to be serving this traffic to a non local connection.
        </p>
        <p class="body-text" style="margin-bottom: 24px;">
        Using touch designer's Python callback functions for their WebRTC/webhooking nodes I created a system that responds to web hooks from a local signaling server (see a more in depth explanation below) and orchestrates a WebRTC connection with the client. The next piece of this puzzle was to build out the other side. I figured it would be a cool idea to have this simple web app double as my portfolio website.
        </p>
        <p class="body-text" style="margin-bottom: 24px;">
        As a fallback, I prerecorded a video of me interacting with this system on Touch Designer and stored it in Cloudflare's R2 object storage to continue displaying a visual if my self-hosted backend were down. Here is a general overview of how this system works:
        </p>

      <figure class="diagram">
        <img src={diagramUrl} alt="System architecture: the browser loads the site from Vercel and the recorded video from Cloudflare R2, exchanges Offer/ICE with a signaling server on Vince's Mac Mini, then opens a direct WebRTC peer-to-peer connection to TouchDesigner." />
        <figcaption>
          End-to-end architecture — static site on Vercel, recorded loop from
          Cloudflare R2, and an opt-in WebRTC peer-to-peer stream negotiated
          through the signaling server on the host machine.
        </figcaption>
      </figure>

      <span class="sub-label" style="display: block; margin-bottom: 10px;">TouchDesigner Network</span>
      <p class="body-text" style="margin-bottom: 32px;">
        The visual you see is a feedback loop of 500,000 GPU based particles. These particles are stored as a texture on the GPU and are processed in parallel each frame. The simulation begins by generating a sphere of points in 3D space. Those point positions are then encoded into a 2D texture, where each pixel stores the XYZ coordinates of a single particle. While this may seem unusual, representing particle data as an image allows it to be manipulated using highly optimized GPU image-processing operations.
        <p>
        <p class="body-text" style="margin-bottom: 32px;">
            Once in texture form, the data enters a feedback loop. Each frame starts with the particle positions from the previous frame, applies a series of transformations, and writes the updated positions back into the texture. Small procedural noise generates continuously changing control values that drive the geometric transformations applied to the particle cloud. Because these transformations occur inside a feedback loop, their effects accumulate over time, producing the fluid, organic motion seen in the final result.
        </p>
        <p class="body-text" style="margin-bottom: 32px;">
            Certain keyboard inputs are also wired into the network to create interactive effects. Pressing 1 resets the feedback loop, returning all particles to their original positions. The 2 and 3 keys modify the procedural noise that drives the simulation's transformations. The 2 key rotates the noise field, changing the direction of the transformations and causing the particle cloud to evolve along a different path. The 3 key increments the noise seed, generating an entirely new transformation pattern. Although these inputs produce seemingly random changes in the final visualization, they serve as intentional controls for dramatically altering the simulation's behavior.
        </p>

        <p class="body-text" style="margin-bottom: 32px;">
            After the simulation step, the texture is interpreted as 3D coordinates once again. The GPU reconstructs the point cloud from the stored position data, renders it into a scene, and applies additional post-processing effects before producing the final image.
        </p>

      <span class="sub-label" style="display: block; margin-bottom: 10px;">WebRTC Pipeline</span>
      <p class="body-text" style="margin-bottom: 32px;">
        WebRTC lets the browser and TouchDesigner stream directly to each other, but they first need a way to find one another. A small signaling server running alongside TouchDesigner handles that introduction and helps to convey the information needed for P2P connection.
      </p>
      <p class="body-text" style="margin-bottom: 32px;">
        When you open the live feed, the two sides exchange an SDP offer and answer to agree on video parameters, then trade ICE candidates (the possible network routes between them) using a STUN server to discover each peer's address behind its NAT. The signaling server simply passes these messages along, so a viewer can only ever negotiate with TouchDesigner.
      </p>
      <p class="body-text">
        Once a route is found the video flows directly peer-to-peer and
        encrypted, with the signaling server out of the path. The browser shows
        a receive-only video track and cross-fades from the recorded loop to the
        live stream as soon as frames arrive, while a separate data channel sends
        the <code>1</code> / <code>2</code> / <code>3</code> key controls back to
        TouchDesigner.
      </p>

    </div>
  </div>
{/if}

<style>
  .sub-label {
    font-size: 15px;
    letter-spacing: 0.16em;
    color: #E2DDD5;
    font-weight: 600;
    text-transform: uppercase;
    font-family: 'IBM Plex Mono', monospace;
  }

  .body-text {
    font-size: 13px;
    line-height: 1.62;
    color: #E2DDD5;
    opacity: 0.86;
    font-family: 'IBM Plex Mono', monospace;
    margin: 0;
  }

  .body-text :global(code) {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: #C9C4BC;
    background: rgba(226, 221, 213, 0.07);
    border: 1px solid #2a2a27;
    border-radius: 3px;
    padding: 1px 5px;
  }

  .control-list {
    list-style: none;
    margin: clamp(10px, 1.4vh, 18px) 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: clamp(8px, 1vh, 12px);
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
    width: 26px;
    height: 26px;
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
    height: 18px;
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

  /* Architecture diagram (dark-modal safe: light card behind the artwork) */
  .diagram {
    margin: 0 0 36px;
  }

  .diagram img {
    display: block;
    width: 100%;
    max-width: 800px;
    height: auto;
    margin: 0 auto;
    background: #ffffff;
    border: 1px solid #222220;
    border-radius: 8px;
    padding: 20px;
    box-sizing: border-box;
  }

  .diagram figcaption {
    margin-top: 12px;
    font-size: 11px;
    line-height: 1.6;
    letter-spacing: 0.04em;
    color: #8F8B86;
    font-family: 'IBM Plex Mono', monospace;
  }

  /* Live feed toggle */
  .live-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    margin-top: clamp(10px, 1.6vh, 20px);
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
    scrollbar-width: thin;
    scrollbar-color: #2a2a27 transparent;
  }

  .modal::-webkit-scrollbar { width: 4px; }
  .modal::-webkit-scrollbar-track { background: transparent; }
  .modal::-webkit-scrollbar-thumb { background: #2a2a27; }

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
