const isProduction = process.env.NODE_ENV === 'production';

// Backend API URL
const API_BASE_URL = isProduction 
  ? 'https://future-ai-backend.onrender.com' 
  : 'http://localhost:5000';

export { API_BASE_URL };
