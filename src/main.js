const WS_SERVER = import.meta.env.VITE_CONTROL_WS;

console.log("Connecting to websocket:", WS_SERVER);

const socket = new WebSocket(WS_SERVER);

socket.onopen = () => {
  console.log("WebSocket connected");
};

socket.onclose = () => {
  console.log("WebSocket closed");
};

socket.onerror = (err) => {
  console.error("WebSocket error:", err);
};

document.addEventListener("keydown", (event) => {
  if (["1", "2", "3"].includes(event.key)) {
    console.log("Sending key:", event.key);

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(event.key);
    }
  }
});
