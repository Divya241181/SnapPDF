import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'


// ── API CONFIGURATION ──────────────────────────
// Use the current hostname to ensure LAN works (mobile devices)
const getApiBaseUrl = () => {
  const { hostname, protocol } = window.location;

  // 1. Local Development (localhost)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  // 2. Private Network IPs (Mobile Testing on LAN)
  // Detects 192.168.x.x, 10.x.x.x, 172.16-31.x.x
  const isPrivateIp = /^(192\.168|10|127|172\.(1[6-9]|2[0-9]|3[0-1]))/.test(hostname);
  if (isPrivateIp) {
    return `${protocol}//${hostname}:5000`;
  }

  // 3. Production / GitHub Pages
  return import.meta.env.VITE_API_URL || 'https://snappdf-na6s.onrender.com';
};

axios.defaults.baseURL = getApiBaseUrl();

// Set default auth header from localStorage on startup
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
