// Backend API URL
const API_BASE_URL = window.location.hostname.includes('vercel.app')
  ? 'https://future-ai-backend.onrender.com'  // Production backend URL
  : process.env.NODE_ENV === 'production'
    ? 'https://future-ai-backend.onrender.com'  // Also use production URL for other production builds
    : 'http://localhost:5000';  // Development backend URL

export { API_BASE_URL };
