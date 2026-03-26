import App from "./App.svelte";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element in index.html");
}

new App({
  target: root
});
