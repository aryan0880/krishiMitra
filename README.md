# KrishiMitra - Smart Farming Assistant

This project is a full-stack application designed to help farmers with AI-driven insights for irrigation and fertilization.

## Deployment Instructions

The project is structured such that the Node.js backend serves the built React frontend. This allows you to deploy it as a single application.

### 1. Build the Frontend
If you've made changes to the React code, rebuild the frontend:
```bash
npm run build
```

### 2. Set Environment Variables
The following environment variables should be set in your hosting provider (e.g., Railway, Render, Heroku):
- `GEMINI_API_KEY`: Your Google Gemini API key.
- `BACKEND_PORT`: The port for the server (defaults to 4000).
- `JWT_SECRET`: Secret for authentication (if auth is restored).

### 3. Deploy
Set the start command of your hosting provider to:
```bash
npm start
```
(Or `npx tsx backend/server.ts` if you haven't built the backend).

### Current Status
- Both servers are currently running locally on ports 3000 (frontend) and 4000 (backend).
- The `dist/` folder contains the latest production build.
- The `backend/server.ts` is configured to serve the `dist/` folder directly.
