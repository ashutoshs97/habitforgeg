
/**
 * @file advanced_habit_features.jsx
 * @description A self-contained React/Node.js (Express) application prototype.
 * This file includes all frontend components and backend API logic to demonstrate
 * three advanced features: AI-Powered Insights, Habit Stacks, and Home Screen Widgets.
 */

// ===================================================================================
//
// ⚙️ FAKE BACKEND & DATA SIMULATION
// In a real application, this data would come from a database.
//
// ===================================================================================

/**
 * @typedef {Object} UserData
 * @property {number} id
 * @property {string} name
 * @property {number} total_points
 * @property {number} level
 */

/** @type {UserData} */
const mockUserData = {
  id: 1,
  name: "Alex",
  total_points: 1250,
  level: 12,
};

/**
 * @typedef {Object} Habit
 * @property {number} id
 * @property {string} name
 * @property {string} emoji
 */

/** @type {Habit[]} */
const mockHabits = [
  { id: 101, name: "Read 20 Pages", emoji: "📚" }, // Strong habit
  { id: 102, name: "Morning Meditation", emoji: "🧘" },
  { id: 103, name: "Workout for 30 mins", emoji: "💪" }, // Weak habit
  { id: 104, name: "Drink 8 Glasses of Water", emoji: "💧" },
  { id: 105, name: "No Social Media After 9 PM", emoji: "📱" },
];

/**
 * @typedef {Object} CheckinLog
 * @property {number} userId
 * @property {number} habitId
 * @property {string} date - Format: 'YYYY-MM-DD'
 * @property {boolean} completed
 */

/** @type {CheckinLog[]} */
const mockCheckinLogs = (() => {
  const logs = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    // Habit 101 (Strong): Completed ~90% of the time
    if (Math.random() > 0.1) logs.push({ userId: 1, habitId: 101, date: dateString, completed: true });
    // Habit 102: Completed ~70% of the time
    if (Math.random() > 0.3) logs.push({ userId: 1, habitId: 102, date: dateString, completed: true });
    // Habit 103 (Weak): Completed ~30% of the time
    if (Math.random() > 0.7) logs.push({ userId: 1, habitId: 103, date: dateString, completed: true });
    // Habit 104: Completed ~80% of the time
    if (Math.random() > 0.2) logs.push({ userId: 1, habitId: 104, date: dateString, completed: true });
    // Habit 105: Completed ~60% of the time
    if (Math.random() > 0.4) logs.push({ userId: 1, habitId: 105, date: dateString, completed: true });
  }
  return logs;
})();

/**
 * @typedef {Object} HabitStack
 * @property {number} id
 * @property {string} name
 * @property {string} emoji
 * @property {number[]} habitIds
 */

/** @type {HabitStack[]} */
const mockHabitStacks = [
  {
    id: 201,
    name: "Morning Routine",
    emoji: "☀️",
    habitIds: [102, 104],
  },
  {
    id: 202,
    name: "Evening Wind-down",
    emoji: "🌙",
    habitIds: [101, 105],
  },
];

// ===================================================================================
//
// ⚛️ REACT FRONTEND APPLICATION
// This section contains all the React components for the UI.
//
// ===================================================================================

const React = require("react");
const { useState, useEffect } = React;

// --- Helper Functions ---

/**
 * Calculates the current streak for a given habit from logs.
 * @param {number} habitId
 * @param {CheckinLog[]} logs
 * @returns {number}
 */
const calculateStreak = (habitId, logs) => {
  const habitLogs = logs
    .filter(log => log.habitId === habitId && log.completed)
    .map(log => log.date)
    .sort((a, b) => new Date(b) - new Date(a));

  if (habitLogs.length === 0) return 0;

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const mostRecentLog = new Date(habitLogs[0] + "T00:00:00"); // Avoid timezone issues
  const isTodayCompleted = today.toISOString().split("T")[0] === habitLogs[0];
  const isYesterdayCompleted = yesterday.toISOString().split("T")[0] === habitLogs[0];

  if (!isTodayCompleted && !isYesterdayCompleted) return 0;
  
  let streak = 0;
  if(isTodayCompleted || isYesterdayCompleted) {
    streak = 1;
    for (let i = 0; i < habitLogs.length - 1; i++) {
        const current = new Date(habitLogs[i]);
        const next = new Date(habitLogs[i+1]);
        const expectedPrevious = new Date(current);
        expectedPrevious.setDate(current.getDate() - 1);
        if (expectedPrevious.toISOString().split('T')[0] === next.toISOString().split('T')[0]) {
            streak++;
        } else {
            break;
        }
    }
  }

  return streak;
};


