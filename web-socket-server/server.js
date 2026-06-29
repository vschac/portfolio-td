const path = require("path");

// Load the .env sitting next to this file, regardless of the directory node is
// launched from
try {
  process.loadEnvFile(path.join(__dirname, ".env"));
} catch {
  /* no .env file — rely on process environment */
}

const WebSocket = require("ws");

const TD_PORT = Number(process.env.TD_PORT) || 9000;
const VIEWER_PORT = Number(process.env.VIEWER_PORT) || 9001;
const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

if (ALLOWED_ORIGINS.size === 0) {
  console.warn(
    "[SIGNALING] ALLOWED_ORIGINS is empty — all browser clients will be rejected. Set ALLOWED_ORIGINS to a comma-separated list.",
  );
}

const SIGNALING_API_VERSION = process.env.SIGNALING_API_VERSION || "1.0.1";
const SIGNALING_COMP_VERSION = process.env.SIGNALING_COMP_VERSION || "1.0.1";
const SIGNALING_PROJECT_NAME =
  process.env.SIGNALING_PROJECT_NAME || "TDWebRTCWebDemo";
const SIGNALING_ORIGIN = process.env.SIGNALING_ORIGIN || "NodeSignalingServer";
const SERVER_SENDER = "signaling-server";

let nextClientId = 1;
const clients = new Map(); // ws -> client
const clientsByAddress = new Map(); // address -> client

// TD listener: loopback only. Kernel guarantees no external interface can reach this.
const tdServer = new WebSocket.Server({
  host: "127.0.0.1",
  port: TD_PORT,
});

// Viewer listener: loopback only. Cloudflare Tunnel (cloudflared) forwards
// public wss traffic to this port, so nothing but the local tunnel needs to
// reach it. Origin allowlist is the auth boundary for browser clients.
const viewerServer = new WebSocket.Server({
  host: "127.0.0.1",
  port: VIEWER_PORT,
  verifyClient: (info, done) => {
    const origin = info?.req?.headers?.origin;

    if (origin && ALLOWED_ORIGINS.has(origin)) {
      return done(true);
    }

    console.warn(
      `[SIGNALING] Rejected viewer connection: origin=${origin || "none"}`,
    );
    done(false, 401, "Unauthorized");
  },
});

console.log(`[SIGNALING] TD listener on 127.0.0.1:${TD_PORT} (loopback only)`);
console.log(
  `[SIGNALING] Viewer listener on 127.0.0.1:${VIEWER_PORT} (Cloudflare Tunnel target)`,
);

function sendJson(ws, payload) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return;
  }
  ws.send(JSON.stringify(payload));
}

function getClientList() {
  return [...clients.values()].map((client) => ({
    id: client.id,
    address: client.address,
    role: client.role,
    properties: client.properties,
  }));
}

function broadcast(payload, exceptWs = null) {
  for (const client of clients.values()) {
    if (client.ws === exceptWs) {
      continue;
    }
    sendJson(client.ws, payload);
  }
}

function withMetadata(signalingType, content = {}, target = null) {
  return {
    metadata: {
      apiVersion: SIGNALING_API_VERSION,
      compVersion: SIGNALING_COMP_VERSION,
      compOrigin: SIGNALING_ORIGIN,
      projectName: SIGNALING_PROJECT_NAME,
    },
    signalingType,
    sender: SERVER_SENDER,
    target,
    content,
  };
}

function normalizeSignalingType(rawType) {
  if (typeof rawType !== "string") {
    return null;
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

  return null;
}

function routeSignaling(fromClient, message) {
  const signalingType = normalizeSignalingType(
    message?.signalingType || message?.type,
  );
  const { target, content, metadata } = message;

  if (!signalingType) {
    console.warn(
      `[SIGNALING] Unsupported signaling type from ${fromClient.address}:`,
      message?.signalingType || message?.type,
    );
    return;
  }

  const destination = clientsByAddress.get(target);

  if (!destination) {
    console.warn(
      `[SIGNALING] Target not found for ${signalingType}: ${target}`,
    );
    return;
  }

  // Only allow signaling between a viewer and the TD — never viewer↔viewer.
  if (fromClient.role === destination.role) {
    console.warn(
      `[SIGNALING] Blocked same-role routing: ${fromClient.role} ${fromClient.address} -> ${destination.address}`,
    );
    return;
  }

  sendJson(destination.ws, {
    metadata: metadata || {
      apiVersion: SIGNALING_API_VERSION,
      compVersion: SIGNALING_COMP_VERSION,
      compOrigin: SIGNALING_ORIGIN,
      projectName: SIGNALING_PROJECT_NAME,
    },
    signalingType,
    sender: fromClient.address,
    target: destination.address,
    content: content || {},
  });

  console.log(
    `[SIGNALING] ${signalingType} ${fromClient.address} -> ${destination.address}`,
  );
}

function handleConnection(role) {
  return (ws, req) => {
    const id = nextClientId++;
    const address = `client-${id}`;
    const now = Date.now();
    const remoteIp = req?.socket?.remoteAddress || "unknown-ip";
    const userAgent = req?.headers?.["user-agent"] || "unknown";

    const client = {
      id,
      address,
      role,
      ws,
      properties: {
        timeJoined: now,
        userAgent,
      },
    };

    clients.set(ws, client);
    clientsByAddress.set(address, client);

    console.log(
      `[SIGNALING] Client connected: ${address} role=${role} (${remoteIp})`,
    );

    sendJson(
      ws,
      withMetadata(
        "ClientEntered",
        {
          self: {
            id: client.id,
            address: client.address,
            role: client.role,
            properties: client.properties,
          },
        },
        client.address,
      ),
    );

    sendJson(
      ws,
      withMetadata(
        "Clients",
        {
          clients: getClientList(),
        },
        client.address,
      ),
    );

    broadcast(
      withMetadata("ClientEnter", {
        client: {
          id: client.id,
          address: client.address,
          role: client.role,
          properties: client.properties,
        },
      }),
      ws,
    );

    ws.on("message", (rawMessage) => {
      const text = rawMessage.toString();

      if (text === "TD_CONNECT") {
        console.log(
          `[SIGNALING] Handshake probe received from ${client.address}: TD_CONNECT`,
        );
        return;
      }

      let message;
      try {
        message = JSON.parse(text);
      } catch {
        console.warn(
          `[SIGNALING] Ignoring non-JSON message from ${client.address}`,
        );
        console.warn("[SIGNALING] Raw message payload:", text);
        return;
      }

      const signalingType = normalizeSignalingType(
        message?.signalingType || message?.type,
      );
      if (!signalingType) {
        console.warn(
          `[SIGNALING] Ignoring unsupported signaling type from ${client.address}:`,
          message?.signalingType || message?.type,
        );
        return;
      }

      message.signalingType = signalingType;
      routeSignaling(client, message);
    });

    ws.on("close", (code, reasonBuffer) => {
      clients.delete(ws);
      clientsByAddress.delete(client.address);

      const reason = reasonBuffer?.toString?.() || "";
      console.log(
        `[SIGNALING] Client disconnected: ${client.address} code=${code} reason=${reason || "none"} ua=${userAgent}`,
      );

      broadcast(
        withMetadata("ClientExit", {
          client: {
            id: client.id,
            address: client.address,
            role: client.role,
            properties: client.properties,
          },
        }),
      );
    });

    ws.on("error", (error) => {
      console.error(`[SIGNALING] Socket error (${client.address})`, error);
    });
  };
}

tdServer.on("connection", handleConnection("td"));
viewerServer.on("connection", handleConnection("viewer"));
