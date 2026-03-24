/**
 * Minimal WebRTC receiver client.
 *
 * What it does:
 * - Connects to signaling WebSocket
 * - Finds first remote peer
 * - Negotiates a receive-only video connection
 * - Renders remote stream in <video>
 *
 */

const SIGNALING_WS_URL = import.meta.env.VITE_CONTROL_WS;

if (!SIGNALING_WS_URL) {
  throw new Error("Missing VITE_CONTROL_WS. Set it in .env.local or Vercel env settings.");
}

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element in index.html");
}

document.documentElement.style.margin = "0";
document.documentElement.style.padding = "0";
document.documentElement.style.width = "100%";
document.documentElement.style.height = "100%";

document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.width = "100%";
document.body.style.height = "100%";
document.body.style.overflow = "hidden";
document.body.style.background = "#000";

root.style.margin = "500px";
root.style.padding = "10px";
root.style.width = "100%";
root.style.height = "100%";
root.style.overflow = "hidden";

root.innerHTML = `
  <main style="position: relative; width: 100%; height: 100%; background: #000; overflow: hidden;">
    <video
      id="remoteVideo"
      autoplay
      playsinline
      muted
      style="position: absolute; left: 0; top: 0; width: 600px; height: 600px; background: #000; object-fit: contain; object-position: center center;"
    ></video>
  </main>
`;

const statusEl = document.getElementById("status");
const remoteVideo = document.getElementById("remoteVideo");

const logStatus = (message) => {
  console.log(`[STATUS] ${message}`);
  if (statusEl) {
    statusEl.textContent = message;
  }
};

const logSignal = (label, payload) => {
  console.log(`[SIGNALING] ${label}`, payload || "");
};

const logRtc = (label, payload) => {
  console.log(`[WEBRTC] ${label}`, payload || "");
};

const normalizeSignalingType = (rawType) => {
  if (typeof rawType !== "string") {
    return "";
  }

  const normalized = rawType.trim().toLowerCase();
  if (normalized === "offer") {
    return "Offer";
  }
  if (normalized === "answer") {
    return "Answer";
  }
  if (normalized === "ice" || normalized === "candidate") {
    return "Ice";
  }
  if (normalized === "clients") {
    return "Clients";
  }
  if (normalized === "cliententer") {
    return "ClientEnter";
  }
  if (normalized === "cliententered") {
    return "ClientEntered";
  }
  if (normalized === "clientexit") {
    return "ClientExit";
  }

  return rawType;
};

class SimpleSignalingClient {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.self = null;
    this.clients = [];
    this.webrtc = null;
  }

  connect() {
    logStatus(`Connecting signaling: ${this.url}`);
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      logStatus("Signaling connected. Waiting for peer…");
      logSignal("socket open");
    };

    this.socket.onclose = () => {
      logStatus("Signaling disconnected.");
      logSignal("socket closed");
    };

    this.socket.onerror = (error) => {
      console.error("[SIGNALING] Error", error);
      logStatus("Signaling error. Check console.");
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error("[SIGNALING] Invalid JSON", error, event.data);
      }
    };
  }

  send(message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    logSignal("send", message);
    this.socket.send(JSON.stringify(message));
  }

  setWebRTCConnection(connection) {
    this.webrtc = connection;
  }

  getFirstRemoteClient() {
    if (!this.self) {
      return null;
    }
    return this.clients.find((client) => client.id !== this.self.id) || null;
  }

  handleMessage(message) {
    const type = normalizeSignalingType(message?.signalingType || message?.type);
    logSignal(`recv ${type || "unknown"}`, message);

    switch (type) {
      case "Clients": {
        this.clients = message?.content?.clients || [];
        logSignal("clients list", this.clients);
        break;
      }
      case "ClientEnter": {
        const client = message?.content?.client;
        if (client && !this.clients.some((c) => c.id === client.id)) {
          this.clients.push(client);
        }
        logSignal("client enter", client);
        break;
      }
      case "ClientEntered": {
        this.self = message?.content?.self || null;
        logSignal("self assigned", this.self);
        break;
      }
      case "ClientExit": {
        const exitedId = message?.content?.client?.id;
        this.clients = this.clients.filter((client) => client.id !== exitedId);
        logSignal("client exit", message?.content?.client || null);
        break;
      }
      case "Offer":
      case "Answer":
      case "Ice": {
        if (this.webrtc) {
          this.webrtc.onSignalingMessage(message);
        }
        break;
      }
      default:
        break;
    }

    if (this.webrtc) {
      this.webrtc.tryAutoConnect();
    }
  }
}

