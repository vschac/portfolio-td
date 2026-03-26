<script>
  import { onDestroy, onMount } from "svelte";
  import { SimpleSignalingClient, SimpleWebRTCReceiver } from "./webrtc.js";

  const SIGNALING_WS_URL = import.meta.env.VITE_CONTROL_WS;

  if (!SIGNALING_WS_URL) {
    throw new Error("Missing VITE_CONTROL_WS. Set it in .env.local or Vercel env settings.");
  }

  let remoteVideo;
  let streamPlaceholder;

  let signalingClient = null;
  let webrtcReceiver = null;
  let syncIntervalId = null;
  let removeListeners = () => {};

  const logStatus = (message) => {
    console.log(`[STATUS] ${message}`);
  };

  onMount(() => {
    const root = document.getElementById("root");
    if (!root) {
      throw new Error("Missing #root element in index.html");
    }

    const syncPlaceholderFromStream = () => {
      const hasStream = Boolean(remoteVideo?.srcObject);
      if (!remoteVideo || !streamPlaceholder) {
        return;
      }

      remoteVideo.style.display = hasStream ? "block" : "none";
      streamPlaceholder.style.display = hasStream ? "none" : "block";
    };

    const eventNames = ["loadedmetadata", "play", "pause", "ended", "emptied"];
    const unsubscribers = eventNames.map((eventName) => {
      remoteVideo.addEventListener(eventName, syncPlaceholderFromStream);
      return () => remoteVideo.removeEventListener(eventName, syncPlaceholderFromStream);
    });

    removeListeners = () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };

    syncPlaceholderFromStream();
    syncIntervalId = window.setInterval(syncPlaceholderFromStream, 1000);

    signalingClient = new SimpleSignalingClient(SIGNALING_WS_URL, { logStatus });
    webrtcReceiver = new SimpleWebRTCReceiver(signalingClient, remoteVideo, { logStatus });
    signalingClient.connect();

    if (typeof window !== "undefined") {
      window.webrtcReceiver = webrtcReceiver;
      window.signalingClient = signalingClient;
      window.remoteVideo = remoteVideo;
    }
  });

  onDestroy(() => {
    removeListeners();
    if (syncIntervalId !== null) {
      window.clearInterval(syncIntervalId);
      syncIntervalId = null;
    }
  });
</script>

<main class="page">
  <div class="stream-container">
    <div class="stream-placeholder" bind:this={streamPlaceholder}></div>
    <video class="remote-video" bind:this={remoteVideo} autoplay playsinline muted></video>
  </div>
</main>

<style>
  :global(html) {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #000;
  }

  :global(#root) {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .page {
    position: relative;
    width: 100%;
    height: 100%;
    background: #000;
    overflow: hidden;
  }

  .stream-container {
    position: absolute;
    left: 10px;
    top: 10px;
    width: 640px;
    height: 640px;
    background: #000;
  }

  .stream-placeholder {
    position: absolute;
    left: 10px;
    top: 10px;
    width: 640px;
    height: 640px;
    background: #fff;
  }

  .remote-video {
    position: absolute;
    left: 0;
    top: 0;
    width: 1280px;
    height: 1280px;
    background: #000;
    object-fit: contain;
    object-position: center center;
    display: none;
  }
</style>
