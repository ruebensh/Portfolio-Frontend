import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global fetch interceptor to handle 401 errors across all admin pages
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  const response = await originalFetch.apply(this, args);
  if (response.status === 401 && window.location.hash.includes("#/admin") && !window.location.hash.includes("login")) {
    localStorage.removeItem("admin_token");
    window.dispatchEvent(new Event("admin-logout"));
    window.location.href = "/#/admin/login";
  }
  return response;
};

createRoot(document.getElementById("root")!).render(<App />);