import axios from "axios";

// Helper to read cookies (used for csrftoken)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

const axiosClient = axios.create({
  baseURL: "http://localhost:8000/api/",
  withCredentials: true, // include session cookie for cross-site requests
});

// Add CSRF token header for unsafe methods automatically
axiosClient.interceptors.request.use((config) => {
  const csrfToken = getCookie("csrftoken");
  if (csrfToken) {
    config.headers = config.headers || {};
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});

export default axiosClient;
