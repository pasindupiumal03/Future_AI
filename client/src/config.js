const isProduction = process.env.NODE_ENV === 'production';

// Update this with your Render backend URL after deployment
const API_BASE_URL = isProduction 
  ? 'https://your-render-backend-url.onrender.com' 
  : 'http://localhost:5000';

export { API_BASE_URL };
