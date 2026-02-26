import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// ── API CONFIGURATION ──────────────────────────
// Use the current hostname to ensure LAN works (mobile devices)
const getApiBaseUrl = () => {
  const { hostname, protocol } = window.location;
  // If we're on localhost, stick to localhost:5000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  // Otherwise, assume the backend is on the same host, port 5000
  return `${protocol}//${hostname}:5000`;
};

axios.defaults.baseURL = import.meta.env.VITE_API_URL || getApiBaseUrl();

// Set default auth header from localStorage on startup
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
