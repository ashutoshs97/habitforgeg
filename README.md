# HabitForge

HabitForge is a comprehensive, gamified habit-tracking platform designed to help users build good habits and break bad ones. Built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript, it leverages AI for personalized insights and multimodal data entry.

## Features

### 🎮 Gamification Engine
- **Experience & Leveling:** Users earn Willpower Points (WP) for every action, leveling up as they progress.
- **Streaks:** Advanced streak calculation with visual heatmaps.
- **Achievements:** Over 15 unique unlockable badges based on consistency, volume, and variety.

### 🤖 AI-Powered Tools
- **Food Scanner:** Integrates Google Gemini 2.5 Flash for multimodal analysis. Users can snap photos of meals to automatically log calories and nutrition data.
- **Goal Refinement Coach:** A behavioral analysis engine that reviews user logs to identify failure patterns and suggests concrete, actionable adjustments to habit goals.
- **Smart Chatbot:** An in-app coach ("Forgey") providing context-aware motivation.

### 🤝 Social Connectivity
- **Shared Habits:** Invite friends to join specific habits.
- **Group Progress:** View collective completion calendars and chat within habit groups.
- **Real-time Notifications:** Alerts for friend invites, comments, and milestone celebrations.

### 💎 Premium & Monetization
- **Subscription Model:** Tiered access (Free/Premium).
- **Payment Integration:** Secure checkout flow using PayPal/Stripe architecture (Order Creation -> Capture).
- **Exclusive Features:** Premium users gain access to advanced widgets and unlimited history.

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js
- **AI:** Google GenAI SDK (@google/genai)
- **Deployment:** Render (Backend), Vercel/Static (Frontend)

## Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/habitforge.git
   cd habitforge
   ```

2. **Install Dependencies**
   ```bash
   # Install root/frontend dependencies
   npm install

   # Install backend dependencies
   cd server
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   API_KEY=your_google_genai_api_key
   ```

4. **Run the Application**
   ```bash
   # Run Backend (from /server)
   npm start

   # Run Frontend (from root)
   npm run dev
   ```

## Architecture Notes

The application uses a unified Express backend (`server/index.js`) to handle all API requests, including AI processing, payment transactions, and data exports. The frontend communicates via RESTful endpoints, with a robust Context API (`HabitContext`) managing global state and optimistic UI updates.

---
© 2025 HabitForge. All rights reserved.