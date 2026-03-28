<script>
  import { onMount, onDestroy } from 'svelte'
  import { SimpleSignalingClient, SimpleWebRTCReceiver } from '../../webrtc.js'

  const BG = '#141413'
  const VIDEO_INSET = 12
  const VIDEO_RADIUS = 10
  const VIDEO_SHADOW = '0 8px 24px rgba(0, 0, 0, 0.22)'
  const KEY_CLEAR_DELAY_MS = 1000
  const BORDER_PULSE_MS = 550
  const KEY_MESSAGES = {
    '1': 'Feedback reset',
    '2': 'Snapshot noise',
    '3': 'Increment noise seed',
  }
  const C = {
    bg:    BG,
    fgDim: '#4a4a47',
    fgMid: '#2e2e2b',
    fgBright: '#585853',
    fgText: '#3c3c38',
  }

  const SIGNALING_WS_URL = import.meta.env.VITE_CONTROL_WS

  let videoEl = $state(null)
  let isStreaming = $state(false)
  let activeKeyLabel = $state('')
  let isBorderPulsing = $state(false)

  let signalingClient = null
  let webrtcReceiver = null
  let syncIntervalId = null
  let keyTimeoutId = null
  let borderPulseTimeoutId = null
  let removeListeners = () => {}

  const logStatus = (msg) => console.log(`[STATUS] ${msg}`)
  const handleKeydown = (event) => {
    if (event.key !== '1' && event.key !== '2' && event.key !== '3') return

    webrtcReceiver?.sendControlKey(event.key)

    activeKeyLabel = `${event.key} — ${KEY_MESSAGES[event.key]}`
    // Re-trigger the border animation on every valid key press.
    isBorderPulsing = false
    window.requestAnimationFrame(() => {
      isBorderPulsing = true
    })

    if (keyTimeoutId !== null) window.clearTimeout(keyTimeoutId)
    keyTimeoutId = window.setTimeout(() => {
      activeKeyLabel = ''
      keyTimeoutId = null
    }, KEY_CLEAR_DELAY_MS)

    if (borderPulseTimeoutId !== null) window.clearTimeout(borderPulseTimeoutId)
    borderPulseTimeoutId = window.setTimeout(() => {
      isBorderPulsing = false
      borderPulseTimeoutId = null
    }, BORDER_PULSE_MS)
  }

  onMount(() => {
    const syncFromStream = () => {
      isStreaming = Boolean(videoEl?.srcObject)
    }

    const eventNames = ['loadedmetadata', 'play', 'pause', 'ended', 'emptied']
    const unsubs = eventNames.map((name) => {
      videoEl.addEventListener(name, syncFromStream)
      return () => videoEl.removeEventListener(name, syncFromStream)
    })
    removeListeners = () => unsubs.forEach((u) => u())

    syncFromStream()
    syncIntervalId = window.setInterval(syncFromStream, 1000)

    if (SIGNALING_WS_URL) {
      signalingClient = new SimpleSignalingClient(SIGNALING_WS_URL, { logStatus })
      webrtcReceiver = new SimpleWebRTCReceiver(signalingClient, videoEl, { logStatus })
      signalingClient.connect()
    }
  })

  onDestroy(() => {
    removeListeners()
    if (syncIntervalId !== null) {
      window.clearInterval(syncIntervalId)
      syncIntervalId = null
    }
    if (keyTimeoutId !== null) {
      window.clearTimeout(keyTimeoutId)
      keyTimeoutId = null
    }
    if (borderPulseTimeoutId !== null) {
      window.clearTimeout(borderPulseTimeoutId)
      borderPulseTimeoutId = null
    }
  })
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="h-full relative overflow-hidden" style="background: {C.bg}; font-family: 'IBM Plex Mono', monospace">

  <!-- WebRTC video — slightly inset with rounded frame -->
  <div
    class="videoFrame {isBorderPulsing ? 'pulse' : ''}"
    style="top: 50%; left: 50%; width: min(calc(100% - {VIDEO_INSET * 2}px), calc(100vh - {VIDEO_INSET * 2}px)); aspect-ratio: 1 / 1; transform: translate(-50%, -50%); border-radius: {VIDEO_RADIUS}px; box-shadow: {VIDEO_SHADOW};"
  >
    <video
      bind:this={videoEl}
      style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; object-position: center center; display: block; opacity: {isStreaming ? 1 : 0}; transition: opacity 0.5s ease;"
      autoplay
      playsinline
      muted
    ></video>
    <!-- Placeholder — shown while waiting for stream -->
    <div
      class="placeholder"
      style="opacity: {isStreaming ? 0 : 1}; pointer-events: {isStreaming ? 'none' : 'auto'}"
    >
      <!-- Crosshair -->
      <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 100%; height: 1px; background: #262623;"></div>
        <div style="position: absolute; width: 1px; height: 100%; background: #262623;"></div>
        <div style="width: 14px; height: 14px; border: 1px solid #353532;"></div>
      </div>
      <span style="margin-top: 24px; font-size: 10px; letter-spacing: 0.14em; color: #2e2e2b;">
        {SIGNALING_WS_URL ? 'Waiting for stream…' : 'No signal URL configured'}
      </span>
    </div>
  </div>

  <!-- Floating label — top left -->
  <div style="position: absolute; top: 24px; left: 28px; z-index: 20; display: flex; flex-direction: column; gap: 4px;">
    <span style="font-size: 14px; letter-spacing: 0.14em; color: {C.fgBright}">Key: {activeKeyLabel}</span>
  </div>

  <!-- Floating status — bottom left -->
  <div style="position: absolute; bottom: 28px; left: 28px; z-index: 20; display: flex; align-items: center; gap: 10px;">
    <span style="font-size: 10px; letter-spacing: 0.1em; color: {C.fgBright}">{isStreaming ? '▶' : '■'}</span>
    <span style="font-size: 10px; letter-spacing: 0.08em; color: {C.fgText}">{isStreaming ? 'Live - this video is being streamed from touch designer' : 'Standby'}</span>
  </div>

</div>

<style>
  .videoFrame {
    position: absolute;
    overflow: hidden;
  }

  .videoFrame::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid transparent;
    border-radius: inherit;
    pointer-events: none;
    opacity: 0;
  }

  .videoFrame.pulse::after {
    animation: borderPulse 0.55s ease-out;
  }

  @keyframes borderPulse {
    0% {
      border-color: rgba(255, 255, 255, 0.9);
      opacity: 1;
    }
    100% {
      border-color: rgba(255, 255, 255, 0);
      opacity: 0;
    }
  }

  .placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #0c0c0b;
    transition: opacity 0.5s ease;
  }
</style>
