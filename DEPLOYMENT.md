# Deployment Guide for Future AI

This guide explains how to deploy the Future AI application to Render.

## Prerequisites

1. A Render.com account (free tier available)
2. GitHub/GitLab account with access to this repository
3. API keys for:
   - OpenAI

## Backend Deployment

1. **Prepare your backend**
   - Make sure all dependencies are listed in `server/package.json`
   - Update the `start` script in `server/package.json` to use the correct entry point

2. **Deploy to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" and select "Web Service"
   - Connect your GitHub/GitLab repository
   - Configure the service:
     - Name: `future-ai-backend`
     - Region: Choose the one closest to your users
     - Branch: `main` or your deployment branch
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Add environment variables from `.env.example` in the Render dashboard
   - Click "Create Web Service"

## Frontend Deployment

1. **Update API Endpoint**
   - In `client/src/config.js` (or wherever your API URL is configured), update the API URL to point to your deployed backend:
     ```javascript
     export const API_URL = 'https://future-ai-backend.onrender.com';
     ```

2. **Deploy to Render**
   - In the Render Dashboard, click "New" and select "Static Site"
   - Connect your GitHub/GitLab repository
   - Configure the site:
     - Name: `future-ai-frontend`
     - Branch: `main` or your deployment branch
     - Build Command: `cd client && npm install && npm run build`
     - Publish Directory: `client/build`
   - Add environment variables if needed
   - Click "Create Static Site"

## Environment Variables

Make sure to set these environment variables in your Render dashboard for the backend service:

- `PORT`: The port your server should run on (e.g., `10000`)
- `NODE_ENV`: `production`
- `OPENAI_API_KEY`: Your OpenAI API key
- `STABILITY_API_KEY`: Your Stability AI API key
- (Optional) `MONGODB_URI`: Your MongoDB connection string if using a database

## Custom Domain (Optional)

1. In your Render dashboard, select your web service
2. Click on "Settings"
3. Under "Custom Domains", click "Add Custom Domain"
4. Follow the instructions to verify domain ownership and set up DNS records

## Monitoring and Logs

- View logs in the Render dashboard under your service
- Set up alerts for errors and performance issues
- Monitor resource usage and scale if needed
