import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./src/index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
// codes/src/main.js
document.getElementById("app").innerHTML = `
  <h1>Hello from Vite!</h1>
  <p>It works 🎉</p>
`;
