import React from "react";
import ReactDOM from "react-dom/client";
import App from "./frontend/App";
import "./index.css";

// Grab the root element
const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement as HTMLElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("❌ Root element with ID 'root' not found in index.html");
}
