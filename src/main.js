import { mount } from "svelte";
import App from "./App.svelte";
import "./styles/index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element in index.html");
}

mount(App, { target: root });