// --- Widget Components ---

/**
 * Widget to display the user's points and level.
 * @param {{ user: UserData }} props
 */
const PointTrackerWidget = ({ user }) => {
  return (
    <div className="bg-blue-100 text-blue-800 p-6 rounded-2xl shadow-md">
      <h3 className="font-bold text-lg mb-2">Progress</h3>
      <p className="text-4xl font-extrabold">{user.total_points.toLocaleString()}</p>
      <p className="font-semibold opacity-70">Willpower Points</p>
      <div className="mt-4 h-2 w-full bg-blue-200 rounded-full">
         <div className="h-2 bg-blue-500 rounded-full" style={{width: `${(user.total_points % 100)}%`}}></div>
      </div>
      <p className="text-right text-sm font-semibold mt-1">Level {user.level}</p>
    </div>
  );
};

/**
 * Widget to display the habit with the longest current streak.
 * @param {{ habits: Habit[], logs: CheckinLog[] }} props
 */
const TopStreakWidget = ({ habits, logs }) => {
  const [topHabit, setTopHabit] = useState({ name: '...', emoji: '⏳', streak: 0 });

  useEffect(() => {
    const streaks = habits.map(habit => ({
      ...habit,
      streak: calculateStreak(habit.id, logs),
    }));
    const top = streaks.sort((a, b) => b.streak - a.streak)[0];
    if (top) {
      setTopHabit(top);
    }
  }, [habits, logs]);
  
  return (
    <div className="bg-orange-100 text-orange-800 p-6 rounded-2xl shadow-md">
      <h3 className="font-bold text-lg mb-2">Top Streak</h3>
      <p className="text-4xl font-extrabold">{topHabit.streak} <span className="text-3xl">days</span></p>
      <p className="font-semibold opacity-70">{topHabit.emoji} {topHabit.name}</p>
    </div>
  );
};

// --- Habit Stack Component ---

/**
 * Displays a group of habits as a single routine.
 * @param {{ stack: HabitStack, allHabits: Habit[] }} props
 */
const HabitStackView = ({ stack, allHabits }) => {
    const habitsInStack = stack.habitIds.map(id => allHabits.find(h => h.id === id));

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h3 className="text-lg font-bold mb-4">{stack.emoji} {stack.name}</h3>
            <ul className="space-y-3 mb-4">
                {habitsInStack.map(habit => habit ? (
                    <li key={habit.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium">{habit.emoji} {habit.name}</span>
                        <input type="checkbox" className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                    </li>
                ) : null)}
            </ul>
            <button className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition">
                Check All
            </button>
        </div>
    );
};

// --- AI Insights Component ---

/**
 * Card to fetch and display AI-powered insights.
 */
