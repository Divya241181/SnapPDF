// Central API configuration
// In development: reads from .env (VITE_API_URL=http://localhost:5000)
// In production (Vercel): set VITE_API_URL to your Render backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_URL;