class SimpleWebRTCReceiver {
  constructor(signalingClient, videoElement) {
    this.signalingClient = signalingClient;
    this.videoElement = videoElement;
    this.peerConnection = null;
    this.targetAddress = null;
    this.polite = false;
    this.makingOffer = false;
    this.ignoreOffer = false;
    this.isSettingRemoteAnswerPending = false;

    this.signalingClient.setWebRTCConnection(this);
  }

  createPeerConnection() {
    if (this.peerConnection) {
      return;
    }

    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    logRtc("peer connection created");

    // Receive-only video.
    this.peerConnection.addTransceiver("video", { direction: "recvonly" });

    this.peerConnection.ontrack = (event) => {
      const [stream] = event.streams;
      if (!stream) {
        return;
      }

      if (event.track?.kind !== "video") {
        logRtc("non-video track received", {
          kind: event.track?.kind,
          id: event.track?.id,
          streamId: stream.id
        });
        return;
      }

      logRtc("remote track received", {
        kind: event.track?.kind,
        id: event.track?.id,
        streamId: stream.id
      });

      if (this.videoElement.srcObject !== stream) {
        this.videoElement.srcObject = stream;
      }

      // Better autoplay compatibility in browsers.
      this.videoElement.muted = true;

      let playAttemptInFlight = false;
      const tryPlay = () => {
        if (playAttemptInFlight) {
          return;
        }

        playAttemptInFlight = true;
        this.videoElement
          .play()
          .then(() => {
            logStatus("Streaming remote video.");
            logRtc("video playback started", {
              videoWidth: this.videoElement.videoWidth,
              videoHeight: this.videoElement.videoHeight
            });
          })
          .catch((error) => {
            if (error?.name === "AbortError") {
              logRtc("play interrupted by source update; will retry on next media event");
              return;
            }

            console.warn("Autoplay blocked by browser", error);
            logStatus("Remote stream received. Click play on video if needed.");
          })
          .finally(() => {
            playAttemptInFlight = false;
          });
      };

      // ontrack can fire before media actually starts; wait for unmute when possible.
      if (event.track) {
        event.track.onunmute = () => {
          logRtc("remote track unmuted", {
            kind: event.track?.kind,
            id: event.track?.id
          });
          tryPlay();
        };
      }

      this.videoElement.onloadedmetadata = () => {
        logRtc("remote metadata loaded", {
          videoWidth: this.videoElement.videoWidth,
          videoHeight: this.videoElement.videoHeight
        });
        tryPlay();
      };

      tryPlay();
    };

    this.peerConnection.onicecandidate = (event) => {
      if (!event.candidate || !this.targetAddress) {
        return;
      }

      this.sendSignaling("Ice", {
        sdpCandidate: event.candidate.candidate,
        sdpMLineIndex: event.candidate.sdpMLineIndex,
        sdpMid: event.candidate.sdpMid
      });

      logRtc("local ice candidate sent", event.candidate);
    };

    this.peerConnection.onnegotiationneeded = async () => {
      if (this.makingOffer || !this.targetAddress) {
        return;
      }

      try {
        this.makingOffer = true;
        logRtc("creating offer");

        await this.peerConnection.setLocalDescription();

        this.sendSignaling("Offer", {
          type: "offer",
          sdp: this.peerConnection.localDescription?.sdp || ""
        });

        logRtc("offer sent");
      } catch (error) {
        console.error("[WEBRTC] Offer error", error);
      } finally {
        this.makingOffer = false;
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      logRtc(`ice state: ${this.peerConnection.iceConnectionState}`);
    };

    this.peerConnection.onconnectionstatechange = () => {
      logStatus(`Peer state: ${this.peerConnection.connectionState}`);
      logRtc(`connection state: ${this.peerConnection.connectionState}`);
    };
  }

  sendSignaling(signalingType, content) {
    if (!this.targetAddress) {
      return;
    }

    this.signalingClient.send({
      metadata: {
        apiVersion: "1.0.1",
        compVersion: "1.0.1",
        compOrigin: "WebRTC",
        projectName: "TDWebRTCWebDemo"
      },
      signalingType,
      sender: null,
      target: this.targetAddress,
      content
    });
  }

  tryAutoConnect() {
    const target = this.signalingClient.getFirstRemoteClient();
    if (!target || !target.address) {
      return;
    }

    if (this.targetAddress === target.address && this.peerConnection) {
      return;
    }

    this.targetAddress = target.address;
    const selfJoin = this.signalingClient?.self?.properties?.timeJoined;
    const targetJoin = target?.properties?.timeJoined;
    this.polite =
      typeof selfJoin === "number" && typeof targetJoin === "number"
        ? selfJoin < targetJoin
        : false;
    logStatus(`Found peer: ${target.address}. Establishing WebRTC…`);
    logRtc("target peer selected", target);
    this.createPeerConnection();
  }

  async onSignalingMessage(message) {
    if (!this.peerConnection) {
      this.createPeerConnection();
    }

    this.targetAddress = message.sender || this.targetAddress;

    const type = normalizeSignalingType(message?.signalingType || message?.type);

    switch (type) {
      case "Offer": {
        const readyForOffer =
          !this.makingOffer &&
          (this.peerConnection.signalingState === "stable" ||
            this.isSettingRemoteAnswerPending);
        const offerCollision = !readyForOffer;

        this.ignoreOffer = !this.polite && offerCollision;
        if (this.ignoreOffer) {
          logRtc("ignoring offer due to collision and impolite role");
          break;
        }

        try {
          logRtc("offer received");
          await this.peerConnection.setRemoteDescription({
            type: "offer",
            sdp: message?.content?.sdp || ""
          });

          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);

          this.sendSignaling("Answer", {
            type: "answer",
            sdp: this.peerConnection.localDescription?.sdp || ""
          });
          logRtc("answer sent");
        } catch (error) {
          console.error("[WEBRTC] Failed handling offer", error);
        }
        break;
      }

      case "Answer": {
        try {
          logRtc("answer received");
          this.isSettingRemoteAnswerPending = true;
          await this.peerConnection.setRemoteDescription({
            type: "answer",
            sdp: message?.content?.sdp || ""
          });
          logRtc("remote description set from answer");
        } catch (error) {
          console.error("[WEBRTC] Failed handling answer", error);
        } finally {
          this.isSettingRemoteAnswerPending = false;
        }
        break;
      }

      case "Ice": {
        try {
          if (this.ignoreOffer) {
            logRtc("ignoring remote ice due to ignored offer collision");
            break;
          }

          logRtc("remote ice received", message?.content || null);
          const candidateText =
            message?.content?.sdpCandidate ||
            message?.content?.candidate ||
            "";

          const candidate = new RTCIceCandidate({
            candidate: candidateText,
            sdpMLineIndex:
              message?.content?.sdpMLineIndex ??
              message?.content?.mLineIndex ??
              null,
            sdpMid: message?.content?.sdpMid || message?.content?.mid || null
          });

          await this.peerConnection.addIceCandidate(candidate);
          logRtc("remote ice candidate added");
        } catch (error) {
          console.error("[WEBRTC] Failed adding ICE candidate", error);
        }
        break;
      }

      default:
        break;
    }
  }
}

const signalingClient = new SimpleSignalingClient(SIGNALING_WS_URL);
const webrtcReceiver = new SimpleWebRTCReceiver(signalingClient, remoteVideo);

if (typeof window !== "undefined") {
  window.webrtcReceiver = webrtcReceiver;
  window.signalingClient = signalingClient;
  window.remoteVideo = remoteVideo;
}

void webrtcReceiver;
signalingClient.connect();
