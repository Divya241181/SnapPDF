import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// ── API CONFIGURATION ──────────────────────────
// Use the current hostname to ensure LAN works (mobile devices)
const getApiBaseUrl = () => {
  const { hostname } = window.location;

  // 1. Local Development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  // 2. Production / GitHub Pages
  // You should set VITE_API_URL in your deployment environment
  return import.meta.env.VITE_API_URL || 'https://snappdf-backend.onrender.com';
};

axios.defaults.baseURL = getApiBaseUrl();

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