const AIInsightsCard = () => {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);
    setInsights(null);
    try {
      // This fetch call targets the Node.js backend defined in this same file.
      const response = await fetch('http://localhost:4000/api/generate-insights');
      if (!response.ok) {
        throw new Error('Failed to fetch insights from the server.');
      }
      const data = await response.json();
      setInsights(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-gray-800 text-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-bold mb-4 flex items-center">
            <span className="text-xl mr-2">🤖</span> AI-Powered Insights
        </h3>
        {!insights && !isLoading && !error && (
             <p className="text-gray-400 mb-4">Click the button to analyze your recent progress and get personalized feedback.</p>
        )}
        {isLoading && <p className="text-gray-400">Analyzing your progress...</p>}
        {error && <p className="text-red-400">Error: {error}</p>}

        {insights && (
            <div className="space-y-4 animate-fade-in">
                <div className="bg-green-500/20 border border-green-500 p-4 rounded-lg">
                    <h4 className="font-bold text-green-300">Strong Pattern 💪</h4>
                    <p className="mt-1">{insights.strong_habit_pattern.motivational_message}</p>
                </div>
                <div className="bg-yellow-500/20 border border-yellow-500 p-4 rounded-lg">
                    <h4 className="font-bold text-yellow-300">Improvement Tip 💡</h4>
                    <p className="mt-1">{insights.weak_habit_point.improvement_recommendation}</p>
                </div>
            </div>
        )}
        
        <button 
            onClick={fetchInsights} 
            disabled={isLoading}
            className="w-full mt-6 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
        >
            {isLoading ? 'Generating...' : 'Generate New Insights'}
        </button>
    </div>
  );
};


/**
 * Main application component.
 */
const App = () => {
  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <header className="mb-8">
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>HabitForge Advanced Features</h1>
        <p style={{ color: '#6b7280' }}>A prototype of AI insights, widgets, and habit stacks.</p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Widgets Column */}
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-700 border-b pb-2">Widgets</h2>
            <PointTrackerWidget user={mockUserData} />
            <TopStreakWidget habits={mockHabits} logs={mockCheckinLogs} />
        </div>

        {/* Stacks Column */}
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-700 border-b pb-2">Habit Stacks</h2>
            {mockHabitStacks.map(stack => (
                <HabitStackView key={stack.id} stack={stack} allHabits={mockHabits} />
            ))}
        </div>

        {/* AI Insights Column */}
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-700 border-b pb-2">AI Coach</h2>
            <AIInsightsCard />
        </div>
      </main>
    </div>
  );
};


// ===================================================================================
//
// 🌐 NODE.JS (EXPRESS) BACKEND SERVER
// This section contains the backend server code.
// To run this, execute `node advanced_habit_features.jsx` in your terminal.
//
// ===================================================================================

const express = require("express");
const { GoogleGenAI, Type } = require("@google/genai");

// This check prevents the server from running in a client-side environment
if (typeof process !== 'undefined' && process.env) {
    const app = express();
    const port = 4000;

    // Middleware to allow cross-origin requests from a frontend dev server
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    /**
     * The core backend function to generate AI insights.
     */
    const generateInsights = async () => {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable is not set.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const systemInstruction = "You are a helpful and insightful Behavioral Analyst. Your role is to analyze a user's habit tracking data and provide one motivational insight and one actionable recommendation in a structured JSON format.";

        const prompt = `
            Analyze the provided JSON data containing the user's last 30 days of check-in logs and their current goals. 
            Identify one weak point (an inconsistent habit) and one strong pattern (a consistent habit). 
            Generate a recommendation to improve the weak point and a motivational message acknowledging the strong pattern.
            
            User Data:
            ${JSON.stringify({ habits: mockHabits, logs: mockCheckinLogs }, null, 2)}
        `;

        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            strong_habit_pattern: {
              type: Type.OBJECT,
              properties: {
                habit_name: { type: Type.STRING },
                motivational_message: { type: Type.STRING },
              },
            },
            weak_habit_point: {
              type: Type.OBJECT,
              properties: {
                habit_name: { type: Type.STRING },
                improvement_recommendation: { type: Type.STRING },
              },
            },
          },
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema,
            }
        });

        // The response.text is already a JSON string due to the config.
        return JSON.parse(response.text);
    };

    /**
     * API endpoint for the frontend to call.
     */
    app.get("/api/generate-insights", async (req, res) => {
        console.log("Received request for AI insights...");
        try {
            const insights = await generateInsights();
            console.log("Successfully generated insights.");
            res.json(insights);
        } catch (error) {
            console.error("Error generating insights:", error);
            res.status(500).json({ error: "Failed to generate AI insights.", details: error.message });
        }
    });

    app.listen(port, () => {
        console.log(`HabitForge Advanced Features server listening at http://localhost:${port}`);
        console.log("API endpoint available at http://localhost:4000/api/generate-insights");
    });
}
