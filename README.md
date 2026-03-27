# 🌾 KrishiMitra - Smart AI Farming Assistant

KrishiMitra is an AI-powered agricultural companion designed to help farmers in India optimize their crop yields through data-driven insights. Developed for the 2026 Agri-Tech Hackathon, it combines real-time sensor monitoring with the latest **Gemini 2.5 Flash** model to provide actionable advice.

---

## ✨ Key Features

- **🤖 AI Agronomist Chat:** Get instant answers to complex farming questions in English, Hindi, or Marathi.
- **📸 Crop Diagnostics:** Upload photos of affected crops for instant disease identification and treatment plans.
- **💡 Smart Recommendations:** Receive personalized irrigation and fertilization advice based on real-time soil moisture (VWC), NPK levels, and pH.
- **☁️ Weather Integration:** Real-time weather monitoring and local forecasts to plan your day.
- **📊 Soil History Tracking:** Monitor soil health trends over time with automated data logging.
- **🔐 Secure Access:** Full JWT-based authentication system to protect farmer data.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React (Icons), Motion (Animations)
- **Backend:** Node.js, Express, TSX
- **AI:** Google Gemini 2.5 Flash (Generative AI SDK)
- **Database:** SQLite3 (Server-side storage)
- **Authentication:** JSON Web Tokens (JWT)

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v24 or later recommended)
- A Google Gemini API Key

### 2. Installation
```bash
# Clone the repository and install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add:
```env
GEMINI_API_KEY="your_api_key_here"
JWT_SECRET="your_secure_secret"
```

### 4. Running the App
```bash
# Start the backend server (Port 4000)
npm run dev:server

# Start the frontend dev environment (Port 3000)
npm run dev
```

---

## 📦 Deployment

The project is production-ready and optimized for **Vercel** and **Render**.

1.  **Backend:** Deploy the `backend/` directory to **Render.com** (Web Service).
2.  **Frontend:** Deploy the root directory to **Vercel.com**.
3.  **Proxy:** Ensure your `vercel.json` points to your live backend URL.

---

## 👨‍🌾 About the Project
KrishiMitra was built to bridge the gap between advanced agricultural science and small-scale farmers, providing expert-level advice at their fingertips.

