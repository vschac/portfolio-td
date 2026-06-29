<script>
  import { onMount, onDestroy } from 'svelte'
  import { SimpleSignalingClient, SimpleWebRTCReceiver } from '../../webrtc.js'

  const BG = '#000000'
  const VIDEO_INSET = 12
  const VIDEO_RADIUS = 10
  const VIDEO_SHADOW = '0 8px 24px rgba(0, 0, 0, 0.22)'
  const KEY_CLEAR_DELAY_MS = 1000
  const BORDER_PULSE_MS = 550
  const LIVE_VIDEO_ID = 'webrtc-live-video'
  const FALLBACK_VIDEO_ID = 'webrtc-fallback-video'
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
  const FALLBACK_VIDEO_SRC = import.meta.env.VITE_FALLBACK_VIDEO_URL || ''

  let videoEl = null
  let fallbackVideoEl = null
  let isStreaming = $state(false)
  let hasFallbackError = $state(false)
  let isFallbackConfigured = $state(Boolean(FALLBACK_VIDEO_SRC))
  let activeKeyLabel = $state('')
  let isBorderPulsing = $state(false)
  let wasStreaming = false

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
    videoEl = document.getElementById(LIVE_VIDEO_ID)
    fallbackVideoEl = document.getElementById(FALLBACK_VIDEO_ID)
    if (!(videoEl instanceof HTMLVideoElement) || !(fallbackVideoEl instanceof HTMLVideoElement)) {
      logStatus('Video elements not found in DOM')
      return
    }

    if (!isFallbackConfigured) {
      hasFallbackError = true
    }

    const syncFromStream = () => {
      const stream = videoEl?.srcObject
      const hasConnectedTrack =
        stream instanceof MediaStream &&
        stream.getVideoTracks().some((track) => track.readyState === 'live' && track.enabled)
      const hasDecodedFrames =
        Boolean(videoEl) &&
        videoEl.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        videoEl.videoWidth > 0 &&
        videoEl.videoHeight > 0 &&
        !videoEl.paused &&
        !videoEl.ended

      // Only consider stream "active" when frames are actually being rendered.
      isStreaming = Boolean(hasConnectedTrack && hasDecodedFrames)
      if (!isStreaming) {
        if (wasStreaming) fallbackVideoEl.currentTime = 0
        if (isFallbackConfigured && !hasFallbackError) fallbackVideoEl.play().catch(() => {})
      }
      wasStreaming = isStreaming
    }

    const eventNames = ['loadedmetadata', 'loadeddata', 'playing', 'play', 'pause', 'ended', 'emptied', 'stalled', 'waiting']
    const unsubs = eventNames.map((name) => {
      videoEl.addEventListener(name, syncFromStream)
      return () => videoEl.removeEventListener(name, syncFromStream)
    })
    removeListeners = () => unsubs.forEach((u) => u())

    const onFallbackError = () => {
      hasFallbackError = true
    }
    const onFallbackLoaded = () => {
      if (isFallbackConfigured) hasFallbackError = false
    }
    fallbackVideoEl.addEventListener('error', onFallbackError)
    fallbackVideoEl.addEventListener('loadeddata', onFallbackLoaded)
    const prevRemove = removeListeners
    removeListeners = () => {
      prevRemove()
      fallbackVideoEl.removeEventListener('error', onFallbackError)
      fallbackVideoEl.removeEventListener('loadeddata', onFallbackLoaded)
    }

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
    style="top: 50%; left: 50%; height: calc(100% - {VIDEO_INSET * 2}px); width: auto; max-width: calc(100% - {VIDEO_INSET * 2}px); aspect-ratio: 1 / 1; transform: translate(-50%, -50%); border-radius: {VIDEO_RADIUS}px; box-shadow: {VIDEO_SHADOW};"
  >
    <video
      id={FALLBACK_VIDEO_ID}
      style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; object-position: center center; display: block; opacity: {isStreaming ? 0 : 1}; transition: opacity 0.5s ease;"
      autoplay
      loop
      muted
      playsinline
      preload="auto"
    >
      <source src={FALLBACK_VIDEO_SRC} type="video/mp4" />
    </video>
    {#if !isStreaming && hasFallbackError}
      <div
        style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px; background: #0c0c0b; color: {C.fgBright}; font-size: 11px; letter-spacing: 0.06em;"
      >
        {#if !isFallbackConfigured}
          Fallback video not configured (set VITE_FALLBACK_VIDEO_URL)
        {:else}
          Fallback video failed to load (path or codec issue)
        {/if}
      </div>
    {/if}
    <video
      id={LIVE_VIDEO_ID}
      style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; object-position: center center; display: block; opacity: {isStreaming ? 1 : 0}; transition: opacity 0.5s ease;"
      autoplay
      playsinline
      muted
    ></video>
  </div>

  <!-- Floating label — top left -->
  <div style="position: absolute; top: 24px; left: 28px; z-index: 20; display: flex; flex-direction: column; gap: 4px;">
    <span style="font-size: 14px; letter-spacing: 0.14em; color: {C.fgBright}">Key: {activeKeyLabel}</span>
  </div>

  <!-- Floating status — bottom left -->
  <div style="position: absolute; bottom: 28px; left: 28px; z-index: 20; display: flex; align-items: center; gap: 10px;">
    <span style="font-size: 10px; letter-spacing: 0.1em; color: {C.fgBright}">{isStreaming ? '▶' : '■'}</span>
    <span style="font-size: 10px; letter-spacing: 0.08em; color: {C.fgText}">{isStreaming ? 'Live - this video is being streamed from touch designer' : 'Standby - playing fallback movie'}</span>
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

</style>
